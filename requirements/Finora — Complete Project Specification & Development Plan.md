# FINORA
## Personal Finance Tracker & Financial Intelligence Platform

### Tagline
**Spend Smarter. Save More.**

---

# 1. Project Vision

Finora একটি modern, user-friendly personal finance management platform।

এর মূল উদ্দেশ্য শুধু user's income এবং expense track করা নয়। বরং user's financial data analyze করে তাকে দেখানো:

- কোথায় বেশি খরচ হচ্ছে
- কোন খরচ অপ্রয়োজনীয়
- কোন category-তে budget exceed হচ্ছে
- কত টাকা save হচ্ছে
- ভবিষ্যতে কত টাকা খরচ হতে পারে
- কীভাবে আরও টাকা save করা সম্ভব
- কোন financial habit ভালো/খারাপ হচ্ছে

প্রথম Version-এ কোনো AI ব্যবহার করা হবে না।

Financial insights তৈরি হবে:

**Database Data + SQL Queries + Analytics + Rule-Based Recommendation Engine**

Future Version-এ AI layer যোগ করা যাবে।

---

# 2. Platforms

Responsive Web Application


Android App

Web এবং Mobile একই backend API এবং একই database ব্যবহার করবে।

Architecture:

                    FINORA

          ┌──────────┴──────────┐
          │                     │
       WEB APP              MOBILE APP
       Next.js            React Native
          │                     │
          └──────────┬──────────┘
                     │
                  REST API
                     │
                Backend API
                     │
                 PostgreSQL


একজন user Website অথবা Mobile App—যেখান থেকেই account তৈরি/login করুক না কেন, একই financial data access করতে পারবে।

---

# 3. Recommended Technology Stack

## Web Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts অথবা অন্য modern charting library
- React Hook Form
- Zod
- TanStack Query

## Backend

Recommended:

- NestJS
- TypeScript
- REST API

Alternative for early MVP:

- Next.js API

Long-term scalable architecture-এর জন্য NestJS preferred।

## Database

- PostgreSQL

## Authentication

- JWT-based authentication
- Google OAuth
- Secure password hashing
- Refresh token/session management

## Mobile — Future

- React Native
- Expo
- TypeScript

## Deployment — Future

Web:
- Vercel বা equivalent

Backend:
- Railway / Render / AWS / VPS

Database:
- Managed PostgreSQL

---

# 4. Core Features 

Version 1-এ নিচের featureগুলো implement করতে হবে।

## 4.1 Authentication

- User Registration
- Login
- Logout
- Google Login
- Forgot Password
- Reset Password
- Session Management
- Profile
- Account Settings

---

# 5. User Profile

User profile-এ থাকবে:

- Name
- Email
- Profile Picture
- Default Currency
- Language
- Timezone
- Date Format
- Notification Preferences

Default currency:

**BDT (৳)**

Future-এ multi-currency support থাকবে।

---

# 6. Dashboard

Dashboard হবে application's main screen।

Dashboard-এ থাকবে:

### Financial Summary

- Total Balance
- Total Income
- Total Expense
- Total Savings
- Savings Rate

### Time Filter

- Today
- This Week
- This Month
- This Year
- Custom Date Range

### Charts

- Income vs Expense
- Expense by Category
- Monthly Expense Trend
- Monthly Income Trend
- Savings Trend

### Other Sections

- Recent Transactions
- Budget Status
- Saving Goals
- Upcoming Recurring Transactions
- Subscription Summary
- Financial Insights
- Quick Add Expense
- Quick Add Income

---

# 7. Expense Management

User expense create/edit/delete করতে পারবে।

Expense fields:

- Amount
- Category
- Sub-category
- Date
- Time
- Payment Method
- Note
- Tags
- Receipt/Image
- Location (optional)
- Recurring Status

Example:

Food
Restaurant
৳450
Cash
15 September 2026

---

# 8. Expense Categories

Default categories:

