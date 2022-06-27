import { Notification, NotificationIcon, NotificationSource } from './notification.domain';

/* tslint:disable: max-line-length*/

export const firstLogin = (): Notification => ({
  title: 'Welcome to the Biogas and Gasification Matchmaking Platform',
  body: `Welcome to the <strong>Biogas and Gasification Matchmaking Platform</strong>.
    Here you can create your company profile and/or post business oportunities.<br/>
    To easily start your journey please look at the provided user manual.<br/>
    If you wish to receive platform notifications in your e-mail, please proceed to notification settings.<br/>
    We are happy to hear your feedback about the platform features and recommendations of potential imroovements.`,
  icon: NotificationIcon.positive,
  source: NotificationSource.system,
  links: [
    {
      label: 'User manual',
      url: 'https://storage.googleapis.com/dibicoo-matchmaking-tool.appspot.com/DiBiCoo%20platform%20user%20manual.pdf',
      external: true
    },
    { label: 'Notification settings', url: '/user/notifications/settings' },
    { label: 'Contact us', url: '/contact-us' },
    {
      label: 'Send feedback',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSfzwMA99cBBHpYuDhF8GM3hmKMVzc1rNRolhSOjgb3NrWWTrQ/viewform',
      external: true
    }
  ],
  ts: new Date(),
  isRead: false,
  emailSent: false
});

export const companyProfilePublished = (companyId: string, companyName: string): Notification => ({
  title: `${companyName} profile is published`,
  body: `We are happy to inform that <strong>${companyName}</strong> profile is accepted and is published online in the Biogas and Gasification Matchmaking Platform.
  Now any platform user can see the profile and use the contact information you provided for reaching You.`,
  icon: NotificationIcon.positive,
  source: NotificationSource.companyProfile,
  links: [
    { label: 'View public profile', url: `/enterprises/${companyId}` }
  ],
  data: {
    companyId
  },
  ts: new Date(),
  isRead: false,
  emailSent: false
});

export const companyProfileRejected = (companyId: string, companyName: string, reason: string): Notification => ({
  title: `${companyName} profile is rejected`,
  body: `Unfortunately we are forced to inform You that <strong>${companyName}</strong> profile cannot be accepted because of such reason:
    <blockquote>${reason}</blockquote>
    Please update the profile and submit it for the publication again.<br/>
    If you have any questions feel free to contact us.`,
  icon: NotificationIcon.negative,
  source: NotificationSource.companyProfile,
  links: [
    { label: 'View rejected profile', url: `/user/enterprises/${companyId}`, fragment: 'publishing' },
    { label: 'Contact us', url: '/contact-us' }
  ],
  data: {
    companyId
  },
  ts: new Date(),
  isRead: false,
  emailSent: false
});

export const companyProfileUnpublished = (companyId: string, companyName: string, reason: string): Notification => ({
  title: `${companyName} profile is unpublished`,
  body: `Unfortunately we are forced to inform You that <strong>${companyName}</strong> profile is unpublished from the platform 
    with the reason:
    <blockquote>${reason}</blockquote>    
    You are welcome to make changes and afterwards submit it for the publication again.<br/>
    If you have any questions feel free to contact us.`,
  icon: NotificationIcon.negative,
  source: NotificationSource.companyProfile,
  links: [
    { label: 'View unpublished profile', url: `/user/enterprises/${companyId}`, fragment: 'publishing' },
    { label: 'Contact us', url: '/contact-us' }
  ],
  data: {
    companyId
  },
  ts: new Date(),
  isRead: false,
  emailSent: false
});

export const companyMatched = (companyId: string, companyName: string, filterLabel: string): Notification => ({
  title: `New matchmaking entry`,
  body: `We would like to inform you, that company <strong>${companyName}</strong> has matched your pre-defined 
  matchmaking filter labeled as <strong>${filterLabel}</strong>.`,
  icon: NotificationIcon.matchmaking,
  source: NotificationSource.matchmaking,
  links: [
    { label: 'View company profile', url: `/enterprises/${companyId}` },
    { label: 'List saved options', url: `/user/enterprises/matchmaking` },
  ],
  data: {
    companyId
  },
  ts: new Date(),
  isRead: false,
  emailSent: false
});


export const companyProfileOutdated = (companyId: string, companyName: string): Notification => ({
  title: `${companyName} profile is outdated`,
  body: `<p>The profile of your company <strong>${companyName}</strong> seems to be outdated. 
    Unfortunatelly, it has not been updated for <strong>more than a year</strong>.
    We believe you have actual updates to share with the platform users.
    Please, review and update your profile by publishing up-to-date information.</p>
    <p>To maintain high quality of the platform content the administrators may unpublish outdated company profiles.</p>`,
  icon: NotificationIcon.negative,
  source: NotificationSource.companyProfile,
  links: [
    { label: 'Update profile', url: `/user/enterprises/${companyId}` },
    { label: 'Contact us', url: '/contact-us' }
  ],
  data: {
    companyId
  },
  ts: new Date(),
  isRead: false,
  emailSent: false
});


export const applicationPublished = (applicationId: string): Notification => ({
  title: 'Your business opportunity is published',
  body: `We are happy to inform You that Your business opportunity is published online on the Biogas and Gasification Matchmaking Platform.
    Now any platform user can see this business opportunity and use the contact information you provided for contacting You.`,
  icon: NotificationIcon.positive,
  source: NotificationSource.application,
  links: [
    { label: 'All business opportunities', url: `/applications` },
  ],
  data: {
    applicationId
  },
  ts: new Date(),
  isRead: false,
  emailSent: false
});

