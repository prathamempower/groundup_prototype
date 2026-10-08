// GroundUp AI — Core RBAC Types & Hierarchy
// Centralized definitions for Roles, Permissions, Project Tabs, and Memberships

export type Schema2UserRole = 
  | 'OWNER'
  | 'FINANCE'
  | 'PROJECT_MANAGER'
  | 'ACCOUNTANT'
  | 'INVESTOR'
  | 'VIEWER';

export type ExternalParticipantRole = 'GENERAL_CONTRACTOR';

export type GroundUpRole = Schema2UserRole;

export type LegacyUserRole = 
  | 'DEVELOPER_OWNER'
  | 'CFO'
  | 'PM'
  | 'GC_FIXED'
  | 'GC_DAILY';

export type UserRole = Schema2UserRole | ExternalParticipantRole | LegacyUserRole;

export type Permission = 
  // Portfolio & Organization Governance
  | 'portfolio:view'
  | 'organization:manage'
  | 'project:create'
  | 'project:delete'
  | 'project:view_overview'
  | 'project:view_financials'       // Proprietary Pro Forma, Net Profit, Land Cost, Private ROI
  | 'project:settings'              // Stakeholder invites, contract models, integrations
  
  // Underwriting & Deal Lab
  | 'deal_lab:access'
  | 'deal_lab:save_project'
  
  // Budget, Change Orders & Contingency
  | 'budget:view'
  | 'budget:edit'
  | 'change_order:create'
  | 'change_order:approve'
  | 'contingency:view'
  | 'contingency:manage'            // Reallocate from 10% Reserve Contingency to overruns
  
  // Draws & Loan Administration
  | 'draw:view'
  | 'draw:create_packet'            // Compile & submit AIA G702/G703 Draw Packet
  | 'draw:review_queue'             // Audit & review lender draw submissions
  | 'draw:approve_lines'            // Approve / Reject draw line items
  | 'draw:disburse_wire'            // Execute and confirm Fedwire fund transfers
  
  // Field Operations, Milestones & Delays
  | 'milestone:view'
  | 'milestone:log_progress'        // Update physical progress % & township inspection passes
  | 'delay:attribute'               // Root-cause delay tagging & carrying cost allocation
  | 'field_log:create'              // Post GC daily field work reports & receipts
  | 'milestone_claim:submit'        // Submit lump-sum milestone payment claim with photos
  
  // Financial Accounting & Reconciliation
  | 'accounting:recon_matrix'       // View Spend Truth vs Funding Truth reconciliation
  | 'waiver:audit_view'             // View subcontractor lien waiver status
  | 'waiver:audit_manage'           // Upload, verify & remind missing lien waivers
  | 'document:view'                 // View canonical documents repository
  | 'document:upload'               // Upload / Replace canonical source documents
  | 'amex_feed:match'               // Confirm credit card feed transaction matches
  
  // Investor Transparency & Sales
  | 'unit_sales:view'               // View condominium sales and escrow deposits
  | 'unit_sales:edit'               // Update contracts and buyer closing details
  | 'investor:view_waterfall'       // Access Investor Transparency Portal & Debt Waterfall
  | 'investor:download_report'      // Download certified monthly executive PDF
  
  // Lifecycle Stages (Acquisition, Permits, Financing, Recon)
  | 'acquisition:view'
  | 'acquisition:edit'
  | 'permits:view'
  | 'permits:edit'
  | 'financing:view'
  | 'financing:edit'
  | 'recon:view'
  | 'recon:edit'

  // Intelligence
  | 'ai_analyst:query';             // Interact with AI Financial Analyst

export type ActiveNavScreen = 
  | 'portfolio' 
  | 'project-detail' 
  | 'budget' 
  | 'draws' 
  | 'timeline' 
  | 'documents' 
  | 'disposition' 
  | 'deal-lab' 
  | 'alerts' 
  | 'settings' 
  | 'cfo-recon' 
  | 'investor-portal' 
  | 'document-intake' 
  | 'gc-fixed-portal' 
  | 'gc-daily-portal'
  | 'acquisition'
  | 'permits'
  | 'financing'
  | 'recon'
  | 'reports';

export type ProjectTab = 
  | 'overview' 
  | 'acquisition'
  | 'permits'
  | 'financing'
  | 'budget' 
  | 'timeline'
  | 'draws' 
  | 'disposition'
  | 'recon'
  | 'documents' 
  | 'alerts';

export interface ProjectMembership {
  userId: string;
  projectId: string;
  role: UserRole;
  joinedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerUserId: string;
}
