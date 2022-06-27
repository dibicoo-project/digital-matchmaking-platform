import * as introJs from 'intro.js';
import { Step } from 'intro.js';

export const startFirstVisitTour = () => {
  introJs()
    .setOptions({ showBullets: false, showProgress: true, tooltipClass: 'first-visit' })
    .onexit(() => localStorage.setItem('firstVisit', 'no'))
    .onafterchange(el => {
      if (el.classList.contains('menu-button')) {
        const nav = document.querySelector('.mat-sidenav');
        if (!nav.classList.contains('mat-drawer-opened')) {
          el.click();
        }
      }
    })
    .addStep({
      tooltipClass: 'wide',
      intro: `<h2>Welcome!</h2>
      <p>Welcome to Biogas and Gasification Matchmaking Platform!</p>
      <p>Let us introduce the <strong>main sections</strong> of the platform.</p>` })
    .addStep({
      element: '.menu-button',
      intro: 'This button toggles the main <strong>navigation</strong> menu.'
    })
    .addStep({
      element: '.nav-section-companies',
      position: 'right',
      intro: `This section is dedicated to <strong>company profiles</strong> of the leading stakeholders in the 
        biogas and gasification sectors.`
    })
    .addStep({
      element: '.nav-section-bo',
      position: 'right',
      intro: `The <strong>business opportunities</strong> section provides information about counterparties 
        presenting their needs and looking for business cooperation.`
    })
    .addStep({
      element: '.nav-section-knowledge',
      position: 'right',
      intro: 'Biogas and gasification-related <strong>literature sources and factsheets</strong> can be found in this section.'
    })
    .addStep({
      element: '.notification-button',
      intro: 'Your individual <strong>notifications and their settings</strong> are available under the bell sign.'
    })
    .addStep({
      element: '.tour-button',
      intro: 'For more details, please, use the <strong>guided tour button</strong> available on specific pages.',
      scrollTo: 'off',
      position: 'top'
    })
    .addStep({
      tooltipClass: 'wide',
      intro: `Also, take a look at the promotional video to get more insights about the platform:<br>
      <a href="https://www.youtube.com/watch?v=QSV_WaTVpLw" target="blank">https://www.youtube.com/watch?v=QSV_WaTVpLw</a>`,
      scrollTo: 'tooltip' })
    .start();
};

export const enterprisesTour: Step[] = [
  {
    element: '.page-header',
    intro: 'Company explorer provides access to all published companies\' profiles on the Biogas and Gasification Matchmaking Platform.',
    position: 'left'
  },
  {
    element: '.category-list',
    intro: `<p>Companies are organized by categories and sub-categories of their business field.
      Select a specific item to show only the relevant companies.</p>
      <p>Note: companies can belong to multiple categories.</p>`,
    position: 'left'
  },
  {
    element: 'app-enterprise-list-paged',
    intro: 'Company profiles for selected business field are shown in the table below. Select an item to see company details.',
    position: 'top',
    scrollTo: 'tooltip'
  },
  {
    element: '.page-header > .controls > button',
    intro: 'Register your company to include it to the platform database.',
    position: 'left',
    scrollTo: 'tooltip'
  }
];

export const enterpriseTour: Step[] = [
  {
    element: '.page-header > .company-header',
    intro: 'Company header provides general information about the company.'
  },
  {
    element: '.page-content > section:nth-child(1) > p',
    intro: 'Company description provided by the company profile managers.'
  },
  {
    element: '.contacts > app-contact-item',
    intro: 'Company contacts available for the direct communication.'
  },
  {
    element: '.page-header > .controls > button:nth-child(1)',
    intro: 'Send internal message to the company manager'
  },
  {
    element: '.page-header > .controls > button:nth-child(2)',
    intro: 'Click on the star to add the company profile to your personal watchlist!'
  }
];

