# Project Plan – 4-Week Simulated Work Sprint

## Project Title

**Ticket Cancellation – A Transparent Bus Ticket Cancellation & Refund Tracking System**

---

## 1. Problem Statement & Solution Overview

### Problem Statement

Intercity bus ticket cancellations and refunds are often opaque, inconsistent, and poorly communicated to passengers. Users frequently face unclear cancellation rules, unpredictable refund timelines, and limited visibility into refund status. This lack of transparency leads to loss of trust, customer dissatisfaction, and accountability gaps between passengers, bus operators, and booking platforms.

The problem is especially impactful in public transport systems where high passenger volume, multiple operators, and manual workflows increase the chances of disputes and delays.

### Solution Overview

**TaskFlow** is a web-based task and project management system that allows users to create projects, manage tasks, assign responsibilities, and track progress through a clean dashboard. It provides secure authentication, role-based access, and a scalable backend designed for real-world usage.

#### Checklist

- **Why is this problem relevant?**  
  Refund disputes are common and directly impact user trust and satisfaction.

- **Who faces it (target users)?**  
  Intercity bus passengers and transport operators.

- **What value does your solution bring?**  
  Transparency, predictable refunds, and clear accountability.

---

## 2. Scope & Boundaries

### In Scope (MVP)

- User authentication (Signup/Login)
- Project & task management (CRUD)
- Role-based access (Owner / Member)
- Dashboard with task overview
- Secure APIs with validation
- Dockerized local & cloud deployment

### Out of Scope

- Mobile application
- Real-time chat
- Advanced analytics
- Payment or subscription system

---

## 3. Roles & Responsibilities

| Role          | Team Member | Key Responsibilities                                                     |
| ------------- | ----------- | ------------------------------------------------------------------------ |
| Frontend Lead | Indhuja     | UI development, routing, forms, state management, API integration        |
| Backend Lead  | Preetham    | API design, authentication, authorization, business logic, Redis caching |
| Database Lead | Raghav      | PostgreSQL schema design, Prisma ORM, migrations, query optimization     |

---

## 4. Sprint Timeline (4 Weeks)

### Week 1 – Setup & Design

**Focus:** Architecture & planning

**Milestones / Deliverables:**

- Project initialization (Next.js + TypeScript)
- GitHub branching & PR workflow
- High-Level Design (HLD)
- Low-Level Design (LLD)
- Database schema for Users, Tickets, Refunds, Policies
- Environment variable strategy

---

### Week 2 – Core Backend & Database

**Focus:** Backend logic & persistence

**Milestones / Deliverables:**

- Prisma ORM setup & migrations
- Authentication APIs (Signup/Login)
- Refund calculation engine
- Ticket cancellation APIs
- Input validation with Zod
- Global API response & error handling
- Redis caching for refund status

---

### Week 3 – Frontend & Integration

**Focus:** User experience & integration

**Milestones / Deliverables:**

- Public & protected routes
- User dashboard (tickets & refunds)
- Cancellation flow UI
- Operator policy management UI
- State management & API integration
- Loading & error handling states

---

### Week 4 – Finalization & Deployment

**Focus:** Production readiness

**Milestones / Deliverables:**

- Docker & Docker Compose setup
- CI/CD pipeline (GitHub Actions)
- Cloud deployment
- Secure secrets management
- Final testing & documentation
- MVP demo preparation

---

## 5. Deployment and Testing Plan

### Testing Strategy

- Unit tests for refund calculation logic
- API testing for cancellation & refund endpoints
- Manual end-to-end testing:
  - Ticket cancellation flow
  - Refund visibility & status updates
  - Validation & error scenario testing

### Deployment Strategy

- Dockerize frontend, backend, database, and Redis
- CI/CD pipeline using GitHub Actions
- Deploy to cloud infrastructure (AWS/Azure)
- Manage secrets via environment variables and secret managers

---

## 6. MVP (Minimum Viable Product)

### Core MVP Features

- User signup & login
- View booked tickets
- Request ticket cancellation
- Transparent refund calculation breakdown
- Refund status tracking
- Operator/admin policy configuration

---

## 7. Core Project Components

### Authentication

- Sign Up
- Sign In
- Secure JWT-based sessions

### Core Application (Post-Login)

- User Dashboard: Tickets & refund status
- Cancellation Request Page
- Refund Details Page (rule breakdown)
- Operator/Admin Dashboard (basic)

### General Pages & Components

- Home page explaining transparency goals
- Navbar & footer
- Error & loading fallback pages

---

## 8. Functional Requirements

- Users can authenticate securely
- Users can view their tickets
- Users can initiate ticket cancellations
- System calculates refunds based on defined rules
- Users can track refund status
- Operators can manage cancellation policies

---

## 9. Non-Functional Requirements

- **Performance:** Refund calculations under 300ms
- **Scalability:** Support 100 concurrent users
- **Security:** Encrypted passwords, protected APIs
- **Reliability:** Consistent refund calculation, no data loss

---

## 10. Success Metrics

- Successful cancellation & refund flows
- Transparent refund breakdown visible to users
- End-to-end frontend–backend integration
- Stable deployed MVP
- Positive mentor/demo feedback

---

## 11. Risks & Mitigation

| Risk                     | Potential Impact   | Mitigation Plan                   |
| ------------------------ | ------------------ | --------------------------------- |
| Complex refund rules     | Delayed backend    | Start with simplified rule engine |
| Frontend blocked by APIs | Integration delays | Use mock responses                |
| Time constraints         | Feature overflow   | Strict MVP scope control          |
