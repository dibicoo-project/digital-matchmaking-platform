import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import addKeywords from 'ajv-keywords';
import commonSchema from './schemas/common.json';
import enterpriseBeanSchema from './schemas/enterpriseBean.json';
import publicEnterpriseSchema from './schemas/publicEnterprise.json';
import applicationBeanSchema from './schemas/applicationBean.json';
import publicApplicationSchema from './schemas/publicApplication.json';
import enterpriseFilterBeanSchema from './schemas/enterpriseFilterBean.json'
import notificationBeanSchema from './schemas/notificationBean.json';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv, { mode: 'fast', formats: ['date-time', 'uri'] });
addKeywords(ajv, ['transform', 'anyRequired']);
ajv.addSchema(commonSchema);

export const isValidEnterpriseBean = ajv.compile(enterpriseBeanSchema);
export const isValidPublicEnterprise = ajv.compile(publicEnterpriseSchema);
export const isValidApplicationBean = ajv.compile(applicationBeanSchema);
export const isValidPublicApplication = ajv.compile(publicApplicationSchema);
export const isValidEnterpriseFilterBean = ajv.compile(enterpriseFilterBeanSchema);
export const isValidNotificationBean = ajv.compile(notificationBeanSchema);