- Food
- Transport
- Housing
- Shopping
- Bills & Utilities
- Entertainment
- Health
- Education
- Travel
- Technology
- Family
- Personal Care
- Other

User নিজের category তৈরি করতে পারবে।

Category fields:

- Name
- Icon
- Description
- Parent Category
- Status

---

# 9. Income Management

Income create/edit/delete করা যাবে।

Income categories:

- Salary
- Freelance
- Business
- Investment
- Bonus
- Gift
- Other

Income fields:

- Amount
- Source
- Category
- Date
- Note
- Recurring Status

---

# 10. Transfer Management

Transfer-কে expense হিসেবে count করা যাবে না।

Examples:

- Bank → Cash
- Cash → Bank
- Bank → bKash
- Bank → Savings
- Wallet → Bank

Transfer fields:

- From Account
- To Account
- Amount
- Date
- Note

---

# 11. Financial Accounts

User একাধিক account রাখতে পারবে।

Examples:

- Cash
- Bank Account
- bKash
- Nagad
- Credit Card
- Savings Account

প্রতিটি account-এর:

- Name
- Type
- Balance
- Currency
- Status

থাকবে।

---

# 12. Transaction Management

একটি centralized transaction system থাকবে।

Transaction types:

- Income
- Expense
- Transfer

Features:

- Add
- Edit
- Delete
- Search
- Filter
- Sort
- Date range
- Category filter
- Account filter
- Payment method filter
- Tags
- Transaction details

---

# 13. Budget Management

User category-wise budget set করতে পারবে।

Example:

Food Budget:

**৳8,000 / month**

Current:

**৳6,400**

Progress:

**80%**

Budget status:

- Normal
- Warning
- Exceeded

Rules:

80% → Warning

100%+ → Exceeded

---

# 14. Saving Goals

User saving goal তৈরি করতে পারবে।

Example:

Goal:
**MacBook**

Target:
**৳150,000**

Current:
**৳65,000**

Remaining:
**৳85,000**

Progress:
**43.3%**

System calculate করবে:

- Required monthly saving
- Estimated completion date
- Current saving rate
- Goal progress

---

# 15. Daily Report

Daily report দেখাবে:

- Today's Income
- Today's Expense
- Today's Saving
- Number of Transactions
- Highest Expense
- Category breakdown
- Comparison with average daily spending

Example:

"Today's spending is 18% higher than your average daily spending."

---

# 16. Monthly Report

Monthly report:

- Total Income
- Total Expense
- Total Saving
- Savings Rate
- Category-wise spending
- Budget performance
- Previous month comparison
- Average daily expense
- Highest spending day
- Highest spending category
- Monthly trend

---

# 17. Yearly Report

Yearly report:

- Annual Income
- Annual Expense
- Annual Saving
- Average monthly income
- Average monthly expense
- Savings rate
- Best saving month
- Highest spending month
- Category-wise yearly spending
- Monthly comparison
- Annual trend

---

# 18. Advanced Analytics

System user's historical data analyze করবে।

Examples:

- Spending increased/decreased percentage
- Income growth
- Savings growth
- Category growth
- Average spending
- Spending frequency
- Highest spending day
- Highest spending category
- Weekend vs weekday spending
- Month-to-month comparison
- 3-month trend
- 6-month trend
- Yearly trend

---

# 19. Rule-Based Financial Intelligence

AI ছাড়া recommendation engine তৈরি করা হবে।

Architecture:

Database
↓
SQL Queries
↓
Analytics Service
↓
Rules Engine
↓
Insight Generator
↓
Dashboard

Example rules:

IF food_expense > previous_month_food * 1.20

THEN:

"Your food spending increased significantly this month."

---

IF expense > category_budget

THEN:

"You exceeded your Food budget by ৳X."

---

IF savings_rate < 20%

THEN:

"Your current savings rate is below your target."

---

IF current_spending_rate > previous_average

THEN:

"Your spending is higher than your recent average."

---

# 20. Financial Insights

