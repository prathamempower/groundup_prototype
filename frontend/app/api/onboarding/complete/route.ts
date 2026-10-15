import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId = 'user-owner-1', answers = {} } = body;

    const orgName = (answers.organizationName || 'New Venture Partners').trim();
    const projectName = (answers.projectName || '73 Broadway').trim();
    const projectAddress = (answers.projectAddress || '73 Broadway, Brooklyn, NY 11249').trim();
    const projectStage = answers.projectStage || 'IN_CONSTRUCTION';
    const primaryFocus = answers.primaryFocus || answers.primaryChallenge || 'cash_flow';
    
    // Deterministic slugified project ID
    const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const projectId = sanitizedName ? `proj-${sanitizedName}` : `proj-${Date.now()}`;

    const projectData = {
      id: projectId,
      name: projectName,
      project_entity: (answers.projectEntity || `${projectName} LLC`).trim(),
      address: projectAddress,
      lifecycle_stage: projectStage,
      asset_type: answers.assetType || 'MULTIFAMILY',
      contract_model: answers.contractModel || 'COST_PLUS',
      operating_account_model: answers.operatingAccountModel || 'DEDICATED',
      is_acquired: answers.isAcquired || 'true',
      acquisition_funding: answers.acquisitionFunding || 'ACQUISITION_LOAN',
      has_construction_loan: answers.hasConstructionLoan || 'true',
      lender_name: answers.lenderName || undefined,
      status: 'ACTIVE',
      currency: 'USD',
      organization_name: orgName,
      primary_challenge: primaryFocus,
      team_members: answers.teamInvitations || [],
      documents_count: Array.isArray(answers.uploadedDocuments) ? answers.uploadedDocuments.length : 0,
      started_at: answers.startedAt || answers.targetStartDate || undefined,
      target_completion_at: answers.targetCompletionDate || '2025-12-15',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      projectId,
      project: projectData,
      organization: {
        id: `org-${Date.now()}`,
        name: orgName,
      },
      message: 'Workspace provisioned successfully',
    });
  } catch (error) {
    console.error('Error in /api/onboarding/complete:', error);
    return NextResponse.json(
      { error: 'Failed to complete workspace setup' },
      { status: 500 }
    );
  }
}
