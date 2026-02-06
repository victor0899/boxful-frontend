# Boxful Frontend

## Project Overview
Interfaz web para gestión de órdenes de envío. Next.js 15 + Ant Design 5 + TypeScript.

## Tech Stack
- **Framework:** Next.js 15.3 with App Router, Turbopack for dev
- **UI Library:** Ant Design 5.29 (CSS-in-JS, no Tailwind)
- **Language:** TypeScript 5 (strict mode)
- **HTTP Client:** Axios with JWT interceptor
- **Auth Storage:** js-cookie for JWT token
- **Package Manager:** pnpm 10

## Commands
- `pnpm run dev` - Development server with Turbopack (port 3000)
- `pnpm run build` - Production build
- `pnpm run start` - Run production build
- `pnpm run lint` - ESLint (next/typescript rules, no-explicit-any enforced)

## Architecture
Uses Next.js App Router with route groups for layout separation.

```
src/
  app/
    layout.tsx               -> Root: AntdRegistry + AuthProvider
    page.tsx                 -> Redirect: auth check -> /orders or /login
    (auth)/                  -> Route group: login, register (split layout)
      layout.tsx             -> Gradient left panel + form right panel
    (dashboard)/             -> Route group: protected pages
      layout.tsx             -> Sidebar + Header + auth guard
      orders/page.tsx        -> Orders history table with filters
      orders/create/page.tsx -> Multi-step order creation form
  components/
    auth/                    -> LoginForm, RegisterForm
    orders/                  -> OrderForm (Steps), OrdersTable, OrderFilters
    layout/                  -> Sidebar, Header
  lib/
    api.ts                   -> Axios instance, baseURL from env, JWT interceptor
    auth-context.tsx         -> React Context: user state, login/register/logout
  hooks/
    useOrders.ts             -> fetchOrders, createOrder, exportCsv
  types/
    index.ts                 -> User, Order, Package, PaginatedResponse, etc.
```

## Key Patterns
- **All page/component files with hooks are `'use client'`** - Next.js App Router requirement
- **AntdRegistry** wraps the app for Ant Design SSR CSS-in-JS support
- **AuthProvider** at root layout - provides useAuth() hook everywhere
- **Route groups** `(auth)` and `(dashboard)` share no URL segment but have separate layouts
- **Dashboard layout** redirects to `/login` if no user; Auth layout redirects to `/orders` if logged in
- **Path alias** `@/*` maps to `./src/*`
- **ESLint enforces no-explicit-any** - use proper types, `unknown`, or specific interfaces
- Use `import type` where possible (especially for AxiosError)

## API Connection
- Axios base URL from `NEXT_PUBLIC_API_URL` env var (default: `http://localhost:3001/api`)
- JWT token stored in cookie named `token` (1 day expiry)
- 401 responses auto-redirect to `/login` and clear token
- Backend runs on port 3001, frontend on port 3000

## Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API base URL

## Component Details

### OrderForm (create order)
- 2-step form using Ant Design Steps
- Step 1: Client data (name, phone, email, address, department, municipality, reference)
- Step 2: Dynamic packages via Form.List + COD toggle with conditional amount field
- Validates per-step before allowing navigation

### OrdersTable (history)
- Server-side pagination via Ant Table
- Status tags: PENDING=blue, IN_TRANSIT=orange, DELIVERED=green, CANCELLED=red
- COD badge in purple with expected amount
- Settlement column: green if >= 0, red if negative

### OrderFilters
- Inline form: text search, status select, date range picker, COD switch
- Triggers parent callback to refetch with new params

## Important Notes
- Do NOT mention AI tools anywhere in code, commits, or documentation
- No Tailwind - Ant Design handles all styling (CSS-in-JS)
- Ant Design components use controlled forms with Form.useForm()
