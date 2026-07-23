# Expense Tracker + Salary Allocator MVP Plan

**Project Name:** [TBD] Salary Splitter / Budget Buddy / Expense Atlas  
**Target Launch:** 6–8 weeks from start (MVP), offline support in Phase 2  
**Platform:** React Native/Expo (mobile) + React web + NestJS backend  
**Initial User:** You (solo personal app)

---

## 0. Market Context & Key Decisions

**Closest existing apps (Philippines):** Moneygment (SSS/PAG-IBIG/PhilHealth payments), Budget Pinoy & Sweldong Pinoy (net pay calculators), Tarsi (polished offline-first tracker with SSS/PhilHealth/Pag-IBIG account templates), P1SO (payday-aware, offline expense tracker).

**Your differentiation:** none of the above auto-calculate deductions AND split net pay into needs/wants/savings. That combination is your MVP's core value.

**Decision log:**
| Decision | Choice | Why |
|----------|--------|-----|
| Offline support | **Deferred to Phase 2** | Ship core features by Week 4; add offline-first once MVP is validated |
| Local storage (when built) | SQLite (mobile) / IndexedDB via Dexie (web) | Matches Tarsi's approach; no size limits, fast local queries |
| Sync strategy | Queue-based, last-write-wins | Simple to reason about for a single-user app |
| Tax rates | Hardcoded 2024/2025 SSS/PAG-IBIG/PhilHealth/BIR tables | Update annually; revisit if government rates change |

---

## 1. Core Features (MVP Phase 1: Weeks 1–4)

### A. Salary Setup & Allocation (Week 1)
**What it does:**  
User enters gross monthly salary → app auto-calculates deductions → displays net & allocates to needs/wants/savings.

**Key Inputs:**
- Gross monthly salary (PHP)
- Employment type (regular employee, contractual, self-employed) — for tax calculation differences
- Existing debts/obligations (optional: e.g., existing loans)

**Auto-Calculations (Philippine 2024/2025 rates):**
- **SSS Contribution:** 12% shared (employer 10.75%, employee 1.25%)*
  - *As salary earner, you'll see the deduction only. Backend stores both for transparency.*
- **PAG-IBIG:** 2% of gross (100 PHP minimum, max 200 PHP)
- **PhilHealth:** 3.75% of gross (100 PHP minimum, max cap ~2,400)
- **Income Tax:** Use BIR simplified withholding tax table (non-resident / resident)
- **Net Income:** Gross − all deductions

**Allocation Widget:**
- % for Needs (recommended: 50%)
- % for Wants (recommended: 30%)
- % for Savings (recommended: 20%)
- → Shows PHP amounts for each category

**Storage:**
- One `SalaryProfile` record per user (updated when salary changes)
- Historical snapshots optional (for tracking raises)

**UI Mockup:**
```
┌─────────────────────────────┐
│ Gross Salary:  ₱50,000      │
├─────────────────────────────┤
│ Deductions:                 │
│  SSS         ₱625           │
│  PAG-IBIG    ₱1,000         │
│  PhilHealth  ₱1,875         │
│  Tax         ₱4,500         │
├─────────────────────────────┤
│ Net Income:  ₱42,000        │
├─────────────────────────────┤
│ ALLOCATION:                 │
│  Needs:  50% | ₱21,000 ┃    │
│  Wants:  30% | ₱12,600 ┃    │
│  Savings:20% | ₱8,400  ┃    │
└─────────────────────────────┘
```

---

### B. Expense Tracking (Week 2)
**What it does:**  
Add expenses daily, categorize, track against allocation.

**Expense Entry Form:**
- Amount (PHP)
- Category (dropdown: Food, Transport, Utilities, Entertainment, etc.)
- Allocation bucket (Needs / Wants / Savings) — pre-selected by category
- Date (defaults to today, allow backdating)
- Description (optional, e.g., "Jollibee lunch")
- Receipt upload (optional, image only)

