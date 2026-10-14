05/10/2026, 16:38 ☰ GroundUp AI: Product Requirements & Technical
Architecture Specification GroundUp AI Specification ENTERPRISE
SPECIFICATION SUITE Live ERD Explorer (28 Tables) 🌓 Theme PRD • TRD •
ERD • SYSTEM ARCHITECTURE GroundUp AI Enterprise Specification Product
Requirements Document (PRD) & Technical Requirements Document (TRD) for
Developer-Side Financial Visibility, Automated Draw Processing, and
Construction Risk Attribution. DOCUMENT IDENTIFIER PRODUCT NAME
PRD-TRD-GROUNDUP-2026-V2.2 GroundUp AI Enterprise Platform STATUS &
MATURITY PRIMARY CONTROL LAYER PRODUCTION ARCHITECTURE Real Estate
Developer / Project Sponsor BENCHMARK ASSETS REGULATORY COMPLIANCE 73
Broadway, 392 1st St, 161 Woodlawn Cal. Civ. Code §§ 8132-8138 \| AIA
G702 / G703 STRATEGIC VISION Executive Summary and Problem Statement
GroundUp AI helps real estate developers know where every dollar is
going, where every delay is coming from, and whether project profit is
at risk. It is the owner-side control layer for financial visibility,
draw tracking, delay attribution, and profit-risk reporting. The Core
Industry Problem Mid-market real estate developers managing \$5M to
\$50M projects face fragmented, disconnected data. Construction budgets,
field progress photos, bank loan draw packages, and accounting
spreadsheets exist in separate silos. Project sponsors frequently
discover cost overruns and loan interest escalation 60 to 90 days after
trade contractors incur the expense. This lag erodes project
profitability and threatens loan covenants. The GroundUp AI Solution
GroundUp AI provides a continuous financial operating system. By
harmonizing automated Document AI extraction, multi-source bank
reconciliation, and timestamped field verification, GroundUp maintains
Four Synchronized Truths: Budget Truth, Spend Truth, Progress Truth, and
Funding Truth. Developers, finance controllers, and capital partners
gain real-time visibility into forecast at completion, loan interest
burn, and realized investor returns. https://prdtrd.vercel.app 1/35
05/10/2026, 16:38 GroundUp AI: Product Requirements & Technical
Architecture Specification KEY PERFORMANCE INDICATORS GroundUp AI
Specification Live ERD Explorer (28 Tables) Business Goals and
Operational Objectives Practical, real-world operational benchmarks
designed for ground-up construction management. 1. Draw Package
Turnaround Same-Day (vs weeks of manual prep) Assemble audit-ready AIA
G702/G703 draw packages with verified invoices, retainage ledgers, and
lien waivers in hours rather than weeks of manual compilation. 2.
Document Ingestion Efficiency Automated (with human review) Extract line
items, vendor details, and amounts across any document format or ZIP
archive, reducing manual invoice entry while keeping human review in the
loop. 3. Lien & Title Risk Prevention Proactive (statutory protection)
Track California Civil Code Section 8132 and 8134 conditional and
unconditional lien waivers alongside every payment to protect against
mechanics liens and title disputes. STAKEHOLDER CONSENSUS 1. Roles at a
Glance and Stakeholder Architecture Role definitions finalized for the
owner-side control layer. The owner decides which general contractor
workflow applies to each development project. PLATFORM ACCESS LEVEL ROLE
TYPE MAIN RESPONSIBILITY Owner / Developer INTERNAL Provides all
documents, chooses the GC and GC type, approves change orders, tracks
missing items, builds the draw packet, shares investor previews. FULL
ACCESS CFO / Accounting INTERNAL Provides the expense sheet, matches
expenses to budget lines, reconciles draws, exports variance reports.
FINANCIAL MODULES https://prdtrd.vercel.app 2/35 05/10/2026, 16:38
GroundUp AI: Product Requirements & Technical Architecture Specification
PLATFORM ROLE Live ERD Explorer (28 Tables)ACCESS LEVEL GroundUp AITYPE
Specification MAIN RESPONSIBILITY Project Manager INTERNAL Updates
milestones, logs inspection status, tracks delay sources and carry
costs. TIMELINE & EVIDENCE Investor / Partner EXTERNAL Views project
health, next funding event, and monthly update. Read-only summaries
without subcontractor-level detail. READ-ONLY GC (Fixed Contract)
EXTERNAL Submits milestone claims, completion proof, and change orders.
Paid on milestone completion without exposing subcontractor bills.
LIMITED SUBMISSION GC (Daily Updates) EXTERNAL Posts daily updates,
invoices and costs, daily photos, and change orders. Openbook tracking
with GC markup displayed separately. LIMITED SUBMISSION Governance Rule:
Ownership of Administrative Work The owner decides which GC type applies
to each project. Admin or coordinator work (collecting documents,
tracking missing items, building the draw packet) belongs to the owner.
In v1, the general contractor is an input source rather than the primary
customer. Architectural Principle: Why the Lender Distinction Matters
The construction lender is intentionally designed not to be an active
interactive platform user initially. Instead, GroundUp receives and
ingests lender data. Commercial banks operate behind strict IT firewalls
and compliance protocols. Forcing a loan officer to register a user
account, remember another password, and log into a third-party software
creates friction and delays draw approvals. GroundUp treats the lender
as an external inbound data source (ingesting loan approvals, inspection
waivers, and Columbia Bank draw statements) and an outbound delivery
target (producing fully audit-ready AIA G702/G703 draw packages). This
guarantees immediate adoption without waiting for bank IT approvals.
FUNCTIONAL SCOPE 2. Scope Prioritization and User Stories Functional
breakdown categorized by MoSCoW prioritization and engineering priority
tiers. https://prdtrd.vercel.app 3/35 05/10/2026, 16:38 GroundUp AI:
Product Requirements & Technical Architecture Specification ID GroundUp
PERSONA USER STORY AI Specification ACCEPTANCE MOSCOW TIER(28 Tables)
Live ERD Explorer CRITERIA US01 Owner / Developer As a Developer, I want
to view my live project profit and forecast at completion, so I can
detect cost overruns before they erode my equity. Must Have P1 Executive
dashboard displays baseline pro forma, actual spend, remaining budget,
daily interest carry, and dynamic forecast profit. US02 CFO / Accounting
As a CFO, I want invoices, receipts, and draw packets in any format
automatically ingested and matched to budget lines, so I can eliminate
manual data entry. Must Have P1 Document AI automatically unpacks ZIP
archives and extracts vendor, date, line items, gross amount, and
retainage with split-screen human review. US03 Owner / Developer As an
Owner, I want to assemble draw applications with attached lien waivers,
so our contractors get paid without administrative delays. Must Have P1
System bundles approved invoices, checks California Civil Code Section
8132 waivers, and generates AIA G702/G703 PDF packets. US04 Project
Manager As a Project Manager, I want to upload photos and municipal
inspection cards from my phone, so field work is immediately verified
for draw release. Must Have P1 Mobile app uploads geotagged, timestamped
site photos linked directly to specific milestone cost codes. US05
Investor / Partner As an Investor, I want to view my invested capital
balance and expected return, so I have transparent oversight without
emailing the sponsor. Should Have P2 Investor portal displays equity
deployed, project progress percentage, quarterly distribution forecasts,
and photo proof. US06 CFO / Accounting As a CFO, I want corporate credit
card charges and bank transfers matched to Should Have P2 Automated bank
reconciliation engine matches bank wires and corporate card
https://prdtrd.vercel.app 4/35 05/10/2026, 16:38 GroundUp AI: Product
Requirements & Technical Architecture Specification ACCEPTANCE MOSCOW
TIER(28 Tables) Live ERD Explorer CRITERIA ID GroundUp PERSONA USER
STORY AI Specification invoices, so every penny is reconciled. US07
Owner / Developer charges to verified invoice line items. As an Owner, I
want to simulate schedule delay impacts on loan interest, so I can make
informed trade acceleration decisions. Could Have P3 Interactive slider
computes daily loan interest burn and revised investor IRR based on days
of construction delay. INDUSTRY COMPLIANCE 3. U.S. Construction Market
Assumptions Configurable financial and statutory parameters reflecting
real-world American commercial and residential construction standards.
PARAMETER STANDARD BASELINE STATUTORY / INDUSTRY SOURCE PLATFORM
IMPLEMENTATION LOGIC Retainage Withholding 10.0% standard (5.0% post-50%
completion) AIA Document A201 § 9.3.1 Deducted from gross invoice
amounts; tracked in a separate retainage liability ledger until final
certificate of occupancy. Payment Applications AIA G702 / G703 Master
Format American Institute of Architects Standardized application and
certificate for payment with continuation sheets mapped to CSI
MasterFormat divisions. Progress Lien Waiver (Conditional) California
Civil Code § 8132 State Statutory Standard Mandatory attachment for
every invoice submitted in an active draw package; releases lien rights
conditioned on wire clearance. Progress Lien Waiver (Unconditional)
California Civil Code § 8134 State Statutory Standard Required from
trade contractors upon cleared bank disbursement from the prior billing
cycle. Final Lien Waiver (Conditional) California Civil Code § 8136
State Statutory Standard Required with final retainage billing
application prior to final loan release. https://prdtrd.vercel.app 5/35
05/10/2026, 16:38 GroundUp AI: Product Requirements & Technical
Architecture Specification STANDARD GroundUp AI Specification PARAMETER
BASELINE STATUTORY / PLATFORM IMPLEMENTATION Live ERD Explorer (28
Tables) INDUSTRY LOGIC SOURCE Final Lien Waiver (Unconditional)
California Civil Code § 8138 State Statutory Standard Executed upon
final retainage disbursement and project signoff. Cost Code Hierarchy
CSI MasterFormat (50 Divisions) Construction Specifications Institute
Structured cost codes linking budget line items to trade contracts,
invoice items, and draw requests. Daily Debt Carry Accrued daily on
drawn loan balance Commercial Construction Loan Agreements Calculated
as: Drawn Debt Principal multiplied by (Annual Rate / 365) multiplied by
Delay Days. USE CASES & ROLE ARCHITECTURE 4. Combined Use Case Diagrams
and Role Explanations GroundUp AI acts as the owner-side control layer.
The platform keeps four data streams separate and reconciles them in
reporting, avoiding the trap of mixing disparate data on one screen.
Core Concept: Four Separate Data Streams Reconciled in Reporting The
platform keeps four data streams separate and reconciles them, instead
of mixing them in one screen: Budget is the plan: Budget sheet and
schedule of values lines locked at project baseline. Expenses are actual
spend: Incurred actuals supplied by the CFO as the expense sheet. Draws
are lender funding: Requested, approved, and funded amounts from the
construction loan. Timeline compares planned and actual milestones:
Identifies schedule slippage and explains delay attribution. Combined
Architectural Use Case Diagrams Each project has one general contractor,
and the owner chooses the GC type per project. The platform features two
combined diagrams: one for a project with a Fixed Contract GC and one
for a project with a Daily-Updates GC. Both diagrams show every active
stakeholder: Owner, Project Manager, Investor, and CFO. Purple marks the
internal team and teal marks external parties. 3.1 Project with a Fixed
Contract GC The GC submits milestone claims, completion proof, and
change orders. The owner pays on milestones and does not see
subcontractor-level invoices. https://prdtrd.vercel.app MILESTONE MODEL
6/35 05/10/2026, 16:38 GroundUp AI: Product Requirements & Technical
Architecture Specification FIGURE 1 UseAI Case Model: Fixed Contract
General Contractor Project(28 Tables) Live ERD Explorer GroundUp
Specification Fit Width Fullscreen Fit Height Use Case Diagram: Project
with Fixed Contract General Contractor Milestone-based compensation
structure: owner pays on verified milestones without subcontractor-level
invoice noise Internal Team (Purple) External Parties (Teal) System:
GroundUp AI (Fixed Contract GC Project) Owner / Developer INTERNAL GC
(Fixed Contract) EXTERNAL \<\> CFO / Accounting INTERNAL Investor /
Partner EXTERNAL Project Manager INTERNAL Figure 1: Behavioral
interaction model for a fixed or milestone-based GC contract. Purple
marks the internal team and teal marks external parties. The owner pays
on milestone proof without subcontractor-level invoice noise. 3.2
Project with a Daily-Updates GC COST-PLUS / The GC posts daily updates,
invoices and costs, and daily photos, plus change orders. The OPEN-BOOK
owner sees granular costs with the GC markup shown separately. FIGURE 1B
Fit Width https://prdtrd.vercel.app Use Case Model: Daily-Updates
General Contractor Project Fit Height Fullscreen 7/35 05/10/2026, 16:38
GroundUp AI: Product Requirements & Technical Architecture Specification
Use Case Diagram: Project with Daily-Updates General Contractor(28
Tables) Live ERD Explorer GroundUp AI Specification Cost-plus and
open-book model: owner views granular subcontractor costs with GC markup
transparently separated Internal Team (Purple) External Parties (Teal)
System: GroundUp AI (Daily-Updates GC Project) Owner / Developer
INTERNAL GC (Daily Updates) EXTERNAL \<\> \<\> CFO / Accounting INTERNAL
Investor / Partner EXTERNAL Project Manager INTERNAL Figure 1b:
Behavioral interaction model for cost-plus or open-book projects. Purple
marks the internal team and teal marks external parties. GC posts daily
progress, invoices, checks, and card costs with GC markup separated.
Detailed Functional Use Cases by Role Exhaustive functional breakdown
defining specific user actions, system outcomes, and data deliverables
across all six role categories. 4.1 Owner / Developer (Primary Buyer &
Central Role) INTERNAL \| FULL ACCESS Primary Goal: Know financial
health, project profit, schedule risk, and what decision to make next.
The owner is the primary customer and central role in the platform. USE
CASE WHAT THE OWNER DOES OUTCOME View portfolio dashboard Opens the home
screen with project cards showing status, cash gap, delay days, next
draw, and top alerts. Sees which project needs attention today. Monitor
project control center Reviews timeline (planned, actual, and expected
start and completion), budgeted amount, actual spend, lender funded One
screen shows whether the project is healthy and why it drifts.
https://prdtrd.vercel.app 8/35 05/10/2026, 16:38 GroundUp AI: Product
Requirements & Technical Architecture Specification USE CASE WHAT THE
OWNER DOES OUTCOME Live ERD Explorer (28 Tables) amount, progress %,
photos and evidence, inspection status, fund status, and units sold.
Upload project documents Uploads the foundational project documents
listed below. Source of truth for budget, timeline, and loan data.
Select GC and GC type Chooses the GC and marks the contract as fixed or
daily updates. Enables the matching GC workflow for that specific
development. Approve change orders Reviews cost, reason, and impact on
budget and timeline, then approves or rejects. No hidden or inflated
change orders enter project liabilities. Track missing items Reviews
outstanding documents, open conditions, and missing lien waivers.
Nothing blocks a lender draw unnoticed. Build draw packet Selects the
draw period; system lists eligible budget lines, invoices, photos, and
open lender conditions and produces a portalentry summary. Clean packet
the owner submits through the lender portal. Share investor preview
Generates the read-only project health view. Investor confidence without
exposing subcontractor-level invoices. GroundUp AI Specification
Documents the Owner Provides: Budget sheet and Schedule of Values (SOV)
General Contractor contract (fixed milestone or cost-plus agreement)
Master construction timeline / Gantt chart Bank statements and corporate
account ledgers Loan approval statement and commercial credit agreement
HUD settlement statement Land acquisition statement and closing binder
4.2 CFO / Accounting INTERNAL \| FINANCIAL MODULES Primary Goal:
Accurate expense categories, ledger reconciliation, and budget variance.
The CFO provides the expense sheet and executes the accounting workflows
that follow from it. https://prdtrd.vercel.app 9/35 05/10/2026, 16:38
GroundUp AI: Product Requirements & Technical Architecture Specification
USE CASE WHAT THE CFO DOES Upload expense sheet Imports actuals (vendor,
date, amount, description, payment status); the system normalizes
vendors, dates, amounts, and categories. Clean ledger of actual project
spend. Match expense to budget Confirms or corrects the system match of
each expense to a budget line; low-confidence rows go to a review queue.
Budget vs actual and funded vs spent stay current. Reconcile draws
Compares actual spend with requested, approved, and funded draws. Cash
gap and spend not yet drawn are visible in real time. Export variance
reports Produces expense sheet, budget variance report, draw history,
and summaries as Excel or PDF. Ready to share with owner, lender, or
audit partners. GroundUp AI Specification OUTCOME Live ERD Explorer (28
Tables) Strict Financial Guardrail: AI suggests expense matches but
never changes financial data without the CFO explicit sign-off. 4.3
Project Manager INTERNAL \| TIMELINE & EVIDENCE Primary Goal: Trade
progress, municipal inspections, and schedule slippage, with empirical
evidence behind each field update. USE CASE WHAT THE PM DOES OUTCOME
Update milestones Records actual start and completion dates, expected
completion, progress %, and photo evidence against the planned timeline.
Timeline reflects ground reality on site. Log inspection status Marks
each inspection as scheduled, passed, failed, or delayed and attaches
signed municipal inspection cards. Inspection risk is immediately
visible to leadership. Track delay sources Tags the root cause of a slip
(plumbing, electrical, permit, municipal inspector availability, GC
coordination); system records Owner sees who or what causes delay and
what it costs. https://prdtrd.vercel.app 10/35 05/10/2026, 16:38 USE
CASE GroundUp AI: Product Requirements & Technical Architecture
Specification WHAT THE PM DOES OUTCOME Live ERD Explorer (28 Tables)
delay days and estimated interest and carry cost. GroundUp AI
Specification Production Field Example: An electrical rough inspection
planned for February happens in March. The platform tags the delay as 45
days late and immediately links that slip to the daily interest carry
cost the owner sees on the executive dashboard. 4.4 Investor / Partner
EXTERNAL \| READ-ONLY Primary Goal: Capital invested, project status,
expected ROI, risk profile, and upcoming funding events. Access is
read-only and exists only when the owner explicitly shares it. USE CASE
WHAT THE INVESTOR SEES OUTCOME View project health Budget vs actual
summary, timeline health, risk level, and units sold. Confidence without
detail overload or confusion. See next funding event The upcoming bank
draw or capital call and its expected timing. Knows exactly when capital
moves and when equity yields disburse. Receive monthly update Generated
narrative update that the owner approves before sending. Regular,
consistent reporting without administrative overhead. Privacy Boundary:
Individual subcontractor invoices, vendor-level bills, and internal
trade disputes remain hidden from external investor views. 4.5 GC (Fixed
Contract) EXTERNAL \| LIMITED SUBMISSION Primary Goal: Get paid on
agreed milestones. The owner chooses this GC type when the project is a
fixed or milestone contract (for example, a \$2M total contract with
site work \$300K, framing \$400K, and mechanical \$350K). USE CASE WHAT
THE GC DOES OUTCOME Submit milestone claim Requests payment when an
agreed milestone is certified complete. Owner sees milestone status and
payment due. https://prdtrd.vercel.app 11/35 05/10/2026, 16:38 GroundUp
AI: Product Requirements & Technical Architecture Specification USE CASE
WHAT THE GC DOES Upload completion proof Attaches photos and sign-off
documents showing the milestone is done. Payment is backed by empirical
evidence and inspection sign-off. Submit change order Enters scope
description, cost adjustment, and reason for work outside the contract.
Routed directly to the owner for formal approval or rejection. GroundUp
AI Specification OUTCOME Live ERD Explorer (28 Tables) 4.6 GC (Daily
Updates) EXTERNAL \| LIMITED SUBMISSION Primary Goal: Keep the owner
informed every day while costs are tracked openly. The owner chooses
this GC type for open-book, cost-plus, or joint partnership projects.
USE CASE WHAT THE GC DOES OUTCOME Post daily status update Reports
progress, site issues, and expected milestone completion each day.
Timeline and delay tracking stay current in real time. Submit invoices,
costs Uploads trade invoices, checks, card transactions, and line-item
costs. Granular actual cost data for CFO reconciliation. Upload daily
photos Attaches site photos as continuous progress proof. Evidence for
progress % and inspection sign-offs. Submit change order Enters scope,
cost, and reason for added work outside the original estimate. Routed to
the owner for formal approval. Fixed Contract GC vs Daily-Updates GC
Comparison DIMENSION FIXED CONTRACT GC DAILY-UPDATES GC Contract Model
Fixed total with scheduled milestone payments (e.g. \$2M contract).
Open-book / cost-plus: actual costs plus the GC markup or profit share.
Owner Visibility Milestone status and payment due, without subcontractor
invoice noise. Granular costs, with the GC markup shown transparently
separated. https://prdtrd.vercel.app 12/35 05/10/2026, 16:38 GroundUp
AI: Product Requirements & Technical Architecture Specification
DIMENSION FIXED CONTRACT GC Reconciliation Paid on milestone completion,
backed by site proof and inspection. GroundUp AI Specification
DAILY-UPDATES GC Live ERD Explorer (28 Tables) Line-item reconciliation
of trade invoices, checks, and card transactions. A GC never chooses the
type; the owner sets it per project. In v1 the GC is an input source,
not the primary customer. CORE FINANCIAL RECORDS 5. The Four Truths
Financial Architecture How GroundUp AI synchronizes approved budgets,
actual incurred expenses, verified physical site progress, and bank loan
draws to maintain continuous financial clarity. FIGURE 2 The Four Truths
Financial Architecture Fit Width Fit Height Fullscreen Figure 2:
Continuous reconciliation between Budget Truth, Spend Truth, Progress
Truth, and Funding Truth. CASH FLOW MANAGEMENT 6. Capital Flow and
Payment Process Clear flow of funds from investor equity and bank loan
draws through 10% retainage holdbacks and payments to trade contractors.
https://prdtrd.vercel.app 13/35 05/10/2026, 16:38 GroundUp AI: Product
Requirements & Technical Architecture Specification FIGURE 3 Capital
Flow and Payment Process GroundUp AI Specification Fit Width Live ERD
Explorer (28 Tables) Fullscreen Fit Height INVESTORS / PARTNERS Equity /
Capital Contributions PROJECT ENTITY / BANK ACCOUNT Central Escrow &
Cash Hub Approved Loan Amount LENDER (Bank / Debt Fund) AIA G702/G703
Draw Request Formal Payment Application Approved Funding Incurred
Project Expenses Bank Transactions Accounting Ledger RECONCILIATION
ENGINE Bank Field Inspection Lender Funding Decision Contractors \|
Labor \| Materials Permits \| Pro Fees \| Finance Costs Delayed
Inspection / Deductions Items Held for Clarification Rejected Draw /
Remediation Correct Items & Resubmit tnuoccA tcejorP ot deraelC sdnuF
Construction Loan / Facility Budget / Spend / Funding / Progress Truths
Dashboard: Forecast / Risk / Net Cash Exposure Figure 3: Cash and draw
mechanics across developers, lenders, general contractors, and trade
subcontractors. DAILY WORKFLOW 7. Project Financial Lifecycle Workflow
Step-by-step process for document upload, automated data reading,
invoice checks, team approvals, and accounting updates. FIGURE 4 Project
Financial Lifecycle Workflow Fit Width https://prdtrd.vercel.app Fit
Height Fullscreen 14/35 05/10/2026, 16:38 GroundUp AI: Product
Requirements & Technical Architecture Specification GroundUp AI
Specification Live ERD Explorer (28 Tables) Stage 01: Project Setup
Project Initialization: Establish Site Details & General Contractor
Establish Cost Codes & Lock Baseline Budget Stage 02: Data Intake
Universal Data Ingestion: Any Format (PDF, Images, XLSX, DOCX) or ZIP
Archives File Security: Store File Securely in Cloud Vault Stage 03:
Reconciliation Data Extraction & Field Formatting Match to Cost Code &
Duplicate Check Post to Spend Truth: Verified Liabilities Stage 04: Draw
Preparation Select Verified Expenses Evidence Missing Readiness Check:
All Clear Waivers, Permits & Rules Cleared? Compile Draw Packet &
Backups eR Hold Queue: Exclude or Wait Figure 4: Daily workflow showing
document intake, AI extraction, compliance checks, and approval gates.
LOAN DRAW WORKFLOW 8. Bank Loan Draw Process Flow and 6-Step Cycle Clear
stages for preparing bank draw packages, bank inspection sign-offs,
handling lender holdbacks, and wire releases. The 6-Step Draw Cycle
Flow 1. Documents and spend: The owner uploads project documents, the
CFO uploads the expense sheet, and the GC submits claims or daily
updates. 2. Progress: The project manager confirms physical progress and
attaches passed inspection sign-offs. 3. Matching: The CFO matches
expenses to budget lines and reviews variance. 4. Packet: The owner
checks missing items, verifies conditional lien waivers, and builds the
draw packet. 5. Submission: The owner submits through the lender portal,
and the lender funds the draw wire. https://prdtrd.vercel.app 15/35
05/10/2026, 16:38 GroundUp AI: Product Requirements & Technical
Architecture Specification 6. Reporting: The investor sees the updated
funding status and milestone progress. Live ERD Explorer (28 Tables)
GroundUp AI Specification FIGURE 5 Bank Loan Draw Process Flow Fit Width
Fullscreen Fit Height Packet Created Draft Docs Validated Ready Sent to
Bank Submitted Re-Compile Bank Inspection Review 100% Cleared Approved
Funds Held Back Needs Fixes Partial Rejected Figure 5: Step-by-step
lifecycle for bank loan draw packages, including revision branching when
lenders hold back funds. Core Platform Business Rules Separate and
Reconciled: Budget, expenses, draws, and timeline stay separate and are
reconciled in reporting. Human in the Loop: AI suggests; humans approve.
No financial data changes silently. Lender Integration: GroundUp AI
prepares audit-ready draw packets but does not replace the lender
portal. GC Configuration: The owner selects the GC type per project
(Fixed Contract vs Daily Updates). Change Order Authority: All change
orders require formal owner approval before altering budget baselines.
https://prdtrd.vercel.app 16/35 05/10/2026, 16:38 GroundUp AI: Product
Requirements & Technical Architecture Specification Investor Protection:
Investors have read-only access to executive summaries, never internal
Live ERD Explorer (28 Tables) GroundUp AI Specification invoice noise.
PROJECT SETUP 9. Project Setup and Baseline Budget Flow How to set up a
new project, lock in the initial budget, assign construction cost codes,
and enter loan terms. FIGURE 6 Project Setup and Baseline Budget Flow
Fit Width Fullscreen Fit Height Step 1: Workspace Create & Permissions
Step 2: Stage? New Active New Build In-Flight Set Dates Transition Step
3: Upload SOV Excel, CSV, PDF Map & Clean Standardize Codes Figure 6:
Initialization sequence from project creation to budget lock and
baseline financial setup. QUALITY CONTROL & SAFETY
https://prdtrd.vercel.app 17/35 05/10/2026, 16:38 GroundUp AI: Product
Requirements & Technical Architecture Specification 10.GroundUp AI
Safety Rules and Human Approval Gates Live ERD Explorer (28 Tables) AI
Specification Clear rules separating automated data reading from human
approval, ensuring only verified numbers enter your accounting records.
FIGURE 7 AI Safety Rules and Human Approval Gates Fit Width Fullscreen
Fit Height AI LAYER Text Reading Categorization Flagging Anomalies
STANDARD SYSTEM LOGIC Arithmetic & Totals Security & Status Checks
Figure 7: Safety boundaries separating machine data reading from human
financial sign-off. PART II: TECHNICAL REQUIREMENTS DOCUMENT (TRD)
System architecture, multi-project data models, relational master
tables, and mathematical forecasting logic. SYSTEM ARCHITECTURE 11.
Nine-Tier Enterprise System Architecture https://prdtrd.vercel.app 18/35
05/10/2026, 16:38 GroundUp AI: Product Requirements & Technical
Architecture Specification A scalable cloud architecture designed for
high security, data privacy across projects, and a Live ERD Explorer (28
Tables) GroundUp Specification reliable financial AI audit trail. FIGURE
8 Nine-Tier Enterprise System Architecture Fit Width Fullscreen Fit
Height Tier 1: Users Project Stakeholders Developers & Owners \| Project
Managers CFOs & Finance \| Accountants & Admins \| Investors Access via
Browser Tier 2: Web Application Application Modules (UI) Dashboard \|
Projects \| Money & Budget \| Draws Inbox (Documents) \| Reports \|
Alerts \| Settings API Requests Tier 3: API Layer API Gateway & Routing
Authentication & Authorization Business Logic (Projects, Financials,
Draws) Service Orchestration \| Audit Logging & Error Handling Tier 6:
Data Sources External Ingestion Email Attachments \| Uploads \| PDFs
Bank Feeds \| Permits & Inspections Validate Identity Upload, Email, API
Tier 5: Backend Services Operations & Intelligence Tier 4: Identity &
Security Project & Financial Core Access Management • Document Service
(Upload, Versioning) • Project Service (Setup, Milestones, Equity) •
Reconciliation Service (Data Matching, Exceptions) • Financial Service
(Budgets, Expenses, Funding) • Reporting Service (Project Reports,
Exports) • Draw Service (Draw Creation, Tracking, Revisions) User
Authentication \| Token Issuance Role & Permission Management • Alert
Service (Budget Overruns, Delays) Dispatch Tasks Tier 7: Background
Processing Write Data Task Queues Tier 9: Data Storage Store Files
Database File Storage Application Data Financial Records Audit Logs,
Permissions Original Documents Draw Packages Organized by Project
Ingestion -\> Classification -\> Extraction -\> Normalization -\>
Validation -\> Database Process Document Tier 8: AI Service Layer AI
Provider Document Understanding \| Data Extraction Classification \|
Normalization Assistance Figure 8: System diagram showing user apps,
secure gateway, background workers, and databases. DOCUMENT AI PIPELINE
12. Ten-Step Document AI Processing Pipeline Automated optical character
recognition, field classification, schema normalization, and
confidence-scored human verification supporting all document formats and
batch ZIP archives. Universal Format Ingestion Engine ANY FORMAT
ACCEPTED https://prdtrd.vercel.app 19/35 05/10/2026, 16:38 GroundUp AI:
Product Requirements & Technical Architecture Specification The platform
accepts documents in any arbitrary file format without requiring manual
preconversion: Live ERD Explorer (28 Tables) GroundUp AI Specification
Portable Documents: PDF (single or multi-page, digital or scanned).
Raster & Mobile Images: JPG, JPEG, PNG, TIFF, HEIC (direct
iPhone/Android site photos). Spreadsheets & Data Feeds: Microsoft Excel
(.xlsx, .xls), CSV, TSV (expense ledgers, bank transactions). Word
Processing & Text: Microsoft Word (.docx, .doc), Rich Text (.rtf), Plain
Text (.txt). Drawings & Blueprints: Architectural scans, CAD exports,
municipal inspection card scans. Automated ZIP Archive Unpacking & Batch
Processing BATCH ARCHIVE EXTRACTION Trade contractors and accountants
frequently submit monthly draw documentation as compressed archives:
Archive Formats: .zip, .tar.gz, .7z multi-file packages. Isolated
Sandbox Unpack: Archives are decompressed in an isolated memory buffer
with recursive decompression bomb protection. Antivirus & Checksum
Audit: Every extracted file undergoes SHA-256 integrity hashing and
malware screening. Folder Hierarchy Preservation: Subfolder organization
(e.g. Invoices/, Lien_Waivers/, Photos/) is preserved as metadata tags.
Asynchronous Fan-Out: Individual constituent documents are scheduled in
parallel across the Document AI extraction queue. FIGURE 9 Ten-Step
Document AI Processing Pipeline Fit Width https://prdtrd.vercel.app Fit
Height Fullscreen 20/35 05/10/2026, 16:38 GroundUp AI: Product
Requirements & Technical Architecture Specification GroundUp
AIMulti-Format Specification Input: Any Document Format or ZIP Archives
PDF, Scans, Images ZIP Archives (Auto-Unpack) XLSX, CSV, DOCX, TXT Live
ERD Explorer (28 Tables) Bank / Email Feeds Data Processing Pipeline
Step 1: Multi-Format Ingestion Any file type or ZIP archive
(auto-unpacked) Step 2: Storage Supporting Services Save original file
securely Step 3: Classification AI Layer AI Provider Send Document for
Analysis Document Understanding Extraction & Classification Identify
document type Return Data Step 4: Extraction (AI) Pull key data:
amounts, dates Standardize Data Step 5: Normalization Standardize
formats Step 6: Confidence Check Score extracted data quality Step 7:
Validation Check for missing info or duplicates Step 8: Matching Link to
budget, vendor, etc. Needs Review? Check failed or low confidence No:
Clean Yes: Review Exception Handling Auto-Match If data is clean & rules
allow Flag for team attention Human Review Data Stores & Output Final
Output Data Stores fi Figure 9: Universal multi-format ingestion
pipeline processing any file format or ZIP archive into verified
financial records. DATA MODEL 13. System Data Model Visual blueprint
showing how projects, budgets, trade contracts, invoices, bank draws,
and investor returns connect together. FIGURE 10 Fit Width
https://prdtrd.vercel.app System Data Model Fit Height Fullscreen 21/35
05/10/2026, 16:38 GroundUp AI: Product Requirements & Technical
Architecture Specification ERD Explorer UML Class Diagram: Core
FinancialLive & Construction Entities (28 Tables) GroundUp AI
Specification Domain model showing attributes, methods, cardinalities,
and composition relationships 1..\* 1 1 0..\* 1 1 0..\* 1..\* 1 0..1 1 1
1 0..\* \<\> Figure 10: Class structure showing core fields, actions,
and connections across project entities. DATA FLOW TIMELINE 14. Invoice
Ingestion to Draw Assembly Workflow Step-by-step timeline showing what
happens when a document is uploaded, scanned by AI, checked for
accuracy, and saved to the budget. FIGURE 11 Fit Width
https://prdtrd.vercel.app Invoice Ingestion to Draw Assembly Workflow
Fit Height Fullscreen 22/35 05/10/2026, 16:38 GroundUp AI: Product
Requirements & Technical Architecture Specification Explorer (28 Tables)
UML Sequence Diagram: Invoice Processing,Live 3-WayERD Match & Draw
Generation GroundUp AI Specification Chronological message sequence
between Client, Gateway, Document AI, Database, and Lender User / UI API
Gateway Document AI Recon Engine PostgreSQL DB Lender API 1. POST
/api/invoices (PDF + meta) 2. ExtractDocument(file_ref) OCR & Field
Normalization 4. Return ExtractedJSON (lines, total, lien waiver) 5.
TriggerReconciliation(invoice_id, cost_code) 6. SELECT budget,
previous_draws 7. BudgetLine & Milestone Data 8. INSERT INTO expenses &
matches 9. Spend Truth Verified (Match Confirmed) 10. POST
/api/draws/generate 11. CheckReadiness(waivers_cleared,
inspection_passed) Compile AIA G702/G703 PDF & Evidence Binder 13. POST
/lender/draw-submission (AIA Packet + Invoices) 14. Webhook:
DrawApproved / WireInitiated (\$425,000) 15. UPDATE draws SET
status=\'cleared\', wire_ref=\'W-9021\' 16. PushNotification: Funds
Cleared to Escrow Figure 11: Interaction timeline showing document
processing, AI extraction, and database persistence. DATABASE STRUCTURE
15. Relational Database Architecture (ERD) Explore Interactive ERD &
Schema Database structure showing how 15 core business tables connect
together to provide an unbroken audit trail from land purchase to final
investor payout. For live foreign key inspection and 28-table schema
exploration, access the Interactive ERD Explorer. Live Interactive
Database & ERD Explorer Access the complete production database
visualizer with 28 normalized tables, domain guides, and interactive
foreign key relationships. Open groundupdoc.vercel.app Live Embedded ERD
Explorer (28 Tables) https://prdtrd.vercel.app LIVE APP Open in New Tab
23/35 05/10/2026, 16:38 GroundUp AI: Product Requirements & Technical
Architecture Specification GroundUp AI Specification v2 (28 (33 Tables)
GroundUp AI Live ERDSchema Explorer Tables) Construction Finance &
Project Intelligence System Architecture Schema (33) ERD Graph PRD / TRD
Spec Download PDF DATABASE TABLES FUNCTIONAL DOMAINS 33 10 33 normalized
schema models across system Domain clusters and bounded operational
contexts RELATIONSHIPS DATA PRINCIPLES 104 8 Foreign key relations
connecting models & audit trails Invariants ensuring audit trails and
financial integrity Search tables, fields (e.g. loan_id, project_id,
jsonb, expenses)\... Group by Domain FILTER: All Domains (33)
Organization & Team (3) All Grid Projects & Economics (3) Organization &
Team organizations #01 id Financing & C 3 Tables ORGANIZATION & TEAM
uuid PK Embedded Source: https://groundupdoc.vercel.app/ Click any
entity or table node above to inspect foreign key links, schema
definitions, and domain guides. Static Relational Architecture (Offline
Vector SVG Blueprint) Permanent offline vector diagram illustrating the
primary 15 business entities and relational foreign key connections.
FIGURE 12 Fit Width https://prdtrd.vercel.app Relational Database
Architecture (ERD) Fit Height Fullscreen 24/35 05/10/2026, 16:38
GroundUp AI: Product Requirements & Technical Architecture Specification
GroundUp AI Specification organizations contains owns users receives
Live ERD Explorer (28 Tables) projects stores generates logs tracks
contains investor_contributions documents provides invoices gates
audit_events measures accounting_transactions inspections matches
results_in project_milestones syncs receives progress_records
lender_decisions matches draws funds disbursements parent_draw_id
draw_lines depletes budget_lines reconciliation_matches contains funds
expenses reimburses modifies change_orders Figure 12: 15 interconnected
database entities supporting Four Truths financial auditing and
lifecycle tracking. For live schema exploration, use the embedded
explorer above or visit https://groundupdoc.vercel.app/. CORE DATA
TABLES 16. Core Database Table Specifications Live ERD Explorer (28
Tables) → Master directory defining primary database records, key
fields, and how each table supports real-world construction accounting.
PRIMARY KEY KEY FOREIGN KEYS organizations id (UUID) None name ,
corporate_domain subscription_tier users id (UUID) org_id email , role ,
first_name , last_name , is_active TABLE https://prdtrd.vercel.app
CRITICAL ATTRIBUTES 25/35 05/10/2026, 16:38 GroundUp AI: Product
Requirements & Technical Architecture Specification GroundUp AI
Specification TABLE PRIMARY KEY KEY FOREIGN Live ERD Explorer
(28CRITICAL Tables) ATTRIBUTES KEYS projects id (UUID) org_id ,
created_by name , code , site_address , lifecycle_stage , status
project_financial_baselines id (UUID) project_id land_cost , hard_budget
soft_budget , target_profit , target_irr investor_contributions id
(UUID) project_id , user_id investor_name , equity_amount ,
contribution_date budget_lines id (UUID) project_id cost_code , category
, baseline_budget , current_budget change_orders id (UUID) project_id ,
budget_line_id , authorized_by co_number , adjustment_amount ,
approved_date , status contracts id project_id , contract_number ,
(UUID) vendor_id https://prdtrd.vercel.app contract_amount ,
retainage_rate , status 26/35 05/10/2026, 16:38 GroundUp AI: Product
Requirements & Technical Architecture Specification GroundUp AI
Specification TABLE PRIMARY KEY KEY FOREIGN Live ERD Explorer
(28CRITICAL Tables) ATTRIBUTES KEYS invoices id (UUID) project_id ,
contract_id invoice_number , gross_amount , retainage_amount ,
net_payable_amount , status payment_transactions id (UUID) project_id ,
invoice_id account_source , transaction_type , amount_paid ,
transaction_date draws id (UUID) project_id , parent_draw_id draw_number
, requested_amount , approved_amount , is_revision , status draw_items
id (UUID) draw_id , budget_line_id , invoice_id requested_amount ,
approved_amount , line_status milestones_timeline id (UUID) project_id ,
budget_line_id milestone_name , baseline_end_date , forecast_end_date ,
is_completed field_evidence id (UUID) milestone_id , draw_id file_url ,
file_hash , inspection_type , signoff_date https://prdtrd.vercel.app
27/35 05/10/2026, 16:38 GroundUp AI: Product Requirements & Technical
Architecture Specification GroundUp AI Specification TABLE PRIMARY KEY
KEY FOREIGN Live ERD Explorer (28CRITICAL Tables) ATTRIBUTES KEYS
compliance_waivers id (UUID) invoice_id , vendor_id waiver_type ,
through_date , waiver_amount , is_verified unit_sales_disposition id
(UUID) project_id unit_number , sale_price broker_commission ,
net_proceeds , closing_date project_realized_pl id (UUID) project_id
total_revenue , total_actual_costs , net_realized_profit , realized_irr
, realized_em investor_distributions id (UUID) project_id , user_id
distribution_amount , preferred_return_portion promote_portion ,
distribution_date audit_trail_events id user_id , entity_type ,
entity_id (UUID) project_id action_type , before_state , after_state
FINANCIAL ENGINEERING 17. Mathematical Logic: Live Pro Forma vs Current
Forecast https://prdtrd.vercel.app 28/35 05/10/2026, 16:38 GroundUp AI:
Product Requirements & Technical Architecture Specification Detailed
breakdown of the mathematical formulas and operational mechanics
powering the Live Livescope ERD Explorer (28 Tables) GroundUp AI
Specification Pro Forma vs Current Forecast Simulator. Explains how cost
overruns and construction delays compound into daily debt service
escalation and investor IRR erosion. The Fundamental Problem GroundUp
Solves Real estate developers fail when they rely on static spreadsheets
that only compare paid invoices against original line-item budgets. In
actual construction, projects suffer from two compounding financial
vectors: 1. Direct Scope Escalation: Unforeseen soil conditions, design
changes, and trade contractor change orders that directly deplete the
contingency reserve. 2. Schedule Delay and Daily Carrying Costs:
Construction loans (such as the \$4,200,000 Columbia Bank facility on 73
Broadway) accrue interest every single day. A 60-day delay does not just
push completion back on a calendar; it generates 60 additional days of
mandatory interest payments plus ongoing site general conditions
(superintendent payroll, job trailer rental, temp power, site security).
METRIC / COMPONENT MATHEMATICAL FORMULA BASELINE VALUE (DAY 0 PLAN)
IMPACT OF DELAY AND OVERRUN 1. Baseline Total Cost (TDC) TDC_0 = Land +
Hard + Soft + Contingency + Carry \$6,130,000 (73 Broadway Model) Fixed
underwriting anchor established on Day 0. 2. Forecast at Completion
(FAC) FAC = Incurred_Spend + Remaining_Scope + Overrun +
Added_Interest + Added_GC \$6,130,000 Expands dynamically as direct
trade overruns and schedule delays accumulate. 3. Added Loan Interest
Added_Interest = Drawn_Principal \* (Rate / \$0 (at 0 days delay) At
\$4.2M loan and 8.25% interest rate, burns \$949.32 per day in added
bank debt. 365) \* Delay_Days 4. Added General Conditions Added_GC =
(Monthly_GC_Rate / 30) \* Delay_Days \$0 (at 0 days delay) At
\$12,500/month site overhead, burns \$416.67 per day in superintendent
and trailer burn. 5. Forecast Net Profit Profit_Forecast =
Projected_Revenue - FAC Closing_Brokerage \$1,450,000 Decreases
dollar-fordollar with every dollar of cost overrun and daily debt carry.
6. Dynamic Investor IRR IRR = \[ (Invested_Equity + Profit_Forecast) /
21.4% Annualized Erodes severely due to the double penalty of
https://prdtrd.vercel.app 29/35 05/10/2026, 16:38 GroundUp AI: Product
Requirements & Technical Architecture Specification METRIC / GroundUp AI
Specification MATHEMATICAL FORMULA COMPONENT BASELINE Live ERD Explorer
(28IMPACT Tables)OF DELAY AND VALUE (DAY OVERRUN 0 PLAN) reduced profit
distributed over an extended timeline. Invested_Equity \] \^ \[ 1 /
(T_0 + Delay/365) \] - 1 Real-World Case Study: 73 Broadway Overrun
Simulation If 73 Broadway encounters a \$45,000 framing cost overrun and
a 40-day municipal inspection delay: Added Columbia Bank interest: 40
days \* \$949.32 = +\$37,973 Added site general conditions: 40 days \*
\$416.67 = +\$16,667 Total project cost escalation: \$45,000 +
\$37,973 + \$16,667 = +\$99,640 Current forecast profit drops from
\$1,450,000 to \$1,350,360 Investor IRR drops from 21.4% to 18.1%
Real-World Benchmark: 392 1st Street Disposition The realized dataset
from 392 1st Street validates this exact model: Final unit sales
proceeds matched against actual incurred costs from BCB bank feeds AMEX
corporate card expenses reconciled directly against trade division lines
Total realized developer profit confirmed upon final HUD closing
distribution Actual LP equity multiple and realized IRR audited with
zero spreadsheet gaps API DESIGN 18. API Design and Integration
Specifications RESTful endpoints and webhook architectures connecting
frontends, Document AI workers, and external banking feeds. AUTHORIZED
ROLES METHOD ENDPOINT URI PURPOSE & PAYLOAD POST
/api/v1/documents/upload Uploads PDF invoices or bank statements;
triggers asynchronous OCR processing. GC, Super, Accountant GET
/api/v1/projects/{id}/forecast Returns baseline pro forma, actual
incurred spend, daily interest carry, and forecast at completion.
Developer, Investor, Accountant https://prdtrd.vercel.app 30/35
05/10/2026, 16:38 GroundUp AI: Product Requirements & Technical
Architecture Specification AUTHORIZED PURPOSE & PAYLOAD Live ERD
Explorer (28 Tables) ROLES METHOD URI GroundUpENDPOINT AI Specification
POST /api/v1/draws/{id}/assemble Assembles draw packet, checks statutory
California Civil Code Section 8132 waivers, and generates AIA G702/G703
PDF. Accountant, Developer POST /api/v1/reconcile/bank-feed Ingests BCB
Bank wire transactions and AMEX credit card charges; matches to verified
invoices. Accountant, Super Admin POST /api/v1/disposition/unit-sales
Ingests executed unit sales agreements and gross closing proceeds (392
1st Street model). Developer, Super Admin RELIABILITY ENGINEERING 19.
Technical Failure Recovery Matrix (9 Real-World Triggers) Predefined
system behaviors and deterministic recovery protocols for edge cases
across extraction, banking, and field operations. FAILURE TRIGGER
AFFECTED ENTITY RESPONSIBLE ROLE DETERMINISTIC SYSTEM RECOVERY PROTOCOL
RESULTING ST 1. Low AI Confidence (\< 0.85) invoices Accountant /
Finance Highlights lowconfidence field in red in splitscreen
verification UI; blocks autopost; prompts human confirmation. CONFIRMED
2. Unmatched Ingestion File documents Accountant / Finance Routes
document to Project Ingestion Queue; isolates VERIFIED
https://prdtrd.vercel.app 31/35 05/10/2026, 16:38 GroundUp AI: Product
Requirements & Technical Architecture Specification GroundUp AI
Specification FAILURE AFFECTED ENTITY TRIGGER DETERMINISTIC Live ERD
Explorer (28 Tables) RESPONSIBLE SYSTEM ROLE RECOVERY PROTOCOL RESULTING
ST from Spend Truth until manual costcode assignment. 3. Suspected
Duplicate Invoice invoices Accountant / Finance Detects identical vendor
and invoice number; presents sideby-side comparison modal; prevents
double billing. FLAGGED_DUPL 4. Missing Statutory Lien Waiver
compliance_waivers General Contractor Verifies absence of statutory
California Civil Code Section 8132 waiver; displays warning; withholds
line from draw packet. PENDING_WAIV 5. Failed City Inspection
field_evidence Project Superintendent Municipal inspector flags
deficiency on framing card; freezes only the affected cost code;
unaffected trades proceed. RE_INSPECTIO 6. Lender Draw Deduction (\$10K
held) draw_items Developer / Owner Columbia Bank cuts \$10K from draw;
system accepts approved funds and autospawns a child revision draw
DEFERRED_TO\_ https://prdtrd.vercel.app 32/35 05/10/2026, 16:38 GroundUp
AI: Product Requirements & Technical Architecture Specification GroundUp
AI Specification FAILURE AFFECTED ENTITY TRIGGER DETERMINISTIC Live ERD
Explorer (28 Tables) RESPONSIBLE SYSTEM ROLE RECOVERY PROTOCOL RESULTING
ST for the withheld item. 7. Full Draw Packet Rejection draws Developer
/ Owner Preserves immutable audit trail of bank rejection; clones items
into a new revision packet with remediation notes. DRAFT_REVISI 8. Bank
Wire Discrepancy payment_transactions Accountant / Finance Disbursed
wire amount differs from approval letter; logs deposited cash; creates
autobalancing adjustment entry. DISCREPANCY\_ 9. Budget Line Cost
Overrun budget_lines Developer / Owner Invoice line exceeds remaining
current budget; blocks automated post; prompts formal change order or
contingency transfer. CHANGE_ORDER REFERENCE REGISTER 20. Citations,
Statutory References, and Terminology Appendix Official statutory
citations, industry standards, financial terms, and multi-project
definitions governing the GroundUp AI platform. Part A: Statutory &
Industry Standards Citations https://prdtrd.vercel.app 33/35 05/10/2026,
16:38 GroundUp AI: Product Requirements & Technical Architecture
Specification GroundUp AI Specification STATUTE AUTHORITY STANDARD /
ISSUING APPLICATION IN (28 GROUNDUP Live ERD Explorer Tables) AI
California Civil Code Section 8132 State of California Mandatory
conditional lien waiver form upon progress payment; enforced prior to
invoice draw inclusion. California Civil Code Section 8134 State of
California Mandatory unconditional lien waiver form upon progress
payment; releases lien rights once payment clears. California Civil Code
Section 8136 & 8138 State of California Statutory final conditional and
unconditional waiver forms required prior to final 10% retainage
release. AIA Document G702 / G703 American Institute of Architects
Standard Application and Certificate for Payment with Continuation
Sheet; standard format for bank draw submission. AIA Document A2012017
American Institute of Architects General Conditions of the Contract for
Construction; establishes standard 10% retainage holdback rules. CSI
MasterFormat (50 Divisions) Construction Specifications Institute
Standardized work breakdown structure mapping budget lines, contracts,
invoices, and draws across trades. Part B: Financial & Real Estate
Terminology Appendix TERM FORMAL INDUSTRY DEFINITION GROUNDUP
OPERATIONAL ROLE The Four Truths The four synchronized financial records
of a project: Budget Truth, Spend Truth, Progress Truth, and Funding
Truth. Core data engine connecting pro forma baselines, approved vendor
expenses, physical site completion, and bank loan draws. Forecast at
Completion (FAC) Estimated total cost of the project upon completion,
combining actuals, remaining scope, and delay debt carry. Dynamic KPI
calculated live: Incurred Costs + Remaining Balance + Overrun + Added
Carry. Retainage (Retention) A portion of agreed contract price
(typically 10%) withheld until work is substantially completed.
Automated calculation on gross invoices; isolated into retainage payable
ledger until final release. https://prdtrd.vercel.app 34/35 05/10/2026,
16:38 GroundUp AI: Product Requirements & Technical Architecture
Specification TERM FORMAL INDUSTRY DEFINITION GROUNDUP OPERATIONAL ROLE
Live ERD Explorer (28 Tables) Daily Debt Carry Burn Accrued daily
interest on drawn loan principal resulting from construction schedule
delay. Calculated as: Drawn Balance multiplied by (APR / 365) multiplied
by Delay Days (\$949.32/day on \$4.2M). Internal Rate of Return (IRR)
Annualized rate of earnings generated by an investment over its
duration; heavily sensitive to time. Dynamic KPI modeling how
construction delays discount returns over an extended schedule. Equity
Multiple (EM) Total cash distributions returned divided by total equity
invested. Tracks cash return ratio: (Invested Capital + Net Profit) /
Invested Capital. GroundUp AI Specification Part C: Multi-Project Asset
Directory 73 Broadway: Active ground-up construction asset; primary
validation model for Columbia Bank construction loan draw statements,
BCB Bank operational transfers, and monthly draw packets. 392 1st
Street: Completed residential disposition asset; validation model for
condo unit sales contracts, selling prices, P&L cost per unit, AMEX
corporate card statements, and realized investor distributions. 161
Woodlawn: Pipeline pre-development asset; validation model for initial
budget sheets, preconstruction expenses, and multi-tenant project
onboarding. https://prdtrd.vercel.app 35/35 
