import { injectable } from 'inversify';
import { EnterpriseAdminChangeBean, Enterprise, EnterpriseBean, EnterpriseChangeBean, PublicEnterprise } from './enterprise.domain';
import { DiBiCooPrincipal } from '../security/principal';
import { plainId } from '../utils/transform-datastore-id';
import { notFound, forbidden, validationErrorFn, badRequest } from '../utils/common-responses';
import { EnterpriseRepository, PublicEnterpriseRepository } from './enterprise.repository';
import { StorageService } from '../common/storage.service';
import { GeocodeService } from '../common/geocode.service';
import { NotificationService } from '../notifications/notification.service';
import { companyProfilePublished, companyProfileRejected, contactMessage, companyProfileUnpublished } from '../notifications/notification.templates';
import { isValidEnterpriseBean as isValid, isValidPublicEnterprise } from '../validation/validators';
import { AnalyticsService } from '../analytics/analytics.service';
import { ContactMessage } from '../common/common.domain';
import { MatchmakingFacade } from '../matchmaking/matchmaking.facade';
import { shortText } from '../utils/shortText';

@injectable()
export class EnterpriseService {

  private defaultOrder = (a: Enterprise, b: Enterprise) => a.companyName.localeCompare(b.companyName);

  constructor(private repository: EnterpriseRepository,
    private publicRepository: PublicEnterpriseRepository,
    private storage: StorageService,
    private geocodeService: GeocodeService,
    private notifications: NotificationService,
    private analytics: AnalyticsService,
    private matchmaking: MatchmakingFacade) { }

  private getLogoUrl(entity: Enterprise) {
    return entity.logoId ? this.storage.getLogoUrl(entity.logoId) : undefined;
  }

  private toSimpleBean(item: Enterprise): EnterpriseBean {
    const id: string = plainId(item);
    return {
      id,
      companyName: item.companyName,
      companyProfile: shortText(item.companyProfile, 250),
      location: item.location,
      webPage: item.webPage,
      imageUrl: this.getLogoUrl(item),
      displayOnGlobalMap: item.displayOnGlobalMap,
      latlng: item.latlng,
      categoryIds: item.categoryIds,
      standards: item.standards,
      changedTs: item.changedTs,
      keyProjects: (item.keyProjects || [])
        .map(({ title, showOnMap, location, latlng }) => ({ title, location, showOnMap, latlng } as any)),
      pendingReview: 'pendingReview' in item ? item.pendingReview : undefined
    };
  }

  private toDetailsBean(item: Enterprise): EnterpriseBean {
    return {
      ...this.toSimpleBean(item),
      contacts: item.contacts,
      otherStandards: item.otherStandards,
      keyProjects: item.keyProjects,
      companyProfile: item.companyProfile,
      referenceProjects: item.referenceProjects,
      attachments: item.attachments
    };
  }

  // *** Utils

  public async getOwnEnterprise(id: string, user: DiBiCooPrincipal): Promise<Enterprise> {
    const one = await this.repository.findOne(id);
    if (!one) {
      return Promise.reject(notFound);
    }

    const isOwner = await user.isResourceOwner('enterprise', one);
    const isAdmin = await user.isInRole('admin');
    if (isOwner || isAdmin) {
      return one;
    } else {
      return Promise.reject(forbidden);
    }
  }

  private async getPublicEnterprise(id: string): Promise<PublicEnterprise> {
    const one = await this.publicRepository.findOne(id);
    if (!one) {
      return Promise.reject(notFound);
    }
    return one;
  }

  // *** Public

  public async getPublicEnterprises() {
    const all = await this.publicRepository.findAll();
    return all.sort(this.defaultOrder).map(rec => this.toSimpleBean(rec));
  }

  public async getEnterpriseDetails(id: string): Promise<EnterpriseBean> {
    const entity = await this.getPublicEnterprise(id);
    return this.toDetailsBean(entity);
  }

  public async getLatestEnterprises() {
    const latest = await this.publicRepository.findLatest();
    return latest
      .filter(rec => !!rec.logoId)
      .map(rec => this.toSimpleBean(rec))
      .map(({id, companyName, imageUrl}) => ({id, companyName, imageUrl}));
  }


  // *** Owner

  public async getUserEnterprises(user: DiBiCooPrincipal) {
    const [allDrafts, allPublic] = await Promise.all([
      this.repository.findByOwner(user.userName),
      this.publicRepository.findByOwner(user.userName)
    ]);

    return {
      drafts: allDrafts.sort(this.defaultOrder)
        .map(rec => ({
          ...this.toSimpleBean(rec),
          rejectReason: rec.rejectReason ? true : undefined
        })),
      published: allPublic.sort(this.defaultOrder).map(rec => this.toSimpleBean(rec))
    };
  }

  public async getUserEnterpriseDetails(id: string, user: DiBiCooPrincipal) {
    const entity = await this.getOwnEnterprise(id, user);
    const isPublic = await this.publicRepository.exists(id);

    return {
      ...this.toDetailsBean(entity),
      rejectReason: entity.rejectReason,
      isPublic
    };
  }

  public async addEnterprise(bean: EnterpriseBean, user: DiBiCooPrincipal): Promise<EnterpriseBean> {
    if (!isValid(bean)) {
      return Promise.reject(validationErrorFn(isValid.errors));
    }

    const entity = {
      ...bean,
      changedBy: user.userName,
      changedTs: new Date(),
      owners: [user.userName]
    } as Enterprise;

    const id = await this.repository.insert(entity);
    return { ...this.toDetailsBean(entity), id };
  }

