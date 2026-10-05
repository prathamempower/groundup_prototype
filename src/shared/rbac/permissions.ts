// GroundUp AI — Role-Based Access Control (RBAC) Permission Definitions
// Granular capability-based permissions following the Resource:Action standard

export type Permission = 
  // Portfolio & Project Management
  | 'portfolio:view'
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
  | 'draw:review_queue'             // Construction Lender portal queue
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
  
  // Intelligence
  | 'ai_analyst:query';             // Interact with AI Financial Analyst
