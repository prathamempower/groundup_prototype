import { PipelineFile } from './pipeline-types';

export function getDefaultPipelineFiles(projectName?: string): PipelineFile[] {
  return [
    {
      fileName: 'Austin_Multifamily_Master_SOV.csv',
      content: `Category,Cost Code,Amount\nPre-construction, Permits & General Requirements,01-100,65000\nSite Work & Underground Utilities,02-100,85000\nFoundation & Concrete Slabs,03-300,240000\nFraming, Lumber & Roof Trusses,06-100,320000\nPlumbing Rough-In & Manifolds,22-000,165000\nElectrical Distribution & Panels,26-000,140000\nDrywall, Insulation & Finishes,09-200,120000\nExterior Stucco & Siding,07-100,95000\nContingency Reserve,00-500,70000\nSubtotal Construction Hard Costs,,1300000`,
    },
    {
      fileName: 'Invoice_Titan_Concrete_Paving.txt',
      content: `Titan Concrete Systems LLC\nInvoice #: INV-2026-9041\nDate: 2026-04-12\nProject: ${projectName || 'Austin Multifamily Phase 1'}\nItem: 03-300 Post-tension foundation slab pour: $185,000.00\nUnconditional Lien Waiver: Attached & Signed\nPrevious Statement Balance: $45,000.00\nNet Current Amount Due: $185,000.00`,
    },
    {
      fileName: 'Invoice_BMC_Lumber_Framing.txt',
      content: `BMC Building Materials & Truss Supply\nInvoice #: INV-2026-9042\nDate: 2026-04-18\nCategory: 06-100 Framing, Lumber & Roof Trusses\nAmount Due: $148,000.00\nProgress: Trusses delivered and 2nd floor framing complete\nLien Waiver: Conditional on payment of $148,000.00`,
    },
  ];
}

export const DEFAULT_SOV_LINES = [
  { costCode: '01-100', category: 'Pre-construction & Permits', amount: 65000 },
  { costCode: '02-100', category: 'Site Work & Utilities', amount: 85000 },
  { costCode: '03-300', category: 'Foundation & Concrete', amount: 240000 },
  { costCode: '06-100', category: 'Framing & Lumber', amount: 320000 },
  { costCode: '22-000', category: 'Plumbing Rough-In', amount: 165000 },
  { costCode: '26-000', category: 'Electrical & Panels', amount: 140000 },
  { costCode: '09-200', category: 'Drywall & Finishes', amount: 120000 },
  { costCode: '07-100', category: 'Exterior & Siding', amount: 95000 },
  { costCode: '00-500', category: 'Contingency Reserve', amount: 70000 },
];
