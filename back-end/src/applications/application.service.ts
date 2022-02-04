import { injectable } from 'inversify';
import { DiBiCooPrincipal } from '../security/principal';
import { plainId } from '../utils/transform-datastore-id';
import { notFound, badRequest, forbidden, validationErrorFn } from '../utils/common-responses';
import { ApplicationRepository, PublicApplicationRepository } from './application.repository';
import { ApplicationBean, Application, PublicApplication, ApplicationChangeBean, ApplicationAdminChangeBean } from './application.domain';
import moment from 'moment';
import { NotificationService } from '../notifications/notification.service';
import { applicationPublished, applicationRejected, applicationUnpublished } from '../notifications/notification.templates';
import { isValidApplicationBean as isValid, isValidPublicApplication } from '../validation/validators';
import { MatchmakingFacade } from '../matchmaking/matchmaking.facade';

@injectable()
export class ApplicationService {

  constructor(private repository: ApplicationRepository,
    private publicRepository: PublicApplicationRepository,
    private notifications: NotificationService,
    private matchmaking: MatchmakingFacade) { }

  private appOrder = (a: Application, b: Application) => a.changedTs < b.changedTs ? 1 : -1;

  private toSimpleBean(item: Application | PublicApplication): ApplicationBean {
    const id: string = plainId(item);
    return {
      id,
      mainCategoryId: item.mainCategoryId,
      categoryId: item.categoryId,
      description: item.description,
      location: item.location,
      dueDate: item.dueDate,
      changedTs: item.changedTs,
      pendingReview: 'pendingReview' in item ? item.pendingReview : undefined
    };
  }

  private toDetailsBean(item: Application | PublicApplication): ApplicationBean {
    return {
      ...this.toSimpleBean(item),
      details: item.details,
      attachments: item.attachments,
      companyName: item.companyName,
      contactLocation: item.contactLocation,
      contacts: item.contacts
    };
  }

  private async getOwnApplication(id: string, user: DiBiCooPrincipal) {
    const one = await this.repository.findOne(id);
    if (!one) {
      return Promise.reject(notFound);
    }

    const isOwner = await user.isResourceOwner('application', one);
    const isAdmin = await user.isInRole('admin');
    if (isOwner || isAdmin) {
      return one;
    } else {
      return Promise.reject(forbidden);
    }
  }

  public async getUserApplications(user: DiBiCooPrincipal) {
    const [allDrafts, allPublic] = await Promise.all([
      this.repository.findByOwner(user.userName),
      this.publicRepository.findByOwner(user.userName)
    ]);

    return {
      drafts: allDrafts.sort(this.appOrder)
        .map(rec => ({
          ...this.toSimpleBean(rec),
          rejectReason: rec.rejectReason ? true : undefined
        })),
      published: allPublic.filter(rec => moment().isSameOrBefore(rec.dueDate))
        .sort(this.appOrder)
        .map(rec => this.toSimpleBean(rec))
    };
  }

  public async getUserApplicationDetails(id: string, user: DiBiCooPrincipal): Promise<ApplicationBean> {
    const entity = await this.getOwnApplication(id, user);
    const isPublic = await this.publicRepository.exists(id);

    return {
      ...this.toDetailsBean(entity),
      rejectReason: entity.rejectReason,
      isPublic
    };
  }

  public async addApplication(bean: ApplicationBean, user: DiBiCooPrincipal): Promise<ApplicationBean> {
    if (!isValid(bean)) {
      return Promise.reject(validationErrorFn(isValid.errors));
    }

    const entity: Application = {
      ...bean as Application,
      changedBy: user.userName,
      changedTs: new Date(),
      owners: [user.userName]
    };

    const id = await this.repository.insert(entity);
    return { ...this.toDetailsBean(entity), id };
  }

  public async editApplication(id: string, bean: ApplicationBean, user: DiBiCooPrincipal) {
    if (!isValid(bean)) {
      return Promise.reject(validationErrorFn(isValid.errors));
    }

    const entity = await this.getOwnApplication(id, user);
    const newEntity = {
      ...entity,
      ...bean,
      changedBy: user.userName,
      changedTs: new Date()
    };

    await this.repository.update(newEntity, id);
    return this.toDetailsBean(newEntity);
  }

