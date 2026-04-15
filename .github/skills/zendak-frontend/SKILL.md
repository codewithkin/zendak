---
name: zendak-frontend
description: Defines frontend and mobile UI architecture for Zendak using Next.js and Expo with reusable components and hook-driven logic.
---

# Zendak Frontend Skill

## 🎯 Purpose

Build a **clean, premium SaaS dashboard UI** for web and mobile.

---

## ⚙️ Stack

- Web: Next.js
- Mobile: Expo (React Native)
- State: React Query / Zustand

---

## 🧱 Structure

/components
/hooks
/features

---

## 🪝 Hooks (MANDATORY)

- All data fetching goes into hooks
- Hooks must be reusable and pure

Example:

```ts
const { trips, isLoading } = useTrips()