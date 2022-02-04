import { Datastore } from '@google-cloud/datastore';

function localDatastore() {
  process.env.DATASTORE_DATASET = 'dibicoo-matchmaking-tool';
  process.env.DATASTORE_EMULATOR_HOST = 'localhost:8001';
  process.env.DATASTORE_PROJECT_ID = 'dibicoo-matchmaking-tool';
}

const categories: any[] = [
  {
    title: 'Anaerobic Digestion', importKey: 'ad',
    sub: [
      {
        title: 'Turnkey project provider', importKey: 'ad-turnkey',
        sub: [
          { title: 'Wet digestion, CSTR', importKey: 'ad-wet-digestion-cstr', sub: [] },
          { title: 'Wet digestion, plug flow', importKey: 'ad-wet-digestion-plug-flow', sub: [] },
          { title: 'Dry digestion, batch', importKey: 'ad-dry-digestion-batch', sub: [] },
          { title: 'Dry digestion, plug flow', importKey: 'ad-dry-digestion-plug-flow', sub: [] },
          { title: 'Lagoon biogas system', importKey: 'ad-lagoon', sub: [] },
          { title: 'Household biogas system', importKey: 'ad-household', sub: [] },
        ]
      },
      {
        title: 'Component producer', importKey: 'ad-components',
        sub: [
          { title: 'Feeding system', importKey: 'ad-feeding', sub: [] },
          { title: 'Pretreatment system', importKey: 'ad-pretreatment', sub: [] },
          { title: 'Sanitisation devices', importKey: 'ad-sanitisation', sub: [] },
          { title: 'Digester, tanks', importKey: 'ad-digester', sub: [] },
          { title: 'Pumps', importKey: 'ad-pumps', sub: [] },
          { title: 'Pipes, valves, etc.', importKey: 'ad-pipes', sub: [] },
          { title: 'Blowers', importKey: 'ad-blowers', sub: [] },
          { title: 'Safety equipment, such as flare, failsafe device, etc.', importKey: 'ad-safety-equipment', sub: [] },
          { title: 'Measurement, control and regulation (MCR) techniques', importKey: 'ad-measurement', sub: [] },
          { title: 'CHP component', importKey: 'ad-chp-component', sub: [] },
          { title: 'Boiler / burner', importKey: 'ad-boiler', sub: [] },
          { title: 'Biogas upgrading systems', importKey: 'ad-biogas-upgrading', sub: [] },
          { title: 'Biogas storage', importKey: 'ad-biogas-storage', sub: [] },
          { title: 'Gas analysis', importKey: 'ad-analysis', sub: [] },
          { title: 'Digestate treatment and use', importKey: 'ad-digestate-use', sub: [] },
          { title: 'Digesting additives', importKey: 'ad-digesting-additives', sub: [] },
          { title: 'Other additives', importKey: 'ad-other-additives', sub: [] },
          { title: 'Storage, for feedstock and digestate', importKey: 'ad-storage', sub: [] },
          { title: 'Other components', importKey: 'ad-other-components', sub: [] },
        ]
      },
      {
        title: 'Services / Technical experts', importKey: 'ad-services',
        sub: [
          { title: 'Project developer', importKey: 'ad-project-developer', sub: [] },
          { title: 'Planning', importKey: 'ad-planning', sub: [] },
          {
            title: 'Consultant', importKey: 'ad-consultant',
            sub: [
              { title: 'Biogas expert', importKey: 'ad-biogas-expert', sub: [] },
              { title: 'Business consultant', importKey: 'ad-business-consultant', sub: [] },
              { title: 'Finance', importKey: 'ad-finance', sub: [] },
              { title: 'PPA', importKey: 'ad-ppa', sub: [] },
            ]
          },
          { title: 'Environment', importKey: 'ad-environment', sub: [] },
          { title: 'Biology', importKey: 'ad-biology', sub: [] },
          { title: 'Safety', importKey: 'ad-safety', sub: [] },
          { title: 'Electricity', importKey: 'ad-electricity', sub: [] },
          { title: 'Other services', importKey: 'ad-other-services', sub: [] },
        ]
      },
      {
        title: 'Maintenance provider', importKey: 'ad-maintenance', sub: [
          { title: 'Complete biogas plant', importKey: 'ad-biogas-plant', sub: [] },
          { title: 'CHP maintenance', importKey: 'ad-chp-maintenance', sub: [] },
          { title: 'MRC technology', importKey: 'ad-mrc', sub: [] },
          { title: 'Stirrers', importKey: 'ad-stirrers', sub: [] },
          { title: 'Other maintenance', importKey: 'ad-other-maintenance', sub: [] },
        ]
      },
      /* {
         title: 'Facilitators', importKey: 'ad-facilitators', sub: [
           { title: 'Political institutions', importKey: 'Political institutions', sub: [] },
           { title: 'Biogas and RE associations', importKey: 'Biogas and RE associations', sub: [] },
           { title: 'Development organisations', importKey: 'Development organisations', sub: [] },
           { title: 'Research institutions', importKey: 'Research institutions', sub: [] },
           { title: 'Trade chambers', importKey: 'Trade chambers', sub: [] },
         ]
       }
     */
    ]
  },
  {
    title: 'Gasification', importKey: 'gas', sub: [
      {
        title: 'Turnkey system provider', importKey: 'gas-turnkey', sub: [
          { title: 'Fixed bed gasifier', importKey: 'gas-fixed-bed-gasifier', sub: [] },
          { title: 'Fluidised bed gasifier', importKey: 'gas-fluidised-bed-gasifier', sub: [] },
          { title: 'Entrained flow gasifier', importKey: 'gas-entrained-flow-gasifier', sub: [] },
          { title: 'Hydrothermal gasification', importKey: 'gas-hydrothermal-gasification', sub: [] },
          { title: 'Feedstock, wood pellets', importKey: 'gas-feedstock-wood-pellets', sub: [] },
          { title: 'Feedstock, mixed biomass pellets', importKey: 'gas-feedstock-mixed-pellets', sub: [] },
          { title: 'Feedstock, wood chips', importKey: 'gas-feedstock-wood-chips', sub: [] },
          { title: 'Feedstock, other', importKey: 'gas-feedstock-other', sub: [] },
          { title: 'Size, up to 100 kWe', importKey: 'gas-size-below-100kWe', sub: [] },
          { title: 'Size, between 100 and 1000 kWe', importKey: 'gas-size-below-1000kWe', sub: [] },
          { title: 'Size, above 1 MWe', importKey: 'gas-size-above-1MWe', sub: [] },
        ]
      },
      {
        title: 'Component producer', importKey: 'gas-components', sub: [
          { title: 'Storage system', importKey: 'gas-storage', sub: [] },
          { title: 'Feedstock conveying system', importKey: 'gas-feedstock-conveying', sub: [] },
          { title: 'Pretreatment system (shredding, drying, etc)', importKey: 'gas-pretreatment', sub: [] },
          { title: 'Gasifier, fixed bed', importKey: 'gas-gasifier-fixed-bed', sub: [] },
          { title: 'Gasifier, fluidised bed', importKey: 'gas-gasifier-fluidised-bed', sub: [] },
          { title: 'Blowers', importKey: 'gas-blowers', sub: [] },
          { title: 'Gasifier, entrained flow gasifyer', importKey: 'gas-gasifier-entrained-flow', sub: [] },
          { title: 'Hydrothermal Gasifer', importKey: 'gas-hydrothermal-gasifer', sub: [] },
          { title: 'Safety equipment', importKey: 'gas-safety-equipment', sub: [] },
          { title: 'Measurement, control and regulation (MCR) techniques', importKey: 'gas-measurement', sub: [] },
          { title: 'Gas analysis', importKey: 'gas-analysis', sub: [] },
          { title: 'Biogas use, CHP', importKey: 'gas-biogas-use-chp', sub: [] },
          { title: 'Biogas use, boiler/burner', importKey: 'gas-biogas-use-boiler', sub: [] },
          { title: 'Biogas upgrading systems', importKey: 'gas-biogas-upgrading', sub: [] },
          { title: 'Biogas use, conversion to liquid biofuel', importKey: 'gas-biogas-use-conversion', sub: [] },
          { title: 'Charcoal treatment', importKey: 'gas-charcoal-treatment', sub: [] },
          { title: 'Charcoal use', importKey: 'gas-charcoal-use', sub: [] },
          { title: 'Other components', importKey: 'gas-other-components', sub: [] },
        ]
      },
      {
        title: 'Services / Technical experts', importKey: 'gas-services', sub: [
          { title: 'Project developer', importKey: 'gas-project-developer', sub: [] },
          { title: 'Planning', importKey: 'gas-planning', sub: [] },
          { title: 'Consultant', importKey: 'gas-consultant', sub: [] },
          { title: 'Maintenance provider', importKey: 'gas-maintenance-provider', sub: [] },
          { title: 'Environment', importKey: 'gas-environment', sub: [] },
          { title: 'Safety', importKey: 'gas-safety', sub: [] },
          { title: 'Electricity', importKey: 'gas-electricity', sub: [] },
          { title: 'Other services', importKey: 'gas-other-services', sub: [] },
        ]
      },
      {
        title: 'Facilitators', importKey: 'gas-facilitators', sub: [
          { title: 'Political institutions', importKey: 'gas-political-institutions', sub: [] },
          { title: 'Biogas and RE associations', importKey: 'gas-associations', sub: [] },
          { title: 'Research institutions', importKey: 'gas-research-institutions', sub: [] },
          { title: 'Development organisations', importKey: 'gas-development-organisations', sub: [] },
          { title: 'Trade chambers', importKey: 'gas-trade-chambers', sub: [] },
          { title: 'Other facilitators', importKey: 'gas-other-facilitators', sub: [] },
        ]
      },
    ]
  }
];

async function doImport(all: any[]) {
  const datastore = new Datastore();
  const [existingCategories] = await datastore.createQuery('category').run();

  const toEntity = (item: any, idx: number, parents: any[]) => {
    return {
      title: item.title,
      parentId: parents[parents.length - 1] || null,
      ancestors: [...parents],
      importKey: item.importKey,
      changedTs: new Date(),
      changedBy: 'imported',
      order: idx
    };
  };

  const toUpserts = (list: any[], parents: any[]): Array<any> => {
    return list.flatMap((item, idx) => {
      const existing = existingCategories.find(cat => cat.importKey === item.importKey);      
      const key = existing ? existing[Datastore.KEY] : datastore.key('category');

      return [
        { key, data: toEntity(item, idx, parents) },
        ...toUpserts(item.sub, [...parents, key.id])
      ];
    });
  };

  await datastore.upsert(toUpserts(all, [])).catch(err => console.log(err));  
}

localDatastore();
doImport(categories).then(() => console.log('Done!'));