**Default Category → Allocation Mapping:**
| Category | Default Bucket |
|----------|----------|
| Groceries, Rent, Utilities, Insurance | Needs |
| Dining Out, Entertainment, Shopping | Wants |
| Transfers to savings account | Savings |

**Validation:**
- Can't add an expense that exceeds remaining allocation for that month (warning modal, but allow override)
- Total expenses can exceed allocation (for visibility)

**Display:**
- Today's expenses list
- Weekly/Monthly summary

---

### C. Dashboard (Week 3)
**What it shows:**
- Salary allocation progress (circular or bar chart)
  - Needs: ₱X / ₱21,000 used (% remaining)
  - Wants: ₱Y / ₱12,600 used
  - Savings: ₱Z / ₱8,400 used
- Quick stats:
  - Total spent this month
  - Days left in month
  - Average daily spend
  - Over/under budget status (green/yellow/red)
- Recent expenses (last 5)
- Quick-add button (FAB on mobile, button on web)

**Graphs (Nice-to-have for MVP, can defer):**
- Daily spend trend
- Category breakdown (pie/donut)

---

### D. Tax Summary View (Week 4)
**What it shows:**
- Monthly deduction breakdown (SSS, PAG-IBIG, PhilHealth, Tax)
- Year-to-date totals
- Deduction history (table or list)

**Future:** Export for filing (e.g., COE, tax documents)

---

## 2. Database Schema (Backend)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Salary Profile
CREATE TABLE salary_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  gross_salary DECIMAL(10,2) NOT NULL,
  employment_type ENUM('regular', 'contractual', 'self_employed'),
  needs_percentage DECIMAL(5,2) DEFAULT 50,
  wants_percentage DECIMAL(5,2) DEFAULT 30,
  savings_percentage DECIMAL(5,2) DEFAULT 20,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tax Deductions (Monthly snapshot)
