import { Step } from 'intro.js';

export const enterprisesTour: Step[] = [
  {
    element: '.page-header',
    intro: 'Company explorer provides an access to all published companies profiles on the Biogas and Gasification Matchmaking Platform.',
    position: 'left'
  },
  {
    element: '.category-list',
    intro: `Companies are organized by categories and sub-categories of their business field.
      Select specific item to show only the relevant companies.<br>
      Note: companies can belong to multiple categories.`,
    position: 'left'
  },
  {
    element: 'app-enterprise-list-paged',
    intro: 'Company profiles for selected business field are shown in the table below. Select an item to see company details.',
    position: 'top',
    scrollTo: 'tooltip'
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

export const applicationTour: Step[] = [
  {
    element: '.page-header',
    intro: 'Business opportunities provides an access to all published business opportunities on the Biogas and Gasification Matchmaking Platform.',
    position: 'left'
  }

];


export const myCompaniesTour: Step[] = [
  {
    element: '.page-header',
    intro: 'My companies provides an access to all own companies profiles on the Biogas and Gasification Matchmaking Platform.',
    position: 'left'
  },

  {
    element: '.controls',
    intro: 'This button can be used to add a new company profile using the wizard.',
    position: 'left'
  },

  {
    element: '.mat-tab-header',
    intro: 'Company profiles are splitted by their statuses: Published, Pending, Drafts, Rejected.',
    position: 'left'
  },

  {
    element: 'app-enterprise-card',
    intro: 'Own company profiles are shown here.',
    position: 'left'
  },

  {
    element: '.mat-card-actions',
    intro: 'Actions that can be done with the own company profile are: Edit the profile, View statistics, Share the profile and deletion of the profile.',
    position: 'left'
  }

];

export const addCompaniesTour: Step[] = [
  {
    element: '.page-header',
    intro: 'Copmany profile wizard allows creation of a new company profile.',
    position: 'left'
  },

  {
    element: '.steps',
    intro: 'Six wizard steps are presented here. Some steps are mandatory, but some are optional. It is possible to navigate freely between wizard steps.',
    position: 'left'
  },

  {
    element: '.mat-card',
    intro: 'Required information can be inserted in the main block in each step.',
    position: 'left'
  },

  {
    element: 'footer',
    intro: 'Wizard navigation buttions are placed in the footer.',
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
    intro: 'Active company profile managers are shown here. If there are more than one manager it is possible to remove one or leave a company management',
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
    intro: 'My business opportunities provides an access to all own business opoortunities on the Biogas and Gasification Matchmaking Platform.',
    position: 'left'
  },

  {
    element: '.controls',
    intro: 'This button can be used to add a new business opportunity using the wizard.',
    position: 'left'
  },

  {
    element: '.mat-tab-header',
    intro: 'Business opportunities are splitted by their statuses: Published, Drafts, Expired',
    position: 'left'
  },

  {
    element: 'app-application-card',
    intro: 'Own business opportunities are shown here.',
    position: 'left'
  },

  {
    element: 'app-application-card .controls',
    intro: 'Actions that can be done with the own business opportunities are: Edit and Delete.',
    position: 'left'
  }

];

export const addOpportunitiesTour: Step[] = [
  {
    element: '.page-header',
    intro: 'Business opportunity wizard allows creation of a new business opportunity. This Biogas and Gasification Matchmaking Platform section is developed for the individuals or/and companies looking for some service, product or support related to the biogas sector.',
    position: 'left'
  },

  {
    element: '.steps',
    intro: 'Number of steps depends on a chosen category. Some of the steps are mandatory, but some are optional. It is possible to navigate freely between steps.',
    position: 'left'
  },

  {
    element: '.mat-card',
    intro: 'Required information can be inserted in the main block in each step.',
    position: 'left'
  },

  {
    element: 'footer',
    intro: 'Wizard navigation buttions are placed in the footer.',
    position: 'left'
  },

];


export const literatureTour: Step[] = [
  {
    element: '.page-header',
    intro: 'This section shows various literature sources about biogas related topics. ',
    position: 'left'
  },

  {
    element: '.mat-expansion-panel-header',
    intro: 'All literature sources are spliited by the relevant categories (I-VII). Each category can be expanded to view the specific sources.',
    position: 'left'
  },

  // {
  //   element: '.mat-card',
  //   intro: 'Literature source can be viewed by clicking on a cover image or "View PDF" icon.',
  //   position: 'left'
  // },


];