Dashboard-এ একটি section থাকবে:

## Financial Insights

Examples:

- Food spending increased 25%.
- Shopping exceeded budget.
- Savings improved by 12%.
- Transport spending decreased.
- Your current spending rate may cause month-end overspending.
- You could potentially save ৳2,500 by reducing selected categories.

Insights তিন ধরনের হতে পারে:

### Positive
Green / success indicator

### Warning
Yellow / warning indicator

### Critical
Red / danger indicator

---

# 21. Expense Forecast

Historical/current spending pattern ব্যবহার করে estimated month-end expense calculate করা হবে।

Example:

Current date:
15 September

Current expense:
৳18,500

Estimated month-end expense:
৳37,000

System দেখাবে:

"You are currently on track to spend approximately ৳37,000 this month."

Forecast AI-based হবে না।

Simple statistical/calculation-based model ব্যবহার করা হবে।

---

# 22. What-If Simulator

User spending পরিবর্তন করলে কী হবে তা calculate করা যাবে।

Example:

Current Food Expense:

৳10,000

User selects:

"Reduce Food spending by 20%"

System:

New Expense:
৳8,000

Monthly Saving:
৳2,000

Yearly Saving:
৳24,000

---

# 23. Subscription Tracking

Recurring subscriptions track করা যাবে।

Examples:

- Netflix
- Spotify
- Google One
- Adobe
- Hosting
- Software

System দেখাবে:

Monthly subscription cost

Yearly subscription cost

Example:

Monthly:
৳3,000

Yearly:
৳36,000

---

# 24. Recurring Transactions

Recurring income/expense:

- Salary
- Rent
- Internet
- Electricity
- Subscription
- Loan payment
- Insurance

Frequency:

- Daily
- Weekly
- Monthly
- Yearly
- Custom

---

# 25. Receipt Management

Expense-এর সাথে receipt/image attach করা যাবে।

Version 1:

- Upload receipt
- View receipt
- Delete receipt

Future:

OCR + AI receipt scanning.

---

# 26. Notifications

Notifications:

- Budget warning
- Budget exceeded
- Upcoming recurring expense
- Saving goal reminder
- Subscription reminder
- Financial insight
- Monthly report available

User notification settings control করতে পারবে।

---

# 27. Search & Filter

Transaction search:

- Keyword
- Category
- Account
- Date
- Amount
- Transaction type
- Tags

Sorting:

- Newest
- Oldest
- Highest amount
- Lowest amount

---

# 28. Export

User financial data export করতে পারবে।

Formats:

- CSV
- Excel
- PDF

Reports:

- Monthly report
- Yearly report
- Custom date report

---

# 29. Multi-Currency Ready Architecture

Default:

BDT

Future support:

- USD
- EUR
- GBP
- INR
- SAR
- AED
- etc.

Database এবং transaction architecture শুরু থেকেই currency-ready রাখতে হবে।

---

# 30. Gamification

Version 1-এ basic gamification:

- Saving Streak
- Monthly Saving Challenge
- No-Spend Challenge
- Achievement
- Milestones

Examples:

"Saved ৳10,000 this month."

"7-day saving streak."

---

# 31. Financial Health Score

একটি score:

## Financial Health
### 82 / 100

Score calculate হবে:

- Savings Rate
- Expense/Income Ratio
- Budget Performance
- Spending Stability
- Saving Goal Progress
- Recurring Expense Load

AI ব্যবহার করা হবে না।

Score calculation predefined formula/rules-এর মাধ্যমে হবে।

---

# 32. UI/UX Design

Design হবে:

**Modern + Minimal + Premium + Friendly**

Primary color:

**Navy Blue**

Background:

**White / Off-white**

Recommended visual direction:

- White background
- Navy Blue primary
- Light blue accents
- Soft gray borders
- Rounded cards
- Clean typography
- Minimal shadows
- Clear charts
- Spacious layout

Color direction:

Primary:
Navy Blue