export const applicationRejected = (applicationId: string, reason: string): Notification => ({
  title: 'Your business opportunity is rejected',
  body: `Unfortunately we are forced to inform You that your business opportunity cannot be published because of such reason:
    <blockquote>${reason}</blockquote>  
    Please update the information and submit it for the publication again.<br/>
    If you have any questions feel free to contact us.`,
  icon: NotificationIcon.negative,
  source: NotificationSource.application,
  links: [
    { label: 'View business opportunity', url: `/user/applications/${applicationId}`, fragment: 'publishing' },
    { label: 'Contact us', url: '/contact-us' }
  ],
  data: {
    applicationId
  },
  ts: new Date(),
  isRead: false,
  emailSent: false
});

export const applicationUnpublished = (applicationId: string, reason: string): Notification => ({
  title: 'Your business opportunity is unpublished',
  body: `Unfortunately we are forced to inform You that your business opportunity is unpublished from the platform
    with the reason:
    <blockquote>${reason}</blockquote>
    You are welcome to make changes and afterwards submit it for the publication again.<br/>
    If you have any questions feel free to contact us.`,
  icon: NotificationIcon.negative,
  source: NotificationSource.application,
  links: [
    { label: 'View business opportunity', url: `/user/applications/${applicationId}`, fragment: 'publishing' },
    { label: 'Contact us', url: '/contact-us' }
  ],
  data: {
    applicationId
  },
  ts: new Date(),
  isRead: false,
  emailSent: false
});

export const applicationMatched = (applicationId: string, filterLabel: string): Notification => ({
  title: `New matchmaking entry`,
  body: `We would like to inform you, that new business opportunity has matched your pre-defined 
    matchmaking filter labeled as <strong>${filterLabel}</strong>.`,
  icon: NotificationIcon.matchmaking,
  source: NotificationSource.matchmaking,
  links: [
    { label: 'View business opportunity', url: `/applications/${applicationId}` },
    { label: 'List saved options', url: `/user/applications/matchmaking` },
  ],
  data: {
    applicationId
  },
  ts: new Date(),
  isRead: false,
  emailSent: false
});

export const applicationMatchedToCompany = (applicationId: string, companyId: string, companyName: string): Notification => ({
  title: `New matchmaking entry`,
  body: `We have found potential business opportunity for your company <strong>${companyName}</strong> 
    based on the categories selected in the company profile.`,
  icon: NotificationIcon.matchmaking,
  source: NotificationSource.matchmaking,
  links: [
    { label: 'View business opportunity', url: `/applications/${applicationId}` },
    { label: 'View matched company', url: `/enterprises/${companyId}` },
  ],
  data: {
    applicationId,
    companyId
  },
  ts: new Date(),
  isRead: false,
  emailSent: false
});

// export const applicationExpiresSoon = (applicationId: string): Notification => ({
//   title: 'Your business application is about to expire',
//   body: `We would like to remind You that Your created business application is about to expire.
//   If it is needed You can change the application due date to prolong the visibility of the application on the platform
//   or leave everything as it is and the application will be unpublished when the due date will be reached.`,
//   icon: NotificationIcon.info,
//   source: NotificationSource.application,
//   links: [
//     { label: 'View application', url: `/user/applications/${applicationId}` }
//   ],
//   data: {
//     applicationId
//   },
//   ts: new Date(),
//   isRead: false,
//   emailSent: false
// });

// export const applicationExpired = (applicationId: string): Notification => ({
//   title: 'Your business application has expired',
//   body: `We would like to inform You that Your business application has expired.
//     If it is needed You can change the application due date to renew the visibility of the application on the platform.`,
//   icon: NotificationIcon.info,
//   source: NotificationSource.application,
//   links: [
//     { label: 'View application', url: `/user/applications/${applicationId}` }
//   ],
//   data: {
//     applicationId
//   },
//   ts: new Date(),
//   isRead: false,
//   emailSent: false
// });

// export const viewStatistics = (visits: number): Notification => ({
//   title: 'View statistics for you company profile',
//   body: `During the last week your company profile was visited ${visits} times.
//   Here is some overview of visitors: [provide statistics]
//   If you did not want to receive such messages please change your preferences on the platform notification section`,
//   icon: NotificationIcon.statistics,
//   source: NotificationSource.statistics,
//   links: [
//     { label: 'View full statistics', url: `/unknown` },
//   ],
//   ts: new Date(),
//   isRead: false,
//   emailSent: false
// });

export const contactMessage = (companyName: string, name: string, email: string, message: string, userName: string): Notification => ({
  title: 'Your company received a new message',
  body: `<strong>${name}</strong> (<a href="mailto:${email}">${email}</a>) is sending the message to your company <strong>${companyName}</strong>: 
  <blockquote>${message}</blockquote>
  Please, use provided e-mail for further communication.`,
  icon: NotificationIcon.matchmaking,
  source: NotificationSource.companyProfile,
  links: [],
  data: {
    userName
  },
  ts: new Date(),
  isRead: false,
  emailSent: false
});

export const adminNotification = (title: string, body: string, links: any[]): Notification => ({
  title,
  body,
  icon: NotificationIcon.info,
  source: NotificationSource.system,
  links: links.map(one => ({ ...one, external: true })),
  ts: new Date(),
  isRead: false,
  emailSent: false
});