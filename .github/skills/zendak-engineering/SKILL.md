---
name: zendak-engineering
description: Enforces clean architecture, turborepo structure, commit discipline, and full-stack standards for the Zendak logistics platform (Next.js, Expo, Hono, Prisma, PostgreSQL).
---

# Zendak Engineering Skill

## 🎯 Purpose

This skill ensures that all generated code follows:
- Clean architecture
- Turborepo best practices
- Strong typing (TypeScript)
- Strict commit discipline
- Cross-platform consistency (web + mobile)

---

## 🏗 Monorepo Architecture

/apps
  /web        → Next.js (dashboard)
/api        → Hono backend
/mobile     → Expo app

/packages
  /ui
  /types
  /utils
  /config

---

## ⚙️ Tech Stack

- Web: Next.js (App Router)
- Mobile: Expo (React Native)
- Backend: Hono
- ORM: Prisma
- Database: PostgreSQL
- Auth: JWT (jose)

---

## 📦 Dependency Rules

- Apps import from packages
- Packages NEVER import from apps
- Shared logic must live in `/packages`
- Avoid circular dependencies

---

## 🧾 Commit Discipline (MANDATORY)

Copilot MUST structure work into **atomic commits**.

### A commit = ONE meaningful unit of work

---

### ✅ Valid Commit Examples

#### Dependencies
- feat: add jose and jwt dependencies

#### Backend
- feat(auth): create signup controller and route
- feat(auth): implement jwt signing logic
- feat(trips): create trips module (controller + service + repo)

#### Frontend (Web)
- feat(dashboard): add trips table component with fetching logic
- feat(ui): create reusable card component

#### Mobile (Expo)
- feat(mobile): add trips screen with API integration
- feat(mobile): create reusable button component

---

### ❌ Invalid Commits

- “update code”
- “fix stuff”
- multi-feature commits

---

### Rules

- One feature = one commit
- One component (with logic) = one commit
- One backend module = one commit
- One dependency change = one commit

---

## 🧠 Code Principles

- DRY (no duplication)
- Small, focused functions
- Clear naming
- No hidden side effects
- Explicit logic

---

## ⚛️ Frontend + Mobile Rules

- Use functional components only
- All logic goes into hooks
- Components are presentational
- No business logic inside UI

---

## 🔙 Backend Rules

- Controller → Service → Repository pattern
- Controllers are thin
- Services contain business logic
- Repositories handle Prisma

---

## 🗄 Prisma Rules

- Prisma is the ONLY DB access layer
- No DB queries in controllers
- Schema is source of truth

---

## 🔐 Security

- Validate all input (Zod)
- Never trust client input
- Enforce RBAC in services
- Use JWT securely

---

## 🚫 Anti-Patterns

- Massive files (>200 lines)
- Business logic in UI
- Duplicated queries
- Hardcoded values

---

## ✅ Completion Criteria

- Clean architecture followed
- Code is reusable and typed
- Correct folder placement
- Proper commit created