  public async editEnterprise(id: string, bean: EnterpriseBean, user: DiBiCooPrincipal) {
    if (!isValid(bean)) {
      return Promise.reject(validationErrorFn(isValid.errors));
    }

    const entity: Enterprise = await this.getOwnEnterprise(id, user);

    const newEntity: Enterprise = {
      ...entity,
      ...bean,
    };

    newEntity.changedBy = user.userName;
    newEntity.changedTs = new Date();

    await this.repository.update(newEntity, id);
    return this.toDetailsBean(newEntity);
  }


  public async deleteEnterprise(id: string, user: DiBiCooPrincipal): Promise<void> {
    const entity = await this.getOwnEnterprise(id, user);

    if (entity.logoId) {
      await this.storage.deleteLogo(entity.logoId);
    }
    await this.repository.delete(id);
    await this.publicRepository.delete(id);
  }

  public async changeEnterpriseStatus(id: string, bean: EnterpriseChangeBean, user: DiBiCooPrincipal) {
    const one = await this.getOwnEnterprise(id, user);

    if (bean.action === 'publish') {
      if (!isValidPublicEnterprise(one)) {
        return Promise.reject(validationErrorFn(isValidPublicEnterprise.errors))
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

  public async deleteEnterpriseLogo(id: string, user: DiBiCooPrincipal): Promise<void> {
    const entity = await this.getOwnEnterprise(id, user);
    if (entity.logoId) {
      await this.storage.deleteLogo(entity.logoId);
    }
    entity.logoId = undefined;
    await this.repository.update(entity, id);
  }

  public async uploadImage(id: string, file: Express.Multer.File, user: DiBiCooPrincipal): Promise<EnterpriseBean> {
    const entity = await this.getOwnEnterprise(id, user);
    const logoId = await this.storage.uploadLogo(file.buffer);
    entity.logoId = logoId;
    entity.changedBy = user.userName;
    entity.changedTs = new Date();
    await this.repository.update(entity, id);

    return { imageUrl: this.getLogoUrl(entity) } as EnterpriseBean;
  }

  public async getEnterpriseStatistics(id: string, user: DiBiCooPrincipal) {
    const enterprise = await this.getOwnEnterprise(id, user);
    const stat = await this.analytics.getEnterpriseStatistics(id);
    return { companyName: enterprise.companyName, items: stat?.items };
  }


  // *** Admin

  public async getAdminEnterprises(user: DiBiCooPrincipal) {
    await user.checkAdmin();

    const [allPending, allPublic] = await Promise.all([
      this.repository.findPending(),
      this.publicRepository.findAll()
    ]);

    return {
      pending: allPending.sort(this.defaultOrder)
        .map(rec => this.toSimpleBean(rec)),
      published: allPublic.sort(this.defaultOrder)
        .map(rec => ({
          ...this.toSimpleBean(rec),
          reports: rec.reports
        }))
    };
  }

  public async getAdminEnterpriseDetails(id: string, user: DiBiCooPrincipal) {
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

  public async changeAdminEnterpriseStatus(id: string, bean: EnterpriseAdminChangeBean, user: DiBiCooPrincipal) {
    await user.checkAdmin();
    const one = await this.getOwnEnterprise(id, user);

    if (bean.action === 'publish') {
      if (!isValidPublicEnterprise(one)) {
        return Promise.reject(validationErrorFn(isValidPublicEnterprise))
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
      } as PublicEnterprise;

      if (pub.displayOnGlobalMap) {
        pub.latlng = await this.geocodeService.getLatLng(pub.location);
        await Promise.all((pub.keyProjects || [])
          .map(async proj => {
            if (proj.showOnMap) {
              proj.latlng = await this.geocodeService.getLatLng(proj.location);
            }
          })
        );
      }

      await this.publicRepository.upsert(pub, id);
      await this.notifications.add(companyProfilePublished(id, one.companyName), ...one.owners);
      await this.matchmaking.matchEnterpriseToFilters(pub);

    } else if (bean.action === 'reject') {
      one.pendingReview = false;
      one.rejectReason = bean.message;
      one.changedBy = user.userName;
      one.changedTs = new Date();
      await this.repository.update(one, id);
      await this.notifications.add(companyProfileRejected(id, one.companyName, one.rejectReason!), ...one.owners);

    } else if (bean.action === 'unpublish') {
      one.pendingReview = false;
      one.rejectReason = bean.message;
      one.changedBy = user.userName;
      one.changedTs = new Date();
      await this.repository.update(one, id);
      await this.publicRepository.delete(id);
      await this.notifications.add(companyProfileUnpublished(id, one.companyName, one.rejectReason!), ...one.owners);
    }
  }


  // *** Other

  public async sendMessage(id: string, bean: ContactMessage, user: DiBiCooPrincipal) {
    const company = await this.getPublicEnterprise(id);
    await this.notifications.add(
      contactMessage(company.companyName, bean.name, bean.email, bean.message, user.userName),
      ...company.owners);
  }

  public async reportEnterprise(id: string, message: any) {
    if (!message) {
      return Promise.reject(badRequest);
    }

    const entity = await this.getPublicEnterprise(id);
    if (!entity.reports) {
      entity.reports = [];
    }

    entity.reports.push({ ts: new Date(), message });
    await this.publicRepository.update(entity, id);
  }
}
