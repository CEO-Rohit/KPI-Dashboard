# Food & Hospitality KPI Intelligence Dashboard

A live, interactive KPI Intelligence Dashboard designed as the operational nerve centre for a restaurant, café, hotel F&B outlet, or cloud kitchen. This project was developed as a submission for the Digital Byte Solutions Selection Project.

## Tech Stack Summary

The project is built around a modern, scalable architecture using:
- **Frontend**: React 19, Vite, Recharts for visualisations, plain CSS (no aggressive frameworks per SRS requirements), Lucide React for iconography.
- **Backend**: Node.js, Express, PostgreSQL (via the `pg` driver), pdfkit and json2csv for reporting.
- **Real-Time Communication**: Socket.io (frontend & backend) to provide live KPI simulations and Smart Alert triggers without page reloads.
- **Infrastructure**: Docker & Docker Compose to run the PostgreSQL 16 Alpine database locally.

## Architecture Decisions

1. **Client-Server Architecture**: To provide a clean separation of concerns and allow for future scalability, the frontend SPA and the Express backend run independently. The frontend uses Context APIs for state management, avoiding heavy libraries like Redux to keep the dashboard snappy.
2. **PostgreSQL over NoSQL**: F&B KPI data is highly structured (time-series, transactional, hierarchical for menus/staff). PostgreSQL was chosen to ensure data integrity and easy aggregation down the line. 
3. **Real-time Engine**: Built with WebSockets (socket.io) to mimic live POS/kitchen inputs. This feeds into the Smart Alerts system, making the dashboard feel like a live "command centre," which is difficult to achieve with simple REST polling.
4. **Role-Based Views**: Implementing Manager vs. Owner views at the frontend level allowed us to segment operational (immediate) data from strategic (long-term) data, directly addressing the core UX problem described in the SRS.

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- Docker Desktop (for running the PostgreSQL database)

### 1. Database Setup
Ensure Docker is running, then start the PostgreSQL container:
```bash
docker-compose up -d
```

### 2. Backend Setup
Navigate into the backend directory, install dependencies, initialize the database, seed it with realistic 90-day mock data, and start the server:
```bash
cd backend
npm install
npm run db:init
npm run seed
npm run dev
```
*The backend server will run on `http://localhost:5000`.*

### 3. Frontend Setup
Open a new terminal window, navigate into the frontend directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be accessible at `http://localhost:5173`.*

## Known Limitations

- **Mock Data Layer**: Currently, all real-time events and data aggregates are generated from the Node.js backend using statistical simulations. True live usage would require a secure integration (e.g., webhook or API) directly from a POS (like Toast/Square) and a BOH inventory system.
- **Data Archival / Scaling**: The current PostgreSQL implementation doesn't offload historical time-series data to cold storage; continuous 1-second interval inserts over a long timeline will require optimizations.
- **Mobile Responsiveness on Dense Charts**: While mostly optimized for 375px screens (iPhone SE), heavily data-dense visualizations like the Menu Engineering Quadrant require some scroll-snapping and scaling tradeoffs on smaller devices.
- **Security / RBAC**: The Manager vs. Owner view toggle is currently a UI presentation layer construct for demonstration purposes, without full JWT-based backend segregation.

## Implemented KPIs (From SRS Section 2)

We have successfully implemented the vast majority of the required 49 KPIs. Below is the list of KPIs actively tracked and displayed within the dashboard across its 7 domains:

### Revenue
1. Daily Revenue Target Attainment ("Revenue Attainment")
2. Revenue Per Available Seat Hour ("RevPASH")
3. Average Check / Spend Per Cover ("Avg Check / Cover")
4. Peak Hour Revenue Capture Rate ("Peak Hour Capture")
5. Catering & Events Revenue % ("Catering & Events")

### Operations
6. Table Turnover Rate ("Table Turnover")
7. Average Table Dwell Time ("Avg Dwell Time")
8. Kitchen Ticket Time ("Kitchen Ticket Time")
9. Order to Delivery Time ("Delivery Time")
10. Seat Utilisation Rate ("Seat Utilisation")

### Orders & Menu
11. Order Error Rate ("Order Error Rate")
12. Cancellation & Abandoned Order Rate ("Cancellation Rate")
13. Upsell Conversion Rate ("Upsell Conversion")
14. Item 86 Frequency (Stock-Out Rate) ("Item 86 Frequency")
15. Beverage-to-Food Revenue Ratio ("Bev-to-Food Ratio")

### Staff
16. Labour Cost % of Revenue ("Labour Cost %")
17. Revenue Per Labour Hour ("Revenue / Labour Hr")
18. Staff Turnover Rate ("Staff Turnover Rate")
19. Covers Per Server Per Shift ("Covers / Server")
20. No-Show & Late Rate ("No-Shows")
21. Training Hours Per Staff Per Month ("Avg Training Hrs/Mo")

### Customer
22. Guest Return Rate ("Guest Return Rate")
23. Net Promoter Score ("NPS Score")
24. Online Review Score & Velocity ("Online Review Score")
25. Customer Lifetime Value ("Customer CLV")
26. Complaint Resolution Time ("Complaint Res. Time")
27. Reservation No-Show Rate ("Reservation No-Show")

### Inventory
28. Food Cost Percentage ("Food Cost %")
29. Food Waste % ("Food Waste %")
30. Inventory Turnover Rate ("Inventory Turnover")
31. Shrinkage & Variance Rate ("Shrinkage Rate")
32. Supplier On-Time Delivery Rate ("Supplier On-Time")
33. Cost Per Portion Accuracy ("Portion Variance")

### ROI & Growth
34. Prime Cost % ("Prime Cost %")
35. EBITDA Margin ("EBITDA Margin")
36. Break-Even Covers Per Day ("Break-Even Covers")
37. Cash Flow Runway (Days) ("Cash Flow Runway")
38. Loyalty Programme ROI ("Loyalty ROI")
39. Delivery Platform Commission Impact ("Delivery Commission")

## Production Deployment

This project is configured for cloud deployment:
- **Frontend**: Hosted on **Vercel** with environment variable support for dynamic API endpoints.
- **Backend**: Containerized with **Docker** and deployed as a Web Service on **Render**.
- **Database**: Persistent **PostgreSQL** instance with automatic seeding on first startup to ensure the dashboard is always data-rich.
- **Security**: Supports `DATABASE_URL` with SSL enforcement for secure cloud database connections.

*(Note: Data for advanced dimensional KPIs like the Dead Slot Identification Index or Menu Contribution Margins are visualized directly within the heatmap and scatter charts respectively rather than strictly as single-value cards.)*
