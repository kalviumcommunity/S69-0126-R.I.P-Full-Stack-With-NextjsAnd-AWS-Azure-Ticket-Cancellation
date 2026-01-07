# Ticket Cancellation – Transparent Bus Ticket Cancellation & Refund Tracking System

## Project Overview

Intercity bus ticket cancellations and refunds are often opaque and inconsistent. Passengers face unclear cancellation rules, unpredictable refund timelines, and limited visibility into refund status. This lack of transparency reduces trust and creates accountability gaps between passengers, operators, and platforms.

This project aims to build a **transparent and predictable ticket cancellation and refund tracking system** that clearly explains refund rules, timelines, and status to users.

This repository currently contains a **basic Next.js setup**, which will be expanded in future sprints.

---

## Tech Stack (Initial Setup)

- Next.js
- React
- TypeScript
- Node.js

---

## Folder Structure (Basic Next.js Setup)

# Project Structure

```text
├── app/
│   ├── page.tsx          # Default home page
│   ├── layout.tsx        # Root layout for the app
│   └── globals.css       # Global styles
├── public/
│   └── favicon.ico       # Static assets
├── .gitignore            # Git ignore rules
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```
---

## Folder Explanation

- **`app/`**  
  Uses the Next.js App Router. This folder will contain all pages, layouts, and routes of the application.

- **`page.tsx`**  
  The default home page of the application.

- **`layout.tsx`**  
  Defines the root layout shared across all pages.

- **`globals.css`**  
  Contains global styles applied across the app.

- **`public/`**  
  Stores static files such as icons and images.

---

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```
### 2. Run the development server
```bash
npm run dev
```
### 3. Open the app in browser
```bash
http://localhost:3000
```

## Reflection

This structure follows the default Next.js App Router convention, keeping the project simple and easy to understand for all team members.

Clear separation between routing (app/) and static assets (public/)

Easy to introduce new pages like dashboard, login, and admin panels

Supports gradual addition of APIs, authentication, and database logic

Prevents over-engineering in early stages while allowing smooth scaling.