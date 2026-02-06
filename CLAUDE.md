# Boxful Frontend

## Project Overview
Interfaz web para gestión de órdenes de envío. Next.js 15 + Ant Design 5 + TypeScript.

**Backend:** NestJS backend disponible en repositorio separado, trabajando en conjunto para desarrollo.

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

## Backend Integration

### Available Endpoints
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (8 fields: firstName, lastName, gender, birthDate, email, whatsappCode, whatsappNumber, password)
- `GET /api/auth/profile` - Get current user
- `POST /api/verification/send-code` - Send 6-digit code to email
- `POST /api/verification/verify-code` - Validate code

### Backend Stack (NestJS)
- NestJS + Prisma + MongoDB Atlas
- Resend for email verification
- Master code `000000` for development/testing
- Email verification codes stored in-memory (10min expiry)

## Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API base URL

## Design System

### Typography
- **Font:** Mona Sans (variable font from GitHub)
- Loaded via @font-face in globals.css
- Fallbacks: system fonts

### Color Palette (Boxful)
- **White:** #fff
- **Blue 900:** #050817 (text dark)
- **Blue Dark:** #16163d
- **Blue 500:** #2e49ce (primary)
- **Gray 500:** #4e4c4c (text)
- **Gray 300:** #b8b7b7 (secondary text)
- **Gray 100:** #ededed (backgrounds)

### Theme Configuration
- Primary color: Blue 500 (#2e49ce)
- Button/Input height: 48px
- Border radius: 8px
- Configured via Ant Design ConfigProvider in ThemeProvider

## Component Details

### Auth Components

#### LoginForm
- Split screen layout: form left, hero image right
- Fields: email, password
- Removed input icons per Figma design
- Texts: "Bienvenido", "Por favor ingresa tus credenciales"

#### RegisterForm (with Email Verification)
- Split screen layout: form left, hero image right
- **8 fields** organized in 2-column responsive grid:
  - Nombre | Apellido
  - Sexo (Select: M/F/O) | Fecha de nacimiento (DatePicker)
  - Correo electrónico | WhatsApp (country code + number)
  - Contraseña | Repetir contraseña
- **Verification Flow:**
  1. Phone confirmation modal → user confirms WhatsApp number
  2. Backend sends 6-digit code to email (via Resend)
  3. Code verification modal → user enters code
  4. If valid → completes registration
- **Development:** Master code `000000` always works (backend bypass)
- Uses App.useApp() for modal context instead of static Modal.confirm

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

## Development & Testing

### Email Verification Testing
- Resend free tier only sends to registered email
- For demos/testing: use master code `000000` (always valid)
- Backend shows generated codes in console for debugging

### User Model Updates
- Migrated from single `name` field to `firstName`/`lastName`
- Added: gender, birthDate, whatsappCode, whatsappNumber
- MongoDB Atlas requires IP whitelist (add current IP in Network Access)

### Recent Implementations
- Split-screen auth layout with hero image
- Complete 8-field registration form with validation
- Email verification flow with Resend integration
- Phone confirmation modal
- Verification code input modal with resend functionality
- Master code bypass for development
- Mona Sans typography throughout
- Boxful color palette applied to all auth components
