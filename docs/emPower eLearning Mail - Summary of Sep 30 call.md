03/10/2026, 16:22 emPower eLearning Mail - Summary of Sep 30 call
Pratham Rajbhar Summary of Sep 30 call 1 message Hardik Parikh Fri, Oct
2, 2026 at 5:13 AM To: Mohit Assudani , Pratham Rajbhar , Divyanshu Rai
Cc: Kunal Shah , Dharmesh Gohil , skrutarth08@gmail.com Attached is the
raw transcript. Here is the summary - I reviewed the full call. This one
is important because it adds several pieces that were still fuzzy in the
PRD/database design. The biggest shift is that GroundUp should not stop
at construction budget vs actual. It needs to follow the project from
acquisition through construction through final sale and investor ROI.
That came through clearly in the discussion. RE Groundup App Here are
the changes I would now make. 1. Tie timeline directly to budget
categories / milestones The team correctly identified that the
construction timeline should not be a separate generic calendar. It
should connect to the budget structure. For each major budget category
or milestone, store: planned start planned completion actual start
actual completion expected completion budgeted amount actual spend
lender funded amount progress % photos / evidence inspection status You
specifically discussed using major budget sections like permits, site
work, framing, mechanical, interiors, etc., rather than forcing a date
onto every tiny line item. RE Groundup App That is the right approach.
2. Add photo/progress evidence as a first-class object This was stronger
in this call than before. For each milestone/budget line: Budget +
Timeline + Actual Spend + Draw Funding + Photo Evidence That becomes a
very powerful owner view. The bank itself often requires photo evidence
or an appraiser to verify work before releasing funds, so photos are not
merely cosmetic---they are evidence of progress. RE Groundup App
https://mail.google.com/mail/u/0/?ik=5e817d9cee&view=pt&search=all&permthid=thread-f:1877892878355796685&simpl=...
1/10 03/10/2026, 16:22 emPower eLearning Mail - Summary of Sep 30 call
Database addition: progress_evidence - id - project_id - milestone_id -
budget_line_id - document_id - evidence_type - captured_at -
uploaded_by - notes - verified_status Evidence types: PHOTO INSPECTION
GC_CONFIRMATION LENDER_INSPECTION APPRAISER_REPORT OTHER 3. Contingency
needs its own workflow This is now clearly a required feature. When a
budget category goes over, GroundUp should ask: Is this an approved
overrun? Should it be funded from contingency? Is this an unplanned
cost? You gave the example of unexpected foundation work requiring piles
and using contingency to absorb that cost. RE Groundup App So I would
add: contingency_movements - id - project_id - source_budget_line_id -
destination_budget_line_id - amount - reason - status - approved_by -
approved_at This prevents the team from simply editing the original
budget. 4. Add the Pro Forma / Profit Model This is one of the biggest
changes. Your real product promise is not: "Are we managing the
construction project?" It is: "Are we still going to make the money we
expected?" You explicitly corrected the team on this in the meeting. RE
Groundup App So GroundUp needs a project economics layer.
https://mail.google.com/mail/u/0/?ik=5e817d9cee&view=pt&search=all&permthid=thread-f:1877892878355796685&simpl=...
2/10 03/10/2026, 16:22 emPower eLearning Mail - Summary of Sep 30 call
Initial project assumptions acquisition cost construction budget soft
costs financing costs projected interest taxes insurance carrying costs
expected sale price selling commission legal/closing costs target profit
target ROI expected project duration Then continuously calculate:
Original Pro Forma vs. Current Forecast Example: Metric Original Current
Acquisition \$1.0M \$1.0M Construction \$1.2M \$1.32M Interest/carry
\$150K \$225K Total cost \$2.35M \$2.545M Expected sale \$3.0M \$3.0M
Profit \$650K \$455K ROI 27.7% 17.9% That screen is probably more
valuable than many of the construction-management screens. 5. Interest
needs much deeper modeling The call surfaced two financing structures:
Model A --- Interest reserve The lender holds an interest reserve and
pays monthly interest out of that balance. Model B --- Monthly interest
payment The developer pays interest directly each month. You discussed
both models explicitly. RE Groundup App So loans should include:
interest_payment_method: RESERVE MONTHLY_OUT_OF_POCKET CAPITALIZED OTHER
And fields such as: interest_reserve_initial interest_reserve_remaining
interest_paid_to_date current_principal_drawn
https://mail.google.com/mail/u/0/?ik=5e817d9cee&view=pt&search=all&permthid=thread-f:1877892878355796685&simpl=...
3/10 03/10/2026, 16:22 emPower eLearning Mail - Summary of Sep 30 call
daily_interest_cost monthly_interest_cost This lets GroundUp answer: "If
the project finishes 60 days late, what happens to my profit?" And after
construction: "If it takes another 8 months to sell, what happens to my
return?" That was another clear pain point from the call. RE Groundup
App 6. GroundUp needs acquisition → construction → disposition I would
now structure the product lifecycle like this: ACQUISITION ↓
PRE-CONSTRUCTION ↓ CONSTRUCTION ↓ COMPLETION ↓ SALE / DISPOSITION ↓
FINAL ROI Not just: construction → complete Because you want to
calculate the complete investment result. Acquisition data purchase
price acquisition loan closing costs legal recording fees initial equity
Construction data budget actuals lender draws financing change orders
schedule Disposition data projected sale price actual sale price realtor
commission seller closing costs legal fees loan payoff other selling
expenses Final output net proceeds
https://mail.google.com/mail/u/0/?ik=5e817d9cee&view=pt&search=all&permthid=thread-f:1877892878355796685&simpl=...
4/10 03/10/2026, 16:22 emPower eLearning Mail - Summary of Sep 30 call
total project cost project profit investor distributions ROI annualized
return / IRR later 7. Support TWO GC commercial models This was probably
the most important architecture discussion in the second half. You
clearly have at least two different project models. Model 1 ---
Open-book / Cost-plus / Partnership Like your projects. You may see:
subcontractor costs credit-card transactions checks detailed line items
actual cost GC profit share or markup separately Very granular
reconciliation. Model 2 --- Fixed / Milestone GC Contract Developer
hires GC for: \$2M total with milestones: Site work: \$300K Framing:
\$400K Mechanical: \$350K etc. The developer may not care about every
subcontractor invoice. Once milestone is complete: GC invoices \$300K.
This was explicitly discussed in the meeting. RE Groundup App So Project
should have: construction_contract_model OPEN_BOOK COST_PLUS FIXED_PRICE
MILESTONE_BASED PROFIT_SHARE HYBRID This setting should materially
change the UX. That is an important design decision. 8. GC contract
should be an input document
https://mail.google.com/mail/u/0/?ik=5e817d9cee&view=pt&search=all&permthid=thread-f:1877892878355796685&simpl=...
5/10 03/10/2026, 16:22 emPower eLearning Mail - Summary of Sep 30 call
This was a very good insight from the call. When a new project is
created: Upload GC Contract AI extracts: contract amount payment
structure milestones markup profit % retainage change-order rules
required documentation payment terms Then GroundUp configures the
project workflow accordingly. RE Groundup App That is much better than
asking a user 30 setup questions manually. 9. Actual spend needs several
evidence levels The transcript also clarified something important:
sometimes a proper invoice simply does not exist. There may instead be:
invoice signed subcontract bank check with memo credit card transaction
GC payment request manually confirmed amount For example, checks often
include a memo such as "plumbing" or "electrical," and known vendors can
imply a trade. RE Groundup App So add: evidence_strength
VERIFIED_INVOICE SIGNED_CONTRACT BANK_TRANSACTION CARD_TRANSACTION
GC_CONFIRMATION MANUAL_ENTRY GroundUp can surface the confidence of the
spend record rather than pretending every number has identical support.
10. Credit card feeds are highly relevant Your own operating model is
actually a perfect GroundUp use case. You described separate Amex card
numbers by project and then manual reconciliation every few days to
ensure expenses were charged to the right property. RE Groundup App That
suggests a future integration: Corporate Card Feed GroundUp
automatically detects: Home Depot --- \$3,482 Card ending 8421 → Project
A
https://mail.google.com/mail/u/0/?ik=5e817d9cee&view=pt&search=all&permthid=thread-f:1877892878355796685&simpl=...
6/10 03/10/2026, 16:22 emPower eLearning Mail - Summary of Sep 30 call
AI category: Finish Carpentry --- 82% confidence Developer/accountant
confirms. This could remove significant manual work later. Not P0, but
definitely roadmap. 11. Add inter-project transfers / temporary loans
The team found money moving between projects and thought the data was
wrong. But you clarified that sometimes one project temporarily funds
another because a lender draw is delayed, and then the amount gets
repaid. RE Groundup App That means we need: inter_project_transfers
from_project_id to_project_id amount transfer_date type: TEMPORARY_LOAN
CAPITAL_TRANSFER REIMBURSEMENT OTHER repaid_amount repaid_date status
Otherwise GroundUp will incorrectly classify these as revenue or
expenses. 12. Roles / personas now need to be finalized Dharmesh is
right that this should happen before the team builds more UI. RE
Groundup App I would define these six roles: Developer / Owner Needs:
financial health profit schedule risk decisions Investor Needs: capital
invested project status expected ROI risk GC Provides:
https://mail.google.com/mail/u/0/?ik=5e817d9cee&view=pt&search=all&permthid=thread-f:1877892878355796685&simpl=...
7/10 03/10/2026, 16:22 emPower eLearning Mail - Summary of Sep 30 call
timeline milestone completion photos invoices/payment requests change
orders Project Manager Provides: progress inspections timeline updates
supporting evidence Accountant / Finance Provides: expenses bank
transactions cards reconciliation Lender Probably not an active user
initially. GroundUp receives lender data instead. This distinction
matters. 13. Your MVP dashboard becomes much clearer now For each
project, I would show: Project Economics Projected Profit \$455K ↓
\$195K from original Projected ROI 17.9% Original ROI 27.7% Construction
Current Budget \$1.32M Actual Spend \$815K Lender Funded \$720K Unfunded
Exposure
https://mail.google.com/mail/u/0/?ik=5e817d9cee&view=pt&search=all&permthid=thread-f:1877892878355796685&simpl=...
8/10 03/10/2026, 16:22 emPower eLearning Mail - Summary of Sep 30 call
\$95K Schedule Baseline Completion Mar 2027 Current Forecast May 2027
Delay 61 days Estimated Carry Impact -\$42K Contingency Original: \$82K
Used: \$40K Remaining: \$42K Attention 🔴 Electrical \$18K over budget
🔴 Draw #8 short-funded \$11K 🟠 Framing 14 days late 🟠 Interest
reserve only 3.2 months remaining That gets much closer to the product
you described in this call. 14. What I would tell the developers to do
next Before writing more code, deliver these four artifacts. 1. Role ×
Use Case Matrix For every role: What data do they provide? What do they
see? What can they change? What decisions do they make? 2. Project
Lifecycle Model
https://mail.google.com/mail/u/0/?ik=5e817d9cee&view=pt&search=all&permthid=thread-f:1877892878355796685&simpl=...
9/10 03/10/2026, 16:22 emPower eLearning Mail - Summary of Sep 30 call
Map: Acquisition → Financing → Budget → Timeline → Construction → Draws
→ Completion → Sale → Investor Return 3. Data Mapping Exercise Take one
completed project and map every source: acquisition HUD/closing
statement GC contract budget loan documents draw history bank statements
credit cards invoices/checks construction timeline sale closing
statement into the GroundUp schema. The completed project you agreed to
provide is especially valuable because it lets the team reconstruct
actual economics from beginning to end. RE Groundup App 4. One New Live
Project Then run the same schema prospectively on a brand-new project.
That combination is perfect: Completed project → prove GroundUp can
reconstruct reality. New project → prove GroundUp can monitor reality as
it develops. The biggest clarification from this call is that
GroundUp\'s real North Star is now sharper: At any point in a
development, GroundUp should tell the owner what they originally
expected to make, what they are now expected to make, what changed, and
exactly why. Everything else---budget, draw, timeline, invoices, photos,
financing---is supporting data for answering that question. -Thank You
Hardik Parikh Co-founder, emPower RE Groundup App.txt 59K
https://mail.google.com/mail/u/0/?ik=5e817d9cee&view=pt&search=all&permthid=thread-f:1877892878355796685&simpl=...
10/10 