Secondary:
Light Blue

Background:
White

Surface:
Very Light Gray

Text:
Dark Navy / Dark Gray

Success:
Green

Warning:
Amber

Danger:
Red

---

# 33. Dashboard UI Philosophy

Dashboard cluttered হবে না।

Priority:

1. Balance
2. Income
3. Expense
4. Savings
5. Financial Health
6. Insights
7. Charts
8. Budget
9. Goals
10. Transactions

User যেন 5–10 seconds-এর মধ্যে নিজের financial situation বুঝতে পারে।

---

# 34. Responsive Design

Website:

- Mobile
- Tablet
- Laptop
- Desktop
- Large Desktop

সব screen size-এর জন্য responsive হতে হবে।

Mobile browser-এও app-like experience দিতে হবে।

---

# 35. Future Mobile Application

Web Version complete হওয়ার পরে:

React Native + Expo ব্যবহার করে:

- Android


application তৈরি করা হবে।

Mobile app একই:

- Authentication
- Backend
- API
- Database

ব্যবহার করবে।

কোনো আলাদা financial database থাকবে না।

---

# 36. API Architecture

Backend API REST-based হবে।

Example:

Authentication:

POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh

Users:

GET /users/me
PATCH /users/me

Accounts:

GET /accounts
POST /accounts
PATCH /accounts/:id
DELETE /accounts/:id

Transactions:

GET /transactions
POST /transactions
GET /transactions/:id
PATCH /transactions/:id
DELETE /transactions/:id

Expenses:

GET /expenses
POST /expenses

Income:

GET /income
POST /income

Budgets:

GET /budgets
POST /budgets
PATCH /budgets/:id
DELETE /budgets/:id

Goals:

GET /saving-goals
POST /saving-goals
PATCH /saving-goals/:id

Reports:

GET /reports/daily
GET /reports/monthly
GET /reports/yearly

Analytics:

GET /analytics/spending
GET /analytics/savings
GET /analytics/categories

Insights:

GET /insights

Forecast:

GET /forecast

---

# 37. Database Core Tables

Initial database structure:

users

accounts

categories

transactions

budgets

saving_goals

subscriptions

recurring_transactions

notifications

receipts

financial_insights

user_settings

tags

transaction_tags

---

# 38. Important Database Relationships

User:

1 User → Many Accounts

1 User → Many Transactions

1 User → Many Budgets

1 User → Many Saving Goals

1 User → Many Subscriptions

1 User → Many Notifications

Category:

1 Category → Many Transactions

Account:

1 Account → Many Transactions

Transaction:

Many Transactions → 1 User

Many Transactions → 1 Category

Many Transactions → 1 Account

---

# 39. Security Requirements

Because this is financial data, security must be considered from the beginning.

Required:

- Password hashing
- JWT/session security
- HTTPS
- Input validation
- SQL injection protection
- Rate limiting
- Authentication middleware
- Authorization
- User data isolation
- Secure file upload
- Secure environment variables
- Database backups
- API validation
- Error handling
- Audit-friendly transaction records

একজন user কখনো অন্য user's financial data access করতে পারবে না।

---

# 40. Data Ownership Rule

সব transaction অবশ্যই authenticated user's ID-এর সাথে associated থাকবে।

Example:

user_id = 102

তার transactions:

transaction.user_id = 102

API request-এর সময় backend অবশ্যই verify করবে যে requested resource ওই user-এর কিনা।

---

# 41. Project Folder Structure

Recommended monorepo:

finora/

apps/

web/
    Next.js application

api/
    NestJS backend

mobile/
    React Native + Expo
    (future)

packages/

types/
    Shared TypeScript types

validation/
    Shared validation schemas

utils/
    Shared utility functions

config/
    Shared configuration

docs/

database/
    Database documentation

api/
    API documentation

README.md

---

# 42. Development Phases

## Phase 1 — Foundation

