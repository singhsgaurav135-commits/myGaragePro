# myGaragePro – Advanced Digital Garage Management ERP System

**myGaragePro** is a comprehensive, production-grade automobile garage management system designed to digitize workshop operations from vehicle inward to final gate pass delivery.

---

## 🚀 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts
- **Backend:** Node.js, Express.js, TypeScript, REST APIs
- **Database:** PostgreSQL with Prisma ORM
- **Authentication & Security:** JWT Auth, Role-Based Access Control (Admin, Service Advisor, Mechanic, Store Manager, Accountant, Customer)

---

## 🛠️ Main Modules

1. **Dashboard & Live Analytics:** Real-time KPI revenue metrics, active bay counters, and live Job Board.
2. **Customer & Vehicle Registry:** Multi-vehicle support, vehicle VIN & license validation.
3. **Gate Inward Entry:** Digital condition reports, fuel gauge indicators, and odometer tracking.
4. **Interactive Kanban Job Board:** Multi-stage workflow pipeline from intake to delivery.
5. **50-Point Vehicle Inspection:** Safety checklists and body damage recording.
6. **Commercial Estimates & Quotes:** Customer approval workflows with automated 18% GST calculation.
7. **Mechanic Task Allocation:** Labor cost logging and mechanic productivity analytics.
8. **Spare Parts & Inventory Store:** Live stock deduction via database transactions and low-stock reorder alerts.
9. **Suppliers & Purchase Orders:** Vendor management, PO issuing, and automated goods receipts.
10. **Billing, GST Invoices & Payments:** Multi-payment options (UPI, Cash, Card, Bank Transfer) with print-ready invoices.
11. **Quality Inspection & Road Testing:** Pre-delivery checklists and supervisor sign-offs.
12. **Gate Pass & Handover:** Digital exit gate pass, odometer exit verification, and customer ratings.
13. **Automated Service Reminders:** WhatsApp & SMS outreach schedules with urgency tags.
14. **Customer Complaints & Rework:** Free bay rework and incident tracking.
15. **Workshop Expenses Tracker:** Petty cash, utilities, and consumables ledger.
16. **Settings & Compliance Audit Trail:** Detailed audit logs for critical operations.

---

## 📦 Local Setup Instructions

### 1. Database Setup
Ensure PostgreSQL is running and create a database named `garagepro`:
```sql
CREATE DATABASE garagepro;
```

### 2. Backend Setup
```bash
cd server
npm install

# Configure .env:
# PORT=5000
# DATABASE_URL="postgresql://<user>:<password>@localhost:5432/garagepro?schema=public"
# JWT_SECRET="your_secret_key"

npx prisma db push
npx tsx prisma/seed_expanded.ts
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

