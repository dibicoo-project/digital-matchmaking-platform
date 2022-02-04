import { allDetails, Application, DetailCode, DetailItem } from '@domain/application-domain';

export interface WizardState {
  steps: WizardStep[];
  activeStepIdx: number;
  application: Application;
  applicationId: string;
  autosaveTs: Date;
  autosaveStatus: 'saving' | 'saved' | 'error';
  detailItems: DetailItem[];
};

export interface WizardStep {
  name: string;
  code: string;
  status: 'valid' | 'invalid';
  isPending: boolean;
  icon: string;
  hidden?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export const allSteps: WizardStep[] = [
  { name: 'Search for', code: 'business', isPending: true, status: 'invalid', icon: 'view_quilt', isFirst: true },
  { name: 'General description', code: 'general', isPending: true, status: 'invalid', icon: 'description' },
  { name: 'Specific details', code: 'details', isPending: true, status: 'invalid', icon: 'list', hidden: true },
  { name: 'Attachments', code: 'attachments', isPending: true, status: 'invalid', icon: 'note_add' },
  { name: 'Contact information', code: 'contacts', isPending: true, status: 'invalid', icon: 'contact_phone' },
  { name: 'Publishing', code: 'publishing', isPending: true, status: 'invalid', icon: 'cloud_done', isLast: true },
];

export const getDetailCodes = (mainCategoryId: string, categoryId: string): DetailCode[] => {
  if (mainCategoryId === '6215111412809728') { // AD turnkey provider
    return ['projectTeamDescription', 'locationDescription',
      'feedstockDescription', 'organizationalAspects', 'financing'];
  }

  switch (categoryId) {
    case '6276259533291520': // Feeding system
    case '5186378094608384': // Pretreatment system
    case '5115214177501184': // Sanitation devices
      return ['feedstockDescription', 'particleSize', 'massFlow'];
    case '6212634558857216': // Digester, tanks
      return ['digesterType', 'volume', 'materialQuality'];
    case '4873569787969536': // Pumps
      return ['volumeFlow', 'particleSize', 'power'];
    case '6236211479838720': // Pipes, valves
      return ['substanceType', 'volumeFlow', 'particleSize'];
    case '5997264732422144': // Blowers
      return ['volumeFlow'];
    case '4856496185671680': // CHP component
      return ['power', 'engineType', 'serviceDescription'];
    case '4901630621253632': // Boiler, Burner
    case '5434314779000832': // Biogas upgrading systems
      return ['volumeFlow', 'componentDescription'];
    case '6312278001451008': // Biogas storage
      return ['volume', 'componentDescription'];
    case '5947308659179520': // Gas analysis
      return ['analysisType', 'mobility'];
    case '4893017399885824': // Digestate treatment and use
      return ['digestrateQuality', 'volumeFlow', 'particleSize'];
    case '5453918721015808': // Digesting additives
    case '6560214685843456': // Other additives
      return ['additivesDescription'];
    case '4889211521990656': // Storage for feedstock and digestate
      return ['materialQuality', 'volume', 'particleSize'];
    case '6284668475277312': // Other components
    case '4807736529256448': // Complete biogas plant
    case '6000713020735488': // Stirrers
      return ['componentDescription'];
    case '4810841857720320': // CHP maintenance
      return ['power', 'engineType', 'serviceDescription'];
    case '6221469642129408': // MRC technology
      return ['componentDescription', 'serviceDescription'];
  }
  return [];
  // return [ ...allDetails.map(d => d.code)];
};



