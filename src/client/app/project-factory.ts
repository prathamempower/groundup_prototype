import { Project } from '../../shared/types';

export function createProjectFromDeal(dealData: any, userId: string = 'user-dev-1'): Project {
  return {
    id: `proj-${Date.now()}`,
    name: dealData.address.split(',')[0],
    address: dealData.address,
    gc_name: 'Metro Builds LLC',
    gc_contract_model: 'FIXED_PRICE',
    lender_name: 'BCB Community Bank',
    units: dealData.units || 4,
    square_feet: dealData.sqFt || 4200,
    target_budget: dealData.hardCosts || 1350000,
    start_date: 'Nov 1, 2026',
    expected_completion: 'May 30, 2028',
    status: 'ACTIVE',
    created_by_user_id: userId,
    created_at: new Date().toISOString(),
    acquisition_cost: dealData.acquisitionCost || 1100000,
    expected_sale_price: dealData.arv || 3300000,
    contingency_initial: 80000,
    contingency_remaining: 80000,
  };
}

export function createProjectFromOnboardingData(projectId: string, data: any, userId: string = 'user-dev-1'): Project {
  return {
    id: projectId,
    name: data.address?.split(',')[0] || 'Project',
    address: data.address || '',
    gc_name: 'Metro Builds LLC',
    gc_contract_model: 'FIXED_PRICE',
    lender_name: 'BCB Community Bank',
    units: data.units || 4,
    square_feet: data.sqFt || 4200,
    target_budget: data.hardCosts || 1350000,
    start_date: 'Nov 1, 2026',
    expected_completion: 'May 30, 2028',
    status: 'ACTIVE',
    created_by_user_id: userId,
    created_at: new Date().toISOString(),
    acquisition_cost: data.acquisitionCost || 1100000,
    expected_sale_price: data.arv || 3300000,
    contingency_initial: 80000,
    contingency_remaining: 80000,
  };
}

export function createProjectFromFormData(formData: any, userId: string = 'user-dev-1'): Project {
  const estCost = Number(formData.estimatedTotalCost) || 2800000;
  const hardCost = Number(formData.hardCosts) || Math.round(estCost * 0.7);
  const contingency = Math.round(hardCost * ((Number(formData.contingencyPct) || 10) / 100));

  return {
    id: `proj-${Date.now()}`,
    name: formData.projectName || (formData.propertyAddress ? formData.propertyAddress.split(',')[0] : 'New Development'),
    address: formData.propertyAddress || '100 Main St, Jersey City, NJ',
    gc_name: 'Metro Builds LLC',
    gc_contract_model: formData.contractModel || 'FIXED_PRICE',
    lender_name: formData.lenderName || (formData.fundingMethod === 'Cash' ? undefined : 'BCB Community Bank'),
    units: 4,
    square_feet: 4500,
    target_budget: hardCost,
    start_date: formData.acquisitionDate || 'Nov 1, 2026',
    expected_completion: formData.targetCompletionDate || 'May 30, 2028',
    status: 'ACTIVE',
    created_by_user_id: userId,
    created_at: new Date().toISOString(),
    acquisition_cost: Number(formData.acquisitionCost) || 950000,
    expected_sale_price: Math.round(estCost * 1.35),
    contingency_initial: contingency,
    contingency_remaining: contingency,
  };
}
