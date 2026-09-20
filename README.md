# Digital Heroes — MERN Architecture Platform

> **"Robinhood meets a Charity Raffle"** — A subscription-driven web platform transforming athletic consistency (golf Stableford scoring) into a monthly lottery engine with rollover jackpots and direct, transparent charity fundraising.

Built as a decoupled **MERN stack** application:
- **Backend**: Node.js, Express REST API, MongoDB (Atlas/Mongoose), JWT authentication with secure cross-domain HTTP-only cookies, Stripe subscriptions & webhooks, Multer/Cloudinary scorecard verification storage, and Vitest test suite.
- **Frontend**: React 19 SPA (Vite), React Router v6, Tailwind CSS glassmorphic fintech design system, Lucide icons, Framer Motion, Canvas Confetti.

---

## 1. Architectural Overview & Folder Structure

```
DH-assignment/
├── server/                           # Node.js + Express REST API
│   ├── src/
│   │   ├── config/                   # db.ts (MongoDB connection), cloudinary.ts (Storage engine)
│   │   ├── controllers/              # auth, score, draw, charity, winner, payment, admin controllers
│   │   ├── domains/                  # Pure domain services & algorithmic models
│   │   │   ├── scores/               # scoreService & tests (rolling 5 limit, duplicate date guard)
│   │   │   └── draws/                # drawEngine, weighting & tests (duplicate matching, rollover, splits)
│   │   ├── middleware/               # authMiddleware & tests (requireAuth, requireAdmin, requireActiveSubscription)
│   │   ├── models/                   # Mongoose schemas: User, Score, Draw, DrawEntry, DrawWinner, Charity, Donation
│   │   ├── routes/                   # Express route definitions
│   │   ├── seeds/                    # seedData.ts (Demo admin, subscriber, partner charities & golf days)
│   │   └── server.ts                 # Express app initialization, CORS, cookie-parser, route mounting
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── client/                           # React (Vite) Single Page Application
│   ├── src/
│   │   ├── components/               # ui/ (Button, Card, Badge), navigation/ (Navbar, Footer), motion/ (FadeIn, AnimatedNumber)
│   │   ├── context/                  # AuthContext.tsx (Silent refresh, session management, roles)
│   │   ├── lib/                      # utils.ts (cn, currency and date formatters)
│   │   ├── pages/
│   │   │   ├── public/               # PublicLayout, HomePage, HowItWorksPage, CharitiesPage, CharityDetailPage, DonatePage
│   │   │   ├── auth/                 # LoginPage (with demo autofill), SignupPage (two-step plan & charity slider)
│   │   │   ├── dashboard/            # DashboardLayout, Overview, ScoresPage, DrawsPage, CharityPage, WinningsPage, SettingsPage, ReactivatePage
│   │   │   └── admin/                # AdminLayout, AdminOverviewPage, AdminUsersPage, AdminDrawsPage, AdminCharitiesPage, AdminWinnersPage, AdminReportsPage
│   │   ├── services/                 # api.ts (Axios client with 401 refresh token interceptor & credentials)
│   │   ├── App.tsx                   # Central router with ProtectedRoute & AdminRoute guards
│   │   └── main.tsx                  # React entry point
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── package.json                      # Workspace scripts runner
```

---

## 2. Core Business Rules & Domain Formulas

### A. Score Management Rules (`server/src/domains/scores/scoreService.ts`)
- **Format**: Stableford points strictly bounded within `1` to `45`.
- **Rolling Window**: Exactly `5` scores are retained on the active ticket. When a 6th score is entered, the oldest score chronologically is archived off the active ticket.
- **Duplicate Date Guard**: Only one score per calendar date. Compound unique index `{ userId: 1, date: 1 }` prevents double-logging.
- **Sorting**: Reverse chronological (most recent round first).

### B. Prize Engine & Draw Mechanics (`server/src/domains/draws/drawEngine.ts`)
- **Gross Monthly Pool**: **20%** of gross monthly subscription revenue.
  - Monthly membership: £20/month (£4.00 to prize pool)
  - Yearly membership: £200/year (£3.33/month equivalent)
- **Duplicate Numbers in Player Tickets**:
  - Handled via **unique set intersection**: `Array.from(new Set(playerNumbers)).filter(n => winningSet.has(n))`.
  - If a user records duplicate scores (e.g. two rounds scoring 28), each drawn number matches at most once toward `matchedCount`.
- **Tier Allocations**:
  - **Match 5 (Jackpot)**: **40%** of pool + **100% of previous rollover**. If 0 players match 5 numbers, this entire tier rolls over into the next cycle's jackpot.
  - **Match 4**: **35%** of pool (split equally among tier winners).
  - **Match 3**: **25%** of pool (split equally among tier winners).
- **Tie-Splitting**: Ties in any tier are split equally: `prizePerWinner = tierPool / winnerCount`.

### C. Algorithmic Draw Weighting Formula (`server/src/domains/draws/weighting.ts`)
In Algorithmic mode, ticket weight $W$ scales with player consistency and recency:

$$W = 1.0 + (\min(N_{scores}, 5) \times 0.25) + \text{RecencyBonus}$$

- $N_{scores} \in [0, 5]$: number of logged scores in the rolling window (+0.25 each, up to +1.25).
- $\text{RecencyBonus}$:
  - Last round logged $\le 7$ days ago: **+0.50**
  - Last round logged $\le 14$ days ago: **+0.25**
  - $> 14$ days or no scores: **0.00**
- Weight range: **[1.00, 2.75]** (consistent, active players receive higher probability weight without skewing integrity).

### D. Charity Impact Mechanics
- **10% Minimum Mandatory Contribution**: Every subscriber directs at least 10% of their fee to a chosen partner charity.
- **Configurable Slider**: Up to 50% via the account slider.
- **Direct One-off Donations**: Standalone checkout path for non-subscribers and visitors.

---

## 3. Demo Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@digitalheroes.io` | `AdminMasterKey2026!` | Full access to `/admin` control console |
| **Subscriber** | `player@digitalheroes.io` | `SubscriberPass123!` | Full access to `/dashboard` & score entry |

*Note: Quick autofill buttons are built directly into the `/login` screen for 1-click evaluation.*

---

## 4. Setup & Running Locally

### Step 1: Install Dependencies
From the repository root:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Environment Variables
Create `.env` in `server/` (see `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/digital_heroes
JWT_ACCESS_SECRET=your_super_secret_access_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here
```

Create `.env` in `client/` (see `client/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Seed Database
Populate initial demo users, charities, and golf day tournaments:
```bash
cd server
npm run seed
```

### Step 4: Run Development Servers
In two separate terminals:
```bash
# Terminal 1: Backend (port 5000)
cd server
npm run dev

# Terminal 2: Frontend (port 5173)
cd client
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 5. Verification & Test Suite

### Run Backend Domain & Auth Middleware Unit Tests
```bash
cd server
npm run test
```
*Executes 29 automated Vitest test cases covering score rolling limits, duplicate date rejection, prize tier mathematics, unique set intersection matching, rollover accumulation, algorithmic weighting, and JWT/role/subscription middleware.*

### Run Client Production Build
```bash
cd client
npm run build
```
*Builds production Vite bundle with strict TypeScript verification.*
