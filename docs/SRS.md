Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 1
SELECTION PROJECT BRIEF
Food & Hospitality
KPI Intelligence Dashboard
Live Working Prototype Development Challenge
Document Type Domain Tier Selection Project Brief Food & Hospitality Tech Frontend-First / Full-Stack Optional
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 2
1. Project Overview
The hospitality industry runs on instinct far more than it should. Owners and managers who cannot see their business in real time — who rely on end-of-week reports and gut feel — consistently leave 10–20% of revenue uncaptured, overspend on labour, and discover problems after they have already become expensive habits.
This project challenges you to build a live, interactive KPI Intelligence Dashboard for food and hospitality businesses — a tool that functions as the operational nerve centre for a restaurant, café, hotel F&B outlet, or cloud kitchen. The dashboard must surface day-to-day operational data alongside strategic intelligence and smart alerts that prompt action before a problem becomes costly.
The objective is to demonstrate your ability to think like a product builder: to take domain knowledge, translate it into meaningful data experiences, and deliver a prototype that a real business owner could sit in front of and immediately understand the story of their business today.
1.1 The Problem Being Solved
Most hospitality businesses today operate using one of three inadequate approaches:
•
Paper or whiteboard tallies that capture revenue but miss the intelligence layer entirely
•
Generic POS reports that are cluttered, backward-looking, and require interpretation
•
Spreadsheet dashboards that are fragile, manually maintained, and inaccessible to the team on the floor
None of these answers the questions that matter in real time: Are we on track today? Where is the bottleneck right now? Should I stop accepting delivery orders for the next 30 minutes? What is my most profitable item, and is it being sold to its potential?
1.2 The Solution Vision
A single-screen, role-aware dashboard that presents 49 categorised KPIs across 7 business domains. The interface must be immediately readable by a non-technical restaurant manager, while offering enough depth for an owner or investor to make strategic decisions. It will include three tiers of KPI intelligence:
Tier Description Example Operational Day-to-day metrics reviewed every shift Kitchen ticket time, covers served, food cost % Strategic Monthly growth and revenue levers Customer lifetime value, staff turnover, prime cost %
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 3
Tier Description Example Smart Alerts Automated threshold triggers requiring action Delivery time >40min, cancellation rate spike >5%
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 4
2. KPI Knowledge Bank
The following table is the complete reference for all 49 KPIs your dashboard must support. Use this as the single source of truth for data modelling, mock data generation, and display logic. Each KPI includes its formula, classification tier, alert threshold where applicable, and industry benchmark target.
Domain KPI Name Formula / Method Tier Alert Threshold Benchmark Revenue Daily Revenue Target Attainment Actual ÷ Target × 100 Operational — >90% Revenue Revenue Per Available Seat Hour (RevPASH) Total Revenue ÷ (Seats × Op. Hours) Smart Alert Drop >15% vs same weekday LW $15–$25/seat-hr Revenue Average Check / Spend Per Cover Total Revenue ÷ Total Covers Strategic — Grows 5–8% YoY Revenue Revenue by Channel Mix Channel Rev ÷ Total Rev × 100 Operational — Track split by dine-in/delivery/takeaway Revenue Peak Hour Revenue Capture Rate Peak 2hr Rev ÷ Daily Rev Smart Alert Below 35% of daily revenue >35% in peak window Revenue Catering & Events Revenue % Events Rev ÷ Total Rev × 100 Strategic — Grows monthly Operations Table Turnover Rate Covers ÷ Number of Seats Operational — Fast casual: 3–5x Operations Average Table Dwell Time Total Seated Min ÷ Covers Smart Alert Exceeds target by >20 min at peak Varies by format Operations Kitchen Ticket Time (KTT) Order placed → Food on pass (avg) Operational — <12 min casual, <22 min fine dining Operations Order to Delivery Time Order confirmed → Delivered (avg min) Smart Alert Rolling 30-min avg >40 min <35 minutes Operations Seat Utilisation Rate Occupied Seat Hrs ÷ Available Seat Hrs Operational — >70% during service Operations Dead Slot Identification Index Revenue per 30-min block / 7-day heatmap Strategic — Informs promo scheduling Orders & Menu Menu Item Contribution Margin (Sell Price − Food Cost) per item ranked Strategic — Stars = high margin + high popularity
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 5
Domain KPI Name Formula / Method Tier Alert Threshold Benchmark Orders & Menu Order Error Rate Wrong Orders ÷ Total Orders × 100 Smart Alert >2% in any shift <1% Orders & Menu Cancellation & Abandoned Order Rate Cancelled ÷ Total Orders × 100 Smart Alert Spike above 5% in 2-hr window <3% Orders & Menu Upsell Conversion Rate Orders with Upsell ÷ Total Orders × 100 Operational — 35–50% (trained staff) Orders & Menu Item 86 Frequency (Stock-Out Rate) Times 86d ÷ Total Service Periods Strategic — <2x/week per item Orders & Menu Beverage-to-Food Revenue Ratio Beverage Rev ÷ Food Rev × 100 Operational — 30–40% beverage of total Staff Labour Cost % of Revenue Labour Cost ÷ Revenue × 100 Operational — 28–35% Staff Revenue Per Labour Hour Total Revenue ÷ Total Staff Hours Smart Alert Drops >10% vs last month same volume Track trending Staff Staff Turnover Rate (Staff Left ÷ Avg Headcount) × 100 Strategic — <30%/yr Staff Covers Per Server Per Shift Total Covers ÷ FOH Staff on Shift Operational — 25–40 covers/server Staff No-Show & Late Rate (Staff) Unplanned Absences ÷ Scheduled Shifts × 100 Smart Alert Trigger 2hrs before shift start <3% Staff Training Hours Per Staff Per Month Total Training Hrs ÷ Staff Count Operational — 4–8 hrs/month Customer Guest Return Rate Returning Customers ÷ Total Unique Customers × 100 Strategic — >40% monthly Customer Net Promoter Score (NPS) % Promoters (9–10) − % Detractors (0–6) Operational — >50 good, >70 excellent Customer Online Review Score & Velocity Avg rating + review frequency Smart Alert Any 1–2 star review triggers instant alert 4.4+ across platforms Customer Customer Lifetime Value (CLV) Avg Spend × Visits/Yr × Avg Years Strategic — Informs acquisition spend cap Customer Complaint Resolution Time Complaint raised → Resolved (avg min) Smart Alert Unresolved after 20 min in-<15 min in-house
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 6
Domain KPI Name Formula / Method Tier Alert Threshold Benchmark house / 4hr online Customer Reservation No-Show Rate No-Show Reservations ÷ Total × 100 Operational — <8% Inventory Food Cost Percentage COGS ÷ Food Revenue × 100 Operational — 28–35% food, 18–24% bev Inventory Food Waste % Waste Value ÷ Total Purchased × 100 Smart Alert Daily waste value exceeds pre-set threshold <3% of purchased cost Inventory Inventory Turnover Rate COGS ÷ Average Inventory Value Strategic — 4–8x/month perishables Inventory Shrinkage & Variance Rate (Expected − Actual) ÷ Expected × 100 Smart Alert Weekly variance >2% on high-value category <1% Inventory Supplier On-Time Delivery Rate On-Time Deliveries ÷ Total Orders × 100 Operational — >95% on-time Inventory Cost Per Portion Accuracy Actual plated cost vs recipe costed (variance %) Strategic — <5% variance ROI & Growth Prime Cost (Labour + COGS) % (Labour + COGS) ÷ Revenue × 100 Strategic — <60% (target 55%) ROI & Growth EBITDA Margin (Rev − COGS − Labour − OpEx) ÷ Rev × 100 Strategic — 10–15% ROI & Growth Marketing ROI by Channel (Channel Rev − Cost) ÷ Cost × 100 Strategic — Track per channel ROI & Growth Break-Even Covers Per Day Fixed Daily Costs ÷ Avg Contribution Margin Operational — Display as daily team target ROI & Growth Cash Flow Runway (Days) Cash Balance ÷ Avg Daily Outflow Smart Alert Runway drops below 21 days >45 days healthy ROI & Growth Loyalty Programme ROI (Incremental Rev − Programme Cost) ÷ Cost Strategic — Members spend 18–25% more ROI & Growth Delivery Platform Commission Impact Delivery Rev × Commission % = Net Delivery Rev Smart Alert Net delivery margin <8% >12% net margin on delivery
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 7
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 8
3. Technical Specifications
3.1 Core Deliverable
A live, browser-accessible frontend prototype of the KPI dashboard. The prototype must function as a real working demo — interactive, responsive, and populated with realistic mock data that tells a coherent story of a hospitality business over a day, week, and month.
The prototype does NOT need to connect to a real POS or live data source. All data may be simulated using a local mock data layer (JSON, JS objects, or a lightweight mock API). The quality of the data simulation — whether it feels real — is part of the evaluation.
3.2 Mandatory Frontend Requirements
# Requirement Acceptance Criteria F1 Multi-domain navigation All 7 KPI domains accessible via tabs, sidebar, or nav — no page reload required F2 KPI card system Each KPI displayed as a card with current value, trend indicator (up/down/flat), and benchmark status F3 Smart Alert panel Dedicated visible alert feed showing all 18 smart alerts — active or simulated as triggered F4 Time range selector Toggle between Today / This Week / This Month — values update across all KPIs F5 Revenue & trend charts At minimum: daily revenue trend, channel mix chart, RevPASH by time-of-day heatmap F6 Menu Engineering quadrant Scatter/quadrant chart mapping menu items to Stars / Plowhorses / Puzzles / Dogs F7 Mobile responsiveness Fully usable on a 375px wide screen (iPhone SE). No horizontal scroll. F8 Alert simulation toggle Ability to trigger a demo alert (e.g. delivery time spike) to showcase the alert system live F9 Role-based view switching At minimum two views: Manager (operational focus) and Owner (strategic + financial focus) F10 Dark mode support Dashboard must be fully readable and functional in both light and dark mode
3.3 Bonus Backend Requirements (Plus Points)
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 9
These are not mandatory but will significantly differentiate candidates who implement them.
# Bonus Feature Implementation Notes B1 REST API with mock data endpoints Node/Express or FastAPI serving /api/kpis/:domain, /api/alerts, /api/trends — consumed by the frontend B2 Persistent alert state Alerts can be acknowledged/dismissed and state persists across page reloads (localStorage or DB) B3 Real-time simulation WebSocket or polling that updates select KPIs every 30–60 seconds to mimic live data B4 CSV / PDF export Export any domain's KPI summary as a downloadable report B5 Threshold configuration UI A settings panel where alert thresholds can be customised by the user B6 Database-backed mock data SQLite or PostgreSQL seeded with 90 days of realistic data with proper time-series queries
3.4 Technology Stack
There is no mandated stack. Candidates are free to choose what they work best with. However, the following stacks are recommended for this use case:
Layer Recommended Options Notes Frontend Framework React, Vue 3, or Svelte Vanilla JS acceptable if implementation quality is high Charts & Dataviz Recharts, Chart.js, ApexCharts, D3.js Must support at least bar, line, scatter, and pie/donut types Styling Tailwind CSS, CSS Modules, or Styled Components No CSS frameworks that override too aggressively (e.g. plain Bootstrap without customisation) Backend (optional) Node.js + Express, Python + FastAPI, or Next.js API routes Keep it thin — this is primarily a frontend challenge Mock Data Hardcoded JSON, faker.js, or custom seed scripts Data must feel realistic — use actual hospitality figures from the KPI table in Section 2 Deployment Vercel, Netlify, Railway, or Render (free tier) Must be a live URL — local-only submissions will not be evaluated
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 10
4. UI/UX Design Specifications
4.1 Design Philosophy
The dashboard is built for people who are not data analysts. A head chef, a floor manager, or a restaurant owner needs to look at this screen mid-service and understand the story of their business in under 10 seconds. Design accordingly.
•
Clarity over density — do not try to show all 49 KPIs simultaneously on one screen
•
Action-oriented — every smart alert must tell the user what to do, not just what happened
•
Contextual benchmarks — show whether a number is good or bad, not just what it is
•
Hierarchy — operational numbers are daily, strategic numbers are monthly; the UI must reflect this
•
Colour as signal — use green/amber/red sparingly and consistently for KPI status only
4.2 Required Screen Layouts
Screen / View Must Include Design Notes Command Centre (Home) 4–6 top KPI summary cards, live alert feed, daily revenue vs target, quick domain links First screen on load. Should feel like a cockpit — essential info only Revenue Domain RevPASH trend, channel mix donut, daily vs target bar chart, peak hour heatmap The primary money screen — owners will live here Operations Domain KTT gauge/trend, table turnover tracker, seat utilisation timeline, dead-slot heatmap 7-day heatmap is a key differentiator — build it well Orders & Menu Menu engineering quadrant, top/bottom items, order error rate, 86 frequency tracker Quadrant chart is the focal point of this section Staff Dashboard Labour cost % gauge, turnover tracker, covers/server chart, no-show log Sensitive — handle staff-level data carefully in terms of display Customer Intelligence Return rate trend, NPS score display, CLV segment, review score tracker NPS display must show trend over time, not just current score Inventory & Waste Food cost % tracker, waste value chart, shrinkage alert log, supplier scorecard Waste should be shown in both kg and monetary value
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 11
Screen / View Must Include Design Notes ROI & Growth Prime cost gauge, EBITDA trend, break-even covers tracker, marketing ROI bars Owner-facing. Dense with numbers but must remain readable Smart Alerts Panel Full alert log with timestamp, domain tag, severity, and recommended action Filterable by domain and severity. Most critical alert shows first.
4.3 KPI Card Component Specification
Every KPI card in the system must follow a consistent structure. This ensures the dashboard feels like a product, not a collection of separate widgets.
Element Required Detail KPI Name Yes Short version (max 5 words). Full name available on hover/expand. Current Value Yes Prominent — largest text on the card. Formatted with correct unit (%, £/$, min, x). Trend Arrow Yes Up (green/red depending on KPI direction), Down, or Flat vs previous period Benchmark Indicator Yes Colour-coded dot or badge: On Target (green), Watch (amber), Alert (red) Period Label Yes Today / This Week / This Month — matches the global time selector Sparkline Recommended A 7-point mini trend line showing recent trajectory. Can be skipped for count-type KPIs. Alert Icon For Smart Alert KPIs only Bell icon with red badge when threshold is breached. Click expands recommended action. Formula Tooltip Recommended Hover/tap on KPI name reveals the formula from Section 2. Useful for training.
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 12
5. Mock Data Specification
Your mock data must tell a coherent story about a real-world restaurant. Generic random numbers that do not follow the patterns of actual hospitality operations will be penalised in evaluation. Below is a reference scenario and the data ranges you should use to build your seed data.
5.1 Reference Business Profile Attribute Value Business Type Casual-dining restaurant with delivery channel Seating Capacity 60 covers across 18 tables Operating Hours 11:00 am – 11:00 pm (12 hrs), 7 days/week Average Check $28 dine-in / $22 delivery Daily Cover Target 150–180 dine-in covers + 40–60 delivery orders Monthly Revenue Target $180,000 Staff Count 14 full-time, 8 part-time Menu Size 42 items across 6 categories POS System Simulated — no real integration required
5.2 Realistic Data Ranges by KPI Domain
Use these ranges when generating your mock data. Values should fluctuate realistically: weekends higher than weekdays, lunch and dinner peaks at 12–2pm and 7–9pm, Monday mornings consistently lower.
KPI Realistic Range Peak Scenario Alert Scenario Daily Revenue $4,200 – $7,800 $9,200 (Fri/Sat) Below $3,800 on a weekday RevPASH $14 – $22/seat-hr $28 on Sat dinner Below $10 Mon 3–5pm Table Turnover 2.8 – 3.8x 4.5x Fri dinner service Below 2x = investigation Kitchen Ticket Time 9 – 16 min 18 min at peak on weekend >22 min triggers alert Food Cost % 29 – 34% — >36% triggers review Labour Cost % 28 – 33% — >38% triggers alert NPS Score 48 – 72 78 after menu relaunch Below 40 = urgent
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 13
KPI Realistic Range Peak Scenario Alert Scenario Order Error Rate 0.6 – 1.8% — >2.5% = shift debrief Food Waste % 2.1 – 4.8% — >5% = same-day action Delivery Time 28 – 38 min — >42 min = pause orders Prime Cost % 54 – 61% — >65% = strategic review
5.3 Suggested Mock Data Architecture
•
Seed 90 days of daily summary data (all KPI domains) into a JSON file or database
•
Add hourly data for the current day to power the real-time/live view
•
Include at least 3 pre-built alert scenarios that can be toggled on/off in the demo
•
Ensure your menu data includes all four engineering quadrant types (Stars, Plowhorses, Puzzles, Dogs)
•
Staff data should show realistic shift patterns — not all 22 staff working every day
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 14
6. Evaluation Criteria
Submissions will be evaluated across five dimensions. Each dimension carries a weighted score. The total is 100 points.
Dimension Weight What We Are Looking For Product Thinking 30 pts Does the dashboard answer real hospitality questions? Does it feel like it was designed for a restaurant owner, not a developer? Is the information hierarchy correct? Frontend Implementation 25 pts Code quality, component structure, reusability, responsive design, performance. Charts must be accurate and readable. No broken layouts. KPI Coverage & Accuracy 20 pts How many of the 49 KPIs from Section 2 are implemented? Are formulas applied correctly to the mock data? Are benchmarks displayed and contextualised? Smart Alert System 15 pts Is the alert panel functional? Can alerts be triggered, viewed, and actioned? Are recommended actions shown? Dismissed alerts handled? Data Realism & Storytelling 10 pts Does the mock data feel like a real restaurant? Do the numbers follow hospitality patterns (peaks, slow days, seasonal dip)? Does the dashboard tell a coherent story?
6.1 Bonus Points (Up to +20 pts) Bonus Feature Points Criteria Working REST API backend +7 pts Fully functional, consumed by the frontend, documented Real-time simulation (WebSocket / polling) +5 pts Live KPI values updating during demo without page reload Threshold configuration UI +4 pts User can adjust alert thresholds from within the dashboard CSV/PDF export +2 pts At least one domain exports a meaningful downloadable report Accessibility (WCAG AA compliance) +2 pts Keyboard nav, ARIA labels, colour contrast passing AA
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 15
7. Submission Requirements
7.1 What to Submit
1.
A live URL (Vercel / Netlify / Railway / Render) where the demo is accessible without login
2.
A public GitHub repository containing all source code
3.
A README.md covering: setup instructions, tech stack summary, architecture decisions, known limitations, and a list of which KPIs from Section 2 are implemented
4.
A 3–5 minute screen recording walking through the dashboard and demonstrating at least 2 smart alert scenarios
7.2 Submission Checklist Item Status [ ] Live demo URL is working and accessible Mandatory [ ] GitHub repo is public with clean commit history Mandatory [ ] All 10 mandatory frontend requirements (F1–F10) implemented Mandatory [ ] At minimum 30 of 49 KPIs from Section 2 are visible in the dashboard Mandatory [ ] Smart alert panel shows at least 8 alert types Mandatory [ ] Role switching (Manager / Owner view) is functional Mandatory [ ] Mobile layout tested on 375px width Mandatory [ ] README.md is complete with setup and KPI coverage list Mandatory [ ] Screen recording submitted (3–5 min) Mandatory [ ] Bonus: backend API, real-time updates, export Optional
7.3 Evaluation Timeline Stage Details Brief Issued Day 0 — you are reading this document Clarification Window Days 1–2 — submit questions via the designated channel Submission Deadline Day 7 — end of day (11:59 pm IST) Review Period Days 8–10 — evaluator review and scoring
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 16
Stage Details Demo Presentations Day 11–12 — shortlisted candidates present live (15 min + 10 min Q&A) Decision Communicated Day 14
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 17
8. Guidance for Candidates
8.1 What Separates Good from Great
A good submission implements the requirements correctly. A great submission shows that the builder understood WHY those requirements exist — that they thought about the person sitting in front of this dashboard at 8pm on a Friday, trying to figure out why the kitchen is backed up.
The evaluators are hospitality business operators, not just engineers. They will notice if your chart scales make no sense for the data, if your "alert" just shows a number without telling the manager what to do, or if the dashboard looks impressive but answers no real questions.
8.2 Common Mistakes to Avoid
•
Building a generic dashboard and relabelling it — the hospitality context must be embedded throughout
•
Using randomly generated data that violates real-world patterns (e.g. 100% seat utilisation at 3am)
•
Cramming all 49 KPIs onto one screen — hierarchy and navigation are part of the design challenge
•
Treating smart alerts as simple threshold indicators with no recommended action copy
•
Submitting a localhost-only project — it must be live and publicly accessible
•
Ignoring mobile — hospitality managers often check dashboards on their phone between services
8.3 Suggestions for Prioritisation (7-Day Plan) Day Focus Target Output Day 1 Architecture & Data Project scaffold, mock data JSON with 90 days of data, routing structure Day 2 Core KPI Components KPI card component, domain navigation, time range selector, benchmark logic Day 3 Revenue & Operations Revenue domain complete with all charts, operations domain with heatmap Day 4 Orders, Staff, Customer Menu engineering quadrant, staff section, customer intelligence section Day 5 Inventory, ROI, Alerts Remaining domains + fully functional smart alerts panel Day 6 Polish & Mobile Responsive layout fixes, dark mode, role switching, demo alert triggers Day 7 Deploy & Document Live deployment, README, screen recording, final submission
Food & Hospitality KPI Intelligence Dashboard — Selection Project Brief Confidential
Digital Byte Solutions | Selection Project | F&B KPI Dashboard Page 18
8.4 Recommended Reference Resources
•
Restaurant industry KPI benchmarks: National Restaurant Association annual report
•
Menu engineering methodology: Michael Kasavana & Donald Smith original quadrant framework (1982)
•
RevPASH concept: Sheryl Kimes (Cornell School of Hotel Administration)
•
Chart library documentation: Recharts.org, ApexCharts.com, Chart.js docs
•
Hospitality data context: Toast POS benchmark reports, Lightspeed hospitality insights blog
Good luck. Build something you'd be proud to show a restaurant owner.
Questions? Contact the issuing team through the designated channel before Day 2.