- Project setup
- Git repository
- Next.js setup
- Backend setup
- PostgreSQL setup
- Environment configuration
- Authentication
- Database migration
- Basic API

---

## Phase 2 — Financial Core

- Accounts
- Categories
- Transactions
- Expense
- Income
- Transfer

---

## Phase 3 — Dashboard

- Balance
- Income
- Expense
- Savings
- Charts
- Recent transactions

---

## Phase 4 — Budget & Goals

- Budgets
- Saving goals
- Progress tracking

---

## Phase 5 — Reports

- Daily
- Weekly
- Monthly
- Yearly
- Custom range

---

## Phase 6 — Intelligence

- Analytics
- Financial Health Score
- Rule-based Insights
- Spending analysis
- Forecast
- What-if Simulator

---

## Phase 7 — Recurring & Subscriptions

- Recurring transactions
- Subscription tracking
- Upcoming payments
- Notifications

---

## Phase 8 — Export & Polish

- CSV
- Excel
- PDF
- Receipt upload
- Search
- Filters
- Responsive improvements
- Accessibility
- Performance optimization

---

## Phase 9 — Production

- Security audit
- API testing
- Database optimization
- Error monitoring
- Backup
- Deployment
- Production testing

---


# 44. AI Policy

Version 1:

**NO AI**

All intelligence will be based on:

- SQL
- Statistics
- Calculations
- Rules
- Thresholds
- Historical comparison
- Trend analysis

Future Version:

AI layer can be added on top of existing analytics engine.

Future architecture:

Database
↓
Analytics Engine
↓
Rule Engine
↓
AI Engine
↓
Advanced Personal Finance Advisor

---

# 45. more Features now

AI ছাড়াও :

- Bank integration
- Card integration
- Automatic transaction import
- AI receipt scanning
- AI transaction categorization
- Investment tracking
- Debt management
- Family/shared wallet
- Couple finance
- Multi-user wallet
- Advanced currency conversion
- Financial assistant
- Advanced prediction
- Android application
- Push notifications
- Offline mobile transactions

---

# 46. Product Philosophy

Finora শুধুমাত্র একটি expense tracker হবে না।

It should answer three questions:

### 1. Where is my money going?

Tracking

### 2. How am I doing financially?

Analytics

### 3. What should I change?

Recommendations

Therefore:

**TRACK → ANALYZE → IMPROVE**

এটাই Finora-এর core product philosophy।

---

# 47. Primary Success Metric

Finora-এর success শুধু কতজন user transaction add করছে তা দিয়ে measure করা হবে না।

Important metrics:

- Monthly Active Users
- Transactions per user
- Budget creation rate
- Saving goal creation rate
- Monthly retention
- Savings improvement
- Budget adherence
- User engagement
- Financial Health improvement

---

# 48. Final Product Structure

Finora-এর main navigation:

Dashboard

Transactions

Income

Expenses

Budgets

Saving Goals

Accounts

Reports

Analytics

Subscriptions

Recurring

Insights

Challenges

Notifications

Settings

---

# 49. Final Technology Decision

Web:

**Next.js + TypeScript**

Backend:

**NestJS + TypeScript**

Database:

**PostgreSQL**

Web UI:

**Tailwind CSS**

Charts:

**Recharts**

Validation:

**Zod**

Data fetching:

**TanStack Query**

Mobile:

**React Native + Expo**

Architecture:

**API-first + Mobile-ready**

AI:

**Not included in Version 1**

---

# 50. Final Goal

Build a premium, simple, fast and highly usable personal finance platform where users can manage their complete financial life from one place.

A user should be able to open Finora and immediately understand:

**How much money do I have?**

**How much did I earn?**

**How much did I spend?**

**Where did I spend it?**

**How much did I save?**

**Am I overspending?**

**Where can I reduce expenses?**

**How much can I potentially save?**

**Am I financially improving?**

The first release should establish a strong data and analytics foundation so that future Mobile Apps and AI-powered financial intelligence can be added without rebuilding the core system.