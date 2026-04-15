---
name: zendak-backend
description: Guides backend development for Zendak using Hono, Prisma, and PostgreSQL with strict service architecture and financial logic.
---

# Zendak Backend Skill

## 🎯 Purpose

Build a **production-grade logistics + financial backend**.

---

## ⚙️ Stack

- Hono (API)
- Prisma (ORM)
- PostgreSQL (DB)
- Zod (validation)
- jose (JWT)

---

## 🧱 Architecture

Controller → Service → Repository

---

## 📁 Module Structure

/modules
  /auth
  /trips
  /drivers

Each module must include:

- controller.ts
- service.ts
- repository.ts

---

## 🧾 Commit Rules

Each backend feature MUST be isolated in its own commit.

### ✅ Examples

- feat(auth): add prisma user model
- feat(auth): create signup controller and route
- feat(auth): implement jwt authentication
- feat(trips): create trips module

---

## 🧠 Domain Logic

### Trip Rules

- Must have:
  - driverId
  - truckId
  - origin
  - destination

---

### Profit Calculation

---

## 🗄 Prisma Rules

- All DB logic in repositories
- No Prisma in controllers/services
- Use schema as single source of truth

---

## 🔐 RBAC

Must be enforced in services:

- Admin → full access
- Accountant → financial data only
- Driver → own trips only

---

## 📦 API Design

- RESTful
- Predictable routes

/api/auth
/api/trips
/api/drivers

---

## 🧾 Reporting

- Return structured JSON
- PDF generation handled separately

---

## 🚫 Anti-Patterns

- Fat controllers
- Direct DB calls in controllers
- Skipping validation

---

## ✅ Done Criteria

- Module fully implemented
- Prisma integrated
- RBAC enforced
- Separate commit created