CREATE TABLE monthly_deductions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  month DATE NOT NULL, -- e.g., 2025-01-01 (first of month)
  gross_salary DECIMAL(10,2) NOT NULL,
  sss_contribution DECIMAL(10,2) NOT NULL,
  pagibig_contribution DECIMAL(10,2) NOT NULL,
  philhealth_contribution DECIMAL(10,2) NOT NULL,
  income_tax DECIMAL(10,2) NOT NULL,
  net_salary DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, month)
);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR NOT NULL, -- 'groceries', 'rent', 'dining', etc.
  allocation_bucket ENUM('needs', 'wants', 'savings') NOT NULL,
  description VARCHAR,
  expense_date DATE NOT NULL,
  receipt_url VARCHAR, -- S3 or Cloudinary URL
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Phase 2 only: mirrors client-side sync_queue table (SQLite/IndexedDB)
-- for server-side conflict auditing. Not needed for MVP.
CREATE TABLE sync_log (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action ENUM('create', 'update', 'delete') NOT NULL,
  table_name VARCHAR NOT NULL,
  record_id UUID NOT NULL,
  status ENUM('ok', 'conflict') NOT NULL,
  synced_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Optional: Monthly Budget Summary (pre-calculated)
CREATE TABLE monthly_summaries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  month DATE NOT NULL,
  needs_budget DECIMAL(10,2),
  needs_spent DECIMAL(10,2),
  wants_budget DECIMAL(10,2),
  wants_spent DECIMAL(10,2),
  savings_budget DECIMAL(10,2),
  savings_spent DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, month)
);
```

---

## 3. Tech Stack & Deployment

### Backend
- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT (simple email/password for MVP, no social login)
- **File Storage:** Optional — Cloudinary (free tier for receipt images)
- **Deployment:** Railway or Render
- **Testing:** Jest (unit + integration tests for critical flows)

### Web Frontend
- **Framework:** React 18 + TypeScript
- **UI:** TailwindCSS (or shadcn/ui for faster component building)
- **State:** React Context or Zustand (keep it simple)
- **Deployment:** Vercel (free tier)
- **Charts:** Recharts (lightweight, good for dashboards)

### Mobile Frontend
- **Framework:** React Native + Expo (consistent with Seagle)
- **UI:** React Native Paper or Native Wind (TailwindCSS for RN)
- **Deployment:** Expo (development build, or EAS Build for production later)

### Shared
- **API Communication:** Axios or React Query (for data fetching + caching)
- **Environment Config:** `.env` files (Expo config plugin for mobile)

### Offline-First (Phase 2 — not in MVP scope)
- **Mobile local DB:** `expo-sqlite-next`
- **Web local DB:** `dexie` (IndexedDB wrapper)
- **Network detection:** `react-native-netinfo` (mobile), `navigator.onLine` + `online`/`offline` events (web)
- **Sync pattern:** local write → queue table → batch `POST /sync` when online → last-write-wins conflict resolution
- **Reads:** `React Query` serves from local DB when offline, refetches from server when online (see Section 6A for full flow)

---

## 4. Project Structure

```
salary-tracker/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── salary-profiles/
│   │   ├── expenses/
│   │   ├── deductions/
│   │   └── common/
│   ├── test/
│   ├── Dockerfile
│   └── package.json
├── web/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SalarySetup.tsx
│   │   │   ├── Expenses.tsx
│   │   │   └── TaxSummary.tsx
│   │   ├── components/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
├── mobile/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── dashboard/
│   │   │   ├── expenses/
│   │   │   ├── salary/
│   │   │   └── taxes/
│   │   └── auth/
│   ├── app.json (Expo config)
│   └── package.json
└── README.md
```

---

## 5. API Endpoints (NestJS)

### Auth
- `POST /auth/register` — Sign up
- `POST /auth/login` — Log in
- `POST /auth/refresh` — Refresh JWT token

### Salary Profile
- `POST /salary-profile` — Create/update salary profile
- `GET /salary-profile` — Get current profile
- `GET /salary-profile/history` — Get historical changes (optional)

### Deductions
- `GET /deductions/:month` — Get monthly deduction breakdown
- `GET /deductions/ytd` — Year-to-date summary

### Expenses
- `POST /expenses` — Add expense
- `GET /expenses` — List expenses (paginated, with filters)
- `GET /expenses/:id` — Get single expense
- `PATCH /expenses/:id` — Update expense
- `DELETE /expenses/:id` — Delete expense
- `GET /expenses/summary/:month` — Get monthly summary (needs/wants/savings)

### Dashboard
- `GET /dashboard` — Get aggregated dashboard data (salary, deductions, expense summary, etc.)

### Sync (Phase 2 only)
- `POST /sync` — Batch-apply queued client transactions (create/update/delete), return per-item status (`ok` or `conflict`)

---

## 6. Offline-First Architecture (Phase 2)

Not part of MVP scope — build this after Week 4 if you have buffer, or in Weeks 5–6 if offline turns out to matter for daily use.

**Flow:** every write goes to the local database first (SQLite on mobile, IndexedDB via Dexie on web), and is also appended to a local `sync_queue` table. A network listener (`NetInfo` on mobile, `online`/`offline` events on web) triggers `syncService.sync()` whenever connectivity returns. The sync service batches all unsynced queue items into a single `POST /sync` call, and marks each item synced once the backend confirms it applied cleanly. Reads follow the same online/offline split: `useExpenses()` fetches from the server and mirrors into the local DB when online, and falls back to reading the local DB directly when offline.

**Client-side tables (SQLite/Dexie), in addition to a mirrored `expenses` table:**
```sql
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  action TEXT,        -- 'create' | 'update' | 'delete'
  table_name TEXT,
  record_id TEXT,
  payload TEXT,        -- JSON
  created_at TEXT,
  synced BOOLEAN DEFAULT 0
);
```

**Conflict handling:** last-write-wins for MVP simplicity — the backend's `/sync` endpoint applies whatever it receives and logs a `conflict` status if the record was already modified more recently server-side, but doesn't block the write. Revisit if multi-device use becomes common.

**Why deferred:** you're the only user, working during normal hours with internet access. Cloud-only is simpler to ship and debug for Weeks 1–4. Add local storage + sync only once the core allocation/expense/tax flow is proven out.

---

## 7. Development Timeline

### Week 1: Backend Setup + Auth + Salary Profile
- [ ] NestJS project init, DB schema, migrations
- [ ] JWT auth (register, login, refresh)
- [ ] Salary profile CRUD + deduction calculation logic
- [ ] Unit tests for deduction calculations

**Deliverable:** Backend running locally, endpoints testable via Postman/Bruno

### Week 2: Expenses API + Dashboard Endpoint
- [ ] Expenses CRUD endpoints
- [ ] Category validation
- [ ] Monthly summary aggregation
- [ ] Dashboard endpoint (combines all data)
- [ ] Integration tests

**Deliverable:** Full API ready for frontend consumption

### Week 3: Web Frontend
- [ ] React + TypeScript setup, routing
- [ ] Auth pages (login, register)
- [ ] Salary setup form
- [ ] Dashboard page
- [ ] Expenses list + add modal
- [ ] Tax summary page
- [ ] API integration (axios + context)

**Deliverable:** Web app functional locally, can track expenses

### Week 4: Mobile Frontend (Expo)
- [ ] RN/Expo setup, routing (Expo Router)
- [ ] Reuse API service layer from web
- [ ] Auth pages
- [ ] Tab navigation (Dashboard, Expenses, Salary, Taxes)
- [ ] Expense entry with date picker
- [ ] Dashboard with basic charts (Recharts for RN)

**Deliverable:** Mobile app runs on simulator/device

### Weeks 5–6: Polish + Testing + Deployment
- [ ] E2E tests (optional but recommended)
- [ ] UI polish (responsive design, mobile-first refinement)
- [ ] Deploy backend to Railway
- [ ] Deploy web to Vercel
- [ ] Publish mobile to Expo (dev build)
- [ ] Documentation (README, setup guide)

**Deliverable:** Live MVP available

### Week 7–8: Iteration + Buffer
- [ ] Bug fixes from testing
- [ ] Performance optimization (if needed)
- [ ] Feature polish based on personal use feedback
- [ ] **Optional:** Offline-first implementation (see Section 6) — only if MVP is stable and you have time left

---

## 8. Nice-to-Have Features (Post-MVP)

### Phase 2 (After Launch)
- [ ] Recurring expenses (e.g., monthly rent reminder)
- [ ] Budget alerts (push notifications when near limit)
- [ ] Receipt image upload + OCR (auto-extract amount/category)
- [ ] Multi-currency support (for freelance/international income)
- [ ] Tax filing helper (generate COE summary, export PDF)
- [ ] Multi-user (share with partner/accountant)
- [ ] Dark mode
- [ ] Offline-first support (see Section 6 for full architecture)
- [ ] Integration with bank APIs (auto-import transactions)

### Phase 3 (If Growing)
- [ ] Investment tracking (stocks, mutual funds)
- [ ] Net worth dashboard
- [ ] Recurring income (freelance side gigs)
- [ ] Bill reminders
- [ ] Export to accounting software (Wave, Xero)

---

## 9. Key Assumptions & Decisions

### Tax Calculation Notes
- **SSS:** Based on 2024 rates; update annually if rates change
- **PAG-IBIG:** Fixed 2% (min 100, max 200)
- **PhilHealth:** 3.75% of gross (min 100, max variable by year)
- **Income Tax:** Using BIR's simplified withholding tax (non-resident brackets) as default; allow manual override for specifics

### Data Privacy
- User data (expenses, salary) stored in database — no export to third parties initially
- Future: GDPR/DPA-compliant data deletion on request

### Single User (MVP)
- No sharing or multi-user collaboration
- Auth is per-person
- Future: Add household/family features

---

## 10. Getting Started (Week 0 Prep)

### Before coding:
1. **Create GitHub repo** under `seagle-dev` org (or new org if separate project)
2. **Set up environment files** (.env templates)
3. **Database setup:** PostgreSQL on Supabase (obtain connection string)
4. **Backend scaffolding:** `nest new salary-tracker-backend`
5. **Web scaffolding:** `create-react-app salary-tracker-web` or `vite`
6. **Mobile scaffolding:** `npx create-expo-app salary-tracker-mobile` (or Expo Router template)

### Local development loop:
```bash
# Terminal 1: Backend
cd backend
npm install
npx prisma db push # push schema to Supabase Postgres
npm run start:dev