export const enterpriseMatchmakingTour: Step[] = [
  {
    element: '.page-header',
    intro: 'Company matchmaking allows you to find relevant companies by applying various filters.',
    position: 'left'
  },
  {
    element: '.filter-options',
    intro: `There are available several filter groups.
      Multiple filters can be combined simultaneously to get the most relevant results.`,
    position: 'left'
  },
  {
    element: '.filter-options > .mat-card-content',
    intro: `<p>Filters from the same group are applied as disjunction, e.q. <em>Africa OR Indonesia</em>.</p>
    <p>Filters from different groups are applied as a conjunction, e.g. <em>Anaerobic digestion AND Europe</em>.</p>`,
    position: 'left'
  },
  {
    element: 'app-enterprise-list-paged',
    intro: 'Relevant company profiles are shown in the table below. Select an item to see company details.',
    position: 'top',
    scrollTo: 'tooltip'
  },
  {
    element: '.filter-options > .mat-card-actions > .controls',
    intro: 'Selected filters can be saved for getting automated notifications when new entries match the criteria.',
    position: 'left'
  }
];

export const applicationsTour: Step[] = [
  {
    element: '.page-header',
    intro: `Business opportunities provides access to all published business opportunities on the 
      Biogas and Gasification Matchmaking Platform. 
      It also allows you to find relevant business opportunities by applying various filters.`,
    position: 'left'
  },
  {
    element: '.filter-options',
    intro: `There are available several filter groups.
      Multiple filters can be combined simultaneoursly to get most relevant results.`,
    position: 'left'
  },
  {
    element: '.filter-options > .mat-card-content',
    intro: `<p>Filters from the same group are applied as disjunction, e.q. <em>Africa OR Indonesia</em>.</p>
    <p>Filters from different groups are applied as conjunction, e.g. <em>Anaerobic digestion AND Europe</em>.</p>`,
    position: 'left'
  },
  {
    element: '.result-list',
    intro: 'Relevant business opportunities are shown in the list below. Select an item to see the details.',
    position: 'top',
    scrollTo: 'tooltip'
  },
  {
    element: '.filter-options > .mat-card-actions > .controls',
    intro: 'Selected filters can be saved for getting automated notifications when new entries match the criteria.',
    position: 'left'
  },
  {
    element: '.page-header > .controls > button',
    intro: 'Add your business opportunity to include it to the platform database.',
    position: 'left',
    scrollTo: 'tooltip'
  }
];

export const myCompaniesTour: Step[] = [
  {
    element: '.page-header',
    intro: `My companies provides access to your companies' profiles on the Biogas and Gasification Matchmaking Platform.`,
    position: 'left'
  },

  {
    element: '.controls',
    intro: 'This button can be used to add a new company profile using the wizard.',
    position: 'left'
  },
  {
    element: '.mat-tab-header',
    intro: `Company profiles are organized by their statuses: <br>
      <em>Published</em> versions of the company profiles, and<br>
      <em>Drafts</em> of company profiles being prepared for publishing.`,
    position: 'left'
  },
  {
    element: '.mat-card-actions',
    intro: `<p>Various actions that can be performed with your company profile depnding on its status:</p>
      <p>For <em>published</em> profiles there are available <em>Visit statistics</em> and the option to <em>Unpublish</em> the profile.</p>
      <p><em>Draft</em> profiles can be <em>Edited</em>, <em>Shared</em> with another manager and <em>Deleted</em>.</p>
      `,
    position: 'left'
  }
];

export const addCompaniesTour: Step[] = [
  {
    element: '.page-header',
    intro: 'Copmany profile wizard allows the creation of a new company profile.',
    position: 'left'
  },

  {
    element: '.steps',
    intro: `Six wizard steps are presented here. Some steps are mandatory, but some are optional. 
      It is possible to navigate freely between wizard steps.`,
    position: 'left'
  },

  {
    element: '.mat-card',
    intro: 'Required information can be entered in the main block in each step.',
    position: 'left'
  },

  {
    element: 'footer',
    intro: 'Wizard navigation buttons are placed in the footer.',
    position: 'left'
  },

];

