import { OnboardingState } from './types';
import { Project } from '../../shared/types';

export function buildCreatedProject(state: OnboardingState, userId: string): Project | null {
  if (state.role === 'OWNER' && state.owner_project_info) {
    const info = state.owner_project_info;
    const activeBudget = state.owner_active_budget;
    const predevBudget = state.owner_predev_budget;
    const lender = state.owner_lender_details;

    const hardCosts = Number(activeBudget?.hardCostBudget?.toString().replace(/[^0-9]/g, '')) ||
                      Number(predevBudget?.estimatedHardCosts?.toString().replace(/[^0-9]/g, '')) ||
                      1820000;

    const acquisition = Number(predevBudget?.acquisitionCost?.toString().replace(/[^0-9]/g, '')) || 1000000;
    const arv = Number(state.owner_disposition_sales?.projectedSales?.toString().replace(/[^0-9]/g, '')) ||
                Number(predevBudget?.targetArv?.toString().replace(/[^0-9]/g, '')) ||
                3250000;

    const contPct = Number(activeBudget?.contingencyPct) || 10;
    const initialContingency = Math.round((hardCosts * contPct) / 100);

    return {
      id: `proj-${Date.now()}`,
      name: info.projectName || info.projectAddress?.split(',')[0] || 'Flagship Development',
      address: info.projectAddress || 'Hoboken, NJ',
      gc_name: state.owner_gc_contract_model === 'DAILY_UPDATES' ? 'Metro Builds LLC (Daily)' : 'K&P Construction',
      gc_contract_model: state.owner_gc_contract_model === 'DAILY_UPDATES' ? 'DAILY_UPDATES' : 'FIXED_PRICE',
      lender_name: lender?.lenderName || (state.owner_financing_type === 'all_equity' ? 'Self-Funded (No Lender)' : 'BCB Community Bank'),
      units: Number(info.units) || 3,
      square_feet: Number(info.squareFeet) || 4800,
      target_budget: hardCosts,
      start_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      expected_completion: 'Dec 15, 2027',
      status: 'ACTIVE',
      created_by_user_id: userId,
      created_at: new Date().toISOString(),
      acquisition_cost: acquisition,
      expected_sale_price: arv,
      contingency_initial: initialContingency,
      contingency_remaining: initialContingency,
    };
  }

  return null;
}