# Terminal 2: Web
cd web
npm install
npm start # http://localhost:3000

# Terminal 3: Mobile
cd mobile
npm install
npx expo start
# Press 'i' for iOS simulator or 'a' for Android emulator
```

---

## 11. Success Metrics (After Launch)

- [ ] Able to add 5–10 expenses per day without friction
- [ ] Dashboard loads in <2 seconds
- [ ] Can see month-end allocation status in <3 taps (mobile) / 2 clicks (web)
- [ ] Tax breakdown is accurate vs. manual calculation
- [ ] Zero 500-level errors in production for 2 weeks
- [ ] Personal usage: track all expenses for 1 month without bugs

---

## 12. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Tax calculation wrong | Lose trust, wrong budgeting | Test against BIR examples, have fallback manual entry |
| Scope creep (multi-user, advanced features) | Delays MVP | Stick to solo-user scope, defer features to Phase 2 |
| Performance on mobile | Bad UX, uninstall | Use React Query for caching, lazy load charts |
| Auth token expiry bugs | Logged out during use | Implement auto-refresh, test logout/re-login flows |
| Data loss on expense delete | User frustration | Soft delete (archive) first, hard delete after 30 days |

---

## 13. Notes for You (Piolo)

- **Leverage Seagle skills:** You've built NestJS + React Native with Expo, so this is familiar ground. Reuse patterns.
- **Start lean:** MVP doesn't need fancy animations, charts, or dark mode. Get core logic right first.
- **Test as you go:** Especially deduction calculations — users will notice math errors immediately.
- **Keep mobile & web in sync:** Use a shared API client library (`api-client/` folder) to avoid duplicating fetch logic.
- **Deploy early:** Get backend on Railway by Week 3. Test endpoints before Web/Mobile are done.
- **Personal dogfooding:** Use this app to track your actual salary from day 1 as a salaried engineer. Best feedback.

---

## Appendix: Philippine Tax 2024/2025 Quick Reference

**SSS (Social Security System)**
- Employee: 1.25% of gross (but salary ceiling: ₱29,750/month, so max contribution ~₱371)
- Employer (for reference): 10.75%
- *As employee, you only see your 1.25% deduction*

**PAG-IBIG (Home Development Mutual Fund)**
- 2% of gross
- Minimum: ₱100/month
- Maximum: ₱200/month (salary ceiling)

**PhilHealth (National Health Insurance)**
- 3.75% of gross
- Minimum: ₱100/month
- Maximum: Varies by year (check latest)

**BIR Income Tax (Withholding Tax for Resident)**
- Non-monthly basis: Simplified withholding tax (13% flat for some categories)
- Resident: Progressive brackets (5% to 32%)
- *Use BIR online calculator or standard tables for accuracy*

**Example (₱50,000 gross):**
```
Gross:               ₱50,000
SSS (1.25%):         -₱625
PAG-IBIG (2%):       -₱1,000
PhilHealth (3.75%):  -₱1,875
Income Tax (~9%):    -₱4,500 (example; depends on brackets)
──────────────────────────
Net:                 ₱42,000
```

---

**Ready to start? Pick a start date and lock in Week 1 backend setup.**
