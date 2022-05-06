import { PublicApplication } from "../applications/application.domain";
import { PublicEnterprise } from "../enterprises/enterprise.domain";

export const SEPARATOR = /[\W_]+/;

export const locationAtField = (fieldName: string) => (obj: any) => Object.values(obj[fieldName] || {}).join();

export const contacts = ({ contacts }: PublicEnterprise | PublicApplication) => {
  //TODO: include accents
  const res = contacts
    .flatMap(c => [
      c.name,
      c.department,
      ...c.elements.flatMap(e => {
        switch (e.type) {
          case 'phone':
            return e.value.replace(/\D/g, '');
          default:
            return e.value;
        }
      })
    ])
    .filter(c => !!c);
  return res.join();
};

export const keyProjects = ({ keyProjects }: PublicEnterprise) =>
  (keyProjects || []).flatMap(p => [p.title, p.description, p.webPage, ...Object.values(p.location)])
    .filter(p => !!p)
    .join();

export const attachments = ({ attachments }: PublicEnterprise | PublicApplication) =>
  (attachments || []).flatMap(p => [p.description, p.fileName])
    .filter(a => !!a)
    .join();

export const details = ({ details }: PublicApplication) => Object.values(details || {}).join();