export const shareCompaniesTour: Step[] = [
  {
    element: '.page-header',
    intro: 'Company sharing feature is developed to check active company profile managers and invite additional managers if needed.',
    position: 'left'
  },

  {
    element: '.mat-card',
    intro: `Active company profile managers are shown here. If there are more than one manager it is possible to remove one or 
      leave a company management.`,
    position: 'left'
  },

  {
    element: '.mat-card-content .mat-raised-button',
    intro: 'This button can be used to invite a new company manager.',
    position: 'left'
  },



];

export const myOpportunitiesTour: Step[] = [
  {
    element: '.page-header',
    intro: `My business opportunities provide access to all your business opportunities on the 
      Biogas and Gasification Matchmaking Platform.`,
    position: 'left'
  },

  {
    element: '.controls',
    intro: 'This button can be used to add a new business opportunity using the wizard.',
    position: 'left'
  },
  {
    element: '.mat-tab-header',
    intro: `Business opportunities are organized by their statuses: <br>
      <em>Published</em> versions of the business opportunities, and<br>
      <em>Drafts</em> of business opportunities are being prepared for publishing.`,
  },
  {
    element: 'app-application-card',
    intro: 'Your business opportunities are shown in the list.',
    position: 'left'
  },
  {
    element: 'app-application-card .controls',
    intro: `<p>Various actions that can be performed with your business opportunity depnding on its status:</p>
      <p>For <em>published</em> entries there are available options to <em>View details</em> and to <em>Unpublish</em>
        the business opportunity.</p>
      <p><em>Drafts</em> can be <em>Edited</em> and <em>Deleted</em>.</p>
      `,
    position: 'left'
  },
];

export const addOpportunitiesTour: Step[] = [
  {
    element: '.page-header',
    intro: `Business opportunity wizard allows the creation of a new business opportunity. This Biogas and Gasification Matchmaking 
      Platform section is developed for the individuals or/and companies looking for some service, product or support related 
      to the biogas sector.`,
    position: 'left'
  },

  {
    element: '.steps',
    intro: `The steps depend on a chosen category. Some of the steps are mandatory, but some are optional. 
      It is possible to navigate freely between steps.`,
    position: 'left'
  },

  {
    element: '.mat-card',
    intro: 'Required information can be inserted in the main block in each step.',
    position: 'left'
  },

  {
    element: 'footer',
    intro: 'Wizard navigation buttons are placed in the footer.',
    position: 'left'
  },
];


export const literatureTour: Step[] = [
  {
    element: '.page-header',
    intro: 'This section shows various literature sources about biogas and gasification related topics. ',
    position: 'left'
  },

  {
    element: '.mat-expansion-panel-header',
    intro: `All literature sources are listed by the relevant categories (I-VI). 
      Each category can be expanded to view the specific sources.`,
    position: 'left'
  },
];

export const linksTour: Step[] = [
  {
    element: '.page-header',
    intro: 'This section shows various links and videos about biogas and gasification related topics. ',
    position: 'left'
  },

  {
    element: '.mat-expansion-panel-header',
    intro: `Each category can be expanded to view the specific sources.`,
    position: 'left'
  },
];

export const factsheetsTour: Step[] = [
  {
    element: '.page-header',
    intro: 'This section provides various factsheets about biogas related topics.',
    position: 'left'
  },
  {
    element: 'mat-card-actions > .mat-button',
    intro: 'Factsheets are available for download as PDF files.',
    position: 'left'
  }
];


export const notificationsTour: Step[] = [
  {
    element: '.page-header',
    intro: `This section shows your personal platform notifications. 
      Notifications are sorted by status (unread first) and by date (newest first).
      `,
    position: 'left'
  },
  {
    element: '.page-content > .notification:nth-child(1)',
    intro: 'Depending on the notification type it has different content and action links.',
    // position: 'left'
  },
  {
    element: '.page-header > .controls > button:nth-child(1)',
    intro: `You can enable <em>e-mail</em> notifications from the platform using the settings.`,
    position: 'left'
  },
];
