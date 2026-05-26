# SpendSmart AI

A modern AI-powered personal finance tracker built with React, Express, PostgreSQL, and Machine Learning.

SpendSmart AI helps users track expenses, visualize spending habits, predict future expenses using Machine Learning, and receive personalized saving recommendations.

---

# Features

* Track daily expenses by category
* Visualize spending using interactive charts
* Predict next month’s spending using Machine Learning
* Get AI-powered saving recommendations
* Download expense reports as CSV files
* Filter expenses by category and month
* Real-time frontend updates with React Query
* Shared API contracts using OpenAPI

---

# Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Recharts
* Wouter
* React Query

## Backend

* Node.js
* Express.js
* TypeScript

## Database

* PostgreSQL
* Drizzle ORM

## Machine Learning

* ml-regression
* Simple Linear Regression

## API & Validation

* OpenAPI
* Orval
* Zod

## Monorepo & Tooling

* pnpm Workspaces

---

# What Does This App Do?

SpendSmart AI is a personal finance web application that allows users to:

* Record and manage expenses
* Analyze spending patterns
* View charts and trends
* Predict future monthly spending
* Receive saving recommendations
* Export expense reports as CSV files

---

# Project Structure

```txt
workspace/
│
├── artifacts/
│   ├── api-server/             # Backend API server
│   └── expense-ai/             # Frontend React application
│
├── lib/
│   ├── db/                     # Database schema and connection
│   ├── api-spec/               # OpenAPI specification
│   ├── api-client-react/       # Generated React API hooks
│   └── api-zod/                # Generated backend validators
│
└── pnpm-workspace.yaml
```

## Why a Monorepo?

A monorepo allows both frontend and backend applications to share:

* Type definitions
* API contracts
* Validation schemas
* Utility code

This reduces duplication and keeps the entire application consistent.

---

# Database Layer

## PostgreSQL

PostgreSQL stores all expense data permanently in relational tables.

## Drizzle ORM

Drizzle ORM provides a TypeScript-first way to interact with PostgreSQL without writing raw SQL queries.

---

# Expenses Table

File:

```txt
lib/db/src/schema/expenses.ts
```

| Column      | Description                |
| ----------- | -------------------------- |
| id          | Unique ID for each expense |
| amount      | Expense amount             |
| category    | Expense category           |
| description | Optional note              |
| date        | Expense date               |
| created_at  | Record creation timestamp  |

Each row represents a single expense entry.

---

# API Server

## Backend Architecture

The backend is built using:

* Node.js
* Express.js
* TypeScript

The frontend never communicates directly with the database.
Instead:

1. Frontend sends requests
2. Express handles the request
3. Database operations execute through Drizzle ORM
4. JSON responses return to the frontend

---

# API Server Structure

```txt
api-server/src/
├── index.ts
├── app.ts
├── routes/
│   ├── index.ts
│   ├── health.ts
│   ├── expenses.ts
│   ├── analytics.ts
│   └── reports.ts
└── lib/
    └── logger.ts
```

---

# API Endpoints

| Endpoint                         | Method | Description                 |
| -------------------------------- | ------ | --------------------------- |
| `/api/healthz`                   | GET    | Health check                |
| `/api/expenses`                  | GET    | Fetch expenses              |
| `/api/expenses`                  | POST   | Create expense              |
| `/api/expenses/:id`              | DELETE | Delete expense              |
| `/api/analytics/summary`         | GET    | Monthly analytics summary   |
| `/api/analytics/by-category`     | GET    | Spending by category        |
| `/api/analytics/trend`           | GET    | Monthly spending trend      |
| `/api/analytics/predict`         | GET    | Predict next month spending |
| `/api/analytics/recommendations` | GET    | Saving recommendations      |
| `/api/reports/download`          | GET    | Download CSV report         |

---

# Machine Learning

## Simple Linear Regression

SpendSmart AI uses Simple Linear Regression to estimate future monthly expenses.

The algorithm:

1. Collects historical monthly spending
2. Converts months into numeric values
3. Fits a trend line
4. Predicts the next month’s total spending

---

# Example Prediction

## Historical Data

```txt
Feb 2026 → $430
Mar 2026 → $460
Apr 2026 → $490
May 2026 → $519
```

## Regression Equation

genui{"math_block_widget_always_prefetch_v2":{"content":"y = 30x + 430"}}

## Prediction

```txt
Jun 2026 → $550 predicted
```

---

# Confidence Score (R²)

The prediction confidence uses the R² score.

| R² Score | Meaning                 |
| -------- | ----------------------- |
| 1.0      | Perfect prediction      |
| 0.5      | Moderate prediction     |
| 0.0      | Random spending pattern |

Higher-quality historical data improves prediction accuracy.

---

# Prediction Logic

File:

```txt
artifacts/api-server/src/routes/analytics.ts
```