  public async deleteApplication(id: string, user: DiBiCooPrincipal): Promise<void> {
    await this.getOwnApplication(id, user);
    await this.repository.delete(id);
    await this.publicRepository.delete(id)
  }

  public async changeApplicationStatus(id: string, bean: ApplicationChangeBean, user: DiBiCooPrincipal) {
    const one = await this.getOwnApplication(id, user);

    if (bean.action === 'publish') {
      if (!isValidPublicApplication(one)) {
        return Promise.reject(validationErrorFn(isValidPublicApplication))
      }
      one.pendingReview = true;
      one.changedBy = user.userName;
      one.changedTs = new Date();
      await this.repository.update(one, id);
    } else if (bean.action === 'unpublish') {
      one.pendingReview = false;
      one.changedBy = user.userName;
      one.changedTs = new Date();
      await this.repository.update(one, id);
      await this.publicRepository.delete(id);
    }
  }

  private async getPublicApplication(id: string) {
    const one = await this.publicRepository.findOne(id);
    if (!one || moment().isAfter(one.dueDate)) {
      return Promise.reject(notFound);
    } else {
      return one;
    }
  }

  public async getPublicApplications() {
    const all = await this.publicRepository.findAll();
    return all.sort(this.appOrder).map(rec => this.toSimpleBean(rec));
  }

  public async getPublicApplicationDetails(id: string) {
    const entity = await this.getPublicApplication(id);
    return this.toDetailsBean(entity);
  }

  public async reportApplication(id: string, message: string): Promise<void> {
    if (!message) {
      return Promise.reject(badRequest);
    }

    const entity = await this.getPublicApplication(id);
    if (!entity.reports) {
      entity.reports = [];
    }

    entity.reports.push({ ts: moment().toDate(), message });
    await this.publicRepository.update(entity, id);
  }

  public async getAdminApplications(user: DiBiCooPrincipal) {
    await user.checkAdmin();

    const [allPending, allPublic] = await Promise.all([
      this.repository.findPending(),
      this.publicRepository.findAll()
    ]);

    return {
      pending: allPending.sort(this.appOrder)
        .map(rec => this.toSimpleBean(rec)),
      published: allPublic.sort(this.appOrder)
        .map(rec => ({
          ...this.toSimpleBean(rec),
          reports: rec.reports
        }))
    };
  }

  public async getAdminApplication(id: string, user: DiBiCooPrincipal) {
    await user.checkAdmin();

    const [pending, published] = await Promise.all([
      this.repository.findOne(id),
      this.publicRepository.findOne(id)
    ]);

    if (!pending) {
      return Promise.reject(notFound);
    }

    return {
      pending: this.toDetailsBean(pending),
      published: published ? this.toDetailsBean(published) : undefined
    };
  }

  public async changeAdminApplicationStatus(id: string, bean: ApplicationAdminChangeBean, user: DiBiCooPrincipal) {
    await user.checkAdmin();
    const one = await this.getOwnApplication(id, user);

    if (bean.action === 'publish') {
      if (!isValidPublicApplication(one)) {
        return Promise.reject(validationErrorFn(isValidPublicApplication))
      }
      one.pendingReview = false;
      one.rejectReason = undefined;
      one.changedBy = user.userName;
      one.changedTs = new Date();
      await this.repository.update(one, id);

      const pub = {
        ...one,
        pendingReview: undefined,
        rejectReason: undefined,
        reports: []
      } as PublicApplication;
      await this.publicRepository.upsert(pub, id);
      await this.notifications.add(applicationPublished(id), ...one.owners);
      await this.matchmaking.matchApplicationToFilters(pub);
      await this.matchmaking.matchApplicationToEnterprises(pub);

    } else if (bean.action === 'reject') {
      one.pendingReview = false;
      one.rejectReason = bean.message;
      one.changedBy = user.userName;
      one.changedTs = new Date();
      await this.repository.update(one, id);
      await this.notifications.add(applicationRejected(id, one.rejectReason!), ...one.owners);

    } else if (bean.action === 'unpublish') {
      one.pendingReview = false;
      one.rejectReason = bean.message;
      one.changedBy = user.userName;
      one.changedTs = new Date();
      await this.repository.update(one, id);
      await this.publicRepository.delete(id);
      await this.notifications.add(applicationUnpublished(id, one.rejectReason!), ...one.owners);
    }
  }
}
