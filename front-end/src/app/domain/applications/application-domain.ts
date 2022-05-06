import { Attachment } from '@domain/attachments/attachment.domain';
import { ContactItem, Location } from '@domain/common-domain';

export interface Application {
  id: string;
  mainCategoryId: string;
  categoryId: string;

  description: string;
  location: Location;

  details?: { [key: string]: string | number };
  attachments?: Attachment[];
  companyName?: string;
  webPage?: string;
  contactLocation: Location;
  contacts: ContactItem[];

  dueDate: Date;
  changedTs: Date;
  reports: any[];
  isPublic: boolean;
  pendingReview: boolean;
  rejectReason: string;
}

// Specific details
export type DetailCode = 'projectTeamDescription' | 'feedstockDescription' | 'utilizationDescription' | 'locationDescription' |
  'organizationalAspects' | 'financing' | 'particleSize' | 'massFlow' | 'digesterType' | 'volume' | 'digestrateQuality' |
  'materialQuality' | 'volumeFlow' | 'power' | 'substanceType' | 'engineType' | 'componentDescription' | 'additivesDescription' |
  'serviceDescription' | 'analysisType' | 'mobility';

interface BaseItem {
  code: DetailCode;
  name: string;
  hint?: string;
  hintEx?: string;
}

interface TextItem extends BaseItem {
  type: 'text';
}

interface ShortTextItem extends BaseItem {
  type: 'shortText';
}

interface NumberItem extends BaseItem {
  type: 'number';
  units: string;
}

interface DropdownItem extends BaseItem {
  type: 'dropdown';
  options: string[];
  editable?: boolean;
}

export type DetailItem = TextItem | ShortTextItem | DropdownItem;

export const allDetails: DetailItem[] = [
  {
    code: 'projectTeamDescription', name: 'Project team', type: 'text',
    hint: 'Details about the project team',
    hintEx: `Which companies/organizations are involved in the project development?
      What experience do the involved companies/organizations have in developing biogas projects?
      What is the intention of the involved companies/organizations to realize the project?`
  },
  {
    code: 'feedstockDescription', name: 'Feedstock description', type: 'text',
    hint: 'Relevant details about quality and category of the feedstock',
    hintEx: `What is the name, description and amount of of the feedstock available?
      Is the feedstock supply continuous or seasonal? Is the feedstock available on-site. 
      If not, what is the distance to transport the feedstock to the biogas plant?
      Does it have a cost or concurrency of use (e.g. fodder)?
      Are there gate fees (income for waste treatment)?
      In case the feedstock varies in temporal availability, amount and/or type, please specify by describing: e.g. the amount per year?
      What is the share of the (organic) dry matter, the biogas yield and the methane content of the feedstock? 
      Is there a danger that the feedstock is contaminated, e.g. pathogens, heavy metals, antibiotics, plastic etc.?
      Are there additional sources for feedstock nearby such as other farms, industrial processes with organic residues, canteens etc.?`
  },
  {
    code: 'locationDescription', name: 'Location and infrastructure description', type: 'text',
    hint: 'Details about the project location and its infrastructure',
    hintEx: `Which activities take place at the location?
      What is produced (e.g. crops, animals, milk products, crop processing, food etc.)?
      How many people work/live at the location?
      Are these persons qualified to operate technical machinery or a biogas plant?
      What is the energy demand of the location itself?
      Are there possible new applications for the use of heat, such as drying, heat for animals, heat sinks nearby?
      Are there possibilities for public electricity grid connection? 
      Is there a transformer station on the location and what is its capacity?
      Is there a public gas grid connection?`
  },
  {
    code: 'organizationalAspects', name: 'Logistical and organizational aspects', type: 'text',
    hint: 'Details about logistics and organizational aspects',
    hintEx: `Describe the location regarding area available, access streets, infrastructure already available, 
      electricity connection or distance to the grid.
      Is enough space available for a biogas plant? At the farm/location or nearby (distance)?
      What is the distance to the next village? How many people live in it?
      Is there any energy demand (e.g. heat) in the area close-by?
      Is the farmer interested or willing to cooperate with other farmers nearby to invest into a shared biogas plant?
      Are there already examples for cooperation (e.g. joint infrastructure, transformer station, etc.).
      Is there any agricultural land close-by to spread the digestate? How many hectares (ha)?`
  },
  {
    code: 'financing', name: 'Financing details', type: 'text',
    hint: 'Details about project financing',
    hintEx: `Does the owner already have contact to banks or other financial support organisations?
      Is the financing already secured?
      What are the financial expectations of the project (e.g., return on investment, payback period, WACC etc.)?
      When is the planned commissioning date?`
  },
  { code: 'particleSize', name: 'Particle size', type: 'shortText' },
  {
    code: 'massFlow', name: 'Mass flow', type: 'shortText', hint: 'e.g. in t/d or t/a'
  },
  {
    code: 'digesterType', name: 'Type of digester', type: 'dropdown',
    options: ['Wet digestion, CSTR', 'Plug Flow Digester', 'Dry digestion, batch', 'Lagoon biogas system',
      'Household biogas system', 'I\'m open for all technologies'],
    editable: true
  },
  { code: 'volume', name: 'Volume', type: 'shortText', hint: 'e.g. in m&#x00B3;' },
  { code: 'materialQuality', name: 'Quality of material', type: 'text', hint: 'e.g. stackable or liquid, consistence, particle size etc.' },
  { code: 'volumeFlow', name: 'Volume flow', type: 'shortText', hint: 'e.g. m&#x00B3;/h' },
  { code: 'power', name: 'Power', type: 'shortText', hint: 'e.g. in kWe or kWh' },
  { code: 'substanceType', name: 'Substance type', type: 'dropdown', options: ['Gas', 'Liquid'] },
  {
    code: 'engineType', name: 'Type of engine', type: 'dropdown',
    options: ['Gas spark ignition engine', 'Pilot ignition gas engines'],
    editable: true
  },
  { code: 'digestrateQuality', name: 'Quality of digestrate', type: 'text', hint: 'e.g. dry matter content, particle size' },
  { code: 'componentDescription', name: 'Component descripton', type: 'text', hint: 'Please, specify technology, size, age, etc.' },
  { code: 'additivesDescription', name: 'Additives descripton', type: 'text' },
  { code: 'serviceDescription', name: 'Service descripton', type: 'text' },
  {
    code: 'analysisType', name: 'Type of analysis', type: 'dropdown',
    options: ['Methane', 'Carbon dioxide', 'Oxygen', 'Hydrogen', 'Volume flow']
  },
  {
    code: 'mobility', name: 'Mobility', type: 'dropdown',
    options: ['Stationary', 'Mobile']
  },
];

export const allDetailsObject = Object.fromEntries(allDetails.map(d => [d.code, []]));