```ts
const regression = new SimpleLinearRegression(x, y);

const predictedTotal = regression.predict(sortedMonths.length);

const confidence = regression.score(x, y);
```

---

# Frontend

## Technologies

* React
* Vite
* Tailwind CSS
* Recharts
* Wouter

---

# Frontend Structure

```txt
artifacts/expense-ai/src/
│
├── main.tsx
├── App.tsx
│
├── pages/
│   ├── dashboard.tsx
│   ├── expenses.tsx
│   ├── analytics.tsx
│   ├── recommendations.tsx
│   └── not-found.tsx
│
└── components/
    ├── layout.tsx
    └── ui/
```

---

# Routing

| Route              | Page                 |
| ------------------ | -------------------- |
| `/`                | Dashboard            |
| `/expenses`        | Expenses Page        |
| `/analytics`       | Analytics Page       |
| `/recommendations` | Recommendations Page |

---

# Charts Used

## Dashboard

* AreaChart → Monthly trends
* PieChart → Category distribution

## Analytics

* PieChart → Category analysis
* BarChart → Monthly history
* BarChart → Prediction visualization

---

# API Contract

## OpenAPI + Orval

The API specification lives in:

```txt
lib/api-spec/openapi.yaml
```

This specification automatically generates:

* React API hooks
* Backend validators
* Shared request/response types

---

# Generated Packages

```txt
openapi.yaml
│
├── lib/api-client-react/
│   ├── useListExpenses()
│   ├── useCreateExpense()
│   └── useGetPrediction()
│
└── lib/api-zod/
    ├── CreateExpenseBody
    └── ListExpensesQueryParams
```

---

# Zod Validation

Zod validates incoming request data before saving it into the database.

Example:

* amount must be a number
* category must be a string
* date must be valid

This prevents invalid data from entering the system.

---

# Request Flow

## Adding a New Expense

```txt
1. User submits expense form
        ↓
2. React collects form data
        ↓
3. API hook sends POST request
        ↓
4. Express receives request
        ↓
5. Zod validates request body
        ↓
6. Drizzle inserts data into PostgreSQL
        ↓
7. JSON response returns to frontend
        ↓
8. React Query refreshes UI automatically
```

---

# Architecture Diagram

```txt
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                             │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              React Frontend (Vite)                  │  │
│   │                                                     │  │
│   │  Dashboard | Expenses | Analytics | Recommendations │  │
│   │                    ↕ API Hooks                      │  │
│   └─────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP Requests
┌───────────────────────────▼─────────────────────────────────┐
│                    EXPRESS API SERVER                        │
│                                                             │
│   /expenses → expenses.ts                                   │
│   /analytics → analytics.ts                                 │
│   /reports → reports.ts                                     │
│                    ↕ Drizzle ORM                            │
└───────────────────────────┬─────────────────────────────────┘
                            │ SQL Queries
┌───────────────────────────▼─────────────────────────────────┐
│                    POSTGRESQL DATABASE                       │
│                                                             │
│   expenses table: id, amount, category, description, date   │
└─────────────────────────────────────────────────────────────┘
```

---

# Technology Glossary

| Technology        | Description                     |
| ----------------- | ------------------------------- |
| Node.js           | Run JavaScript on the server    |
| TypeScript        | Strongly typed JavaScript       |
| Express           | Backend API framework           |
| React             | UI library                      |
| Vite              | Frontend build tool             |
| PostgreSQL        | Relational database             |
| Drizzle ORM       | Type-safe ORM                   |
| Tailwind CSS      | Utility-first CSS framework     |
| Recharts          | React charting library          |
| OpenAPI           | API specification standard      |
| Zod               | Runtime validation library      |
| pnpm              | Package manager                 |
| Linear Regression | ML prediction algorithm         |
| Monorepo          | Multiple apps in one repository |

---

# Getting Started

## Prerequisites

Install:

* Node.js 20+
* pnpm
* PostgreSQL

Install pnpm globally:

```bash
npm install -g pnpm
```

---

# Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/spendsmart
```

---

# Installation

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Push Database Schema

```bash
pnpm --filter @workspace/db run push
```

## 3. Start API Server

```bash
pnpm --filter @workspace/api-server run dev
```

Runs on:

```txt
http://localhost:5000
```

## 4. Start Frontend

```bash
pnpm --filter @workspace/expense-ai run dev
```

Runs on:

```txt
http://localhost:20100
```

---

# OpenAPI Code Generation

If you update `openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

# Type Checking

```bash
pnpm run typecheck
```

---

# Future Improvements

* User authentication
* JWT security
* Multi-user support
* AI chatbot for finance advice
* Budget goals and alerts
* OCR receipt scanning
* Mobile app support
* Advanced ML forecasting

---

# Built With

* React
* Express
* PostgreSQL
* Drizzle ORM
* TypeScript
* Machine Learning

---
