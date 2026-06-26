Complete folder structures (Angular, NestJS, FastAPI) - done on 26/06/2026
All domain models (30–40 core models)
Database ER diagram
Microservice communication diagram
WebSocket event flow
AI pipeline
Sequence diagrams (e.g., "Alice Blue Tick → AI Recommendation → Angular")
Development roadmap (20+ milestones)

## ROADMAP

## Phase 1: Foundation

FastAPI
NestJS
PostgreSQL
Prisma
Redis

---

## Phase 2: Market Data

Alice Blue login
WebSocket
Tick ingestion
Market Module

---

## Phase 3: Analytics

RSI
EMA
VWAP
PCR
OI
IV

---

## Phase 4: AI

Sentiment scoring
Trade recommendations
Explanations

26/06/2026
Arch:
Angular

                       │
         REST + Socket.IO
                       │
                NestJS Gateway
                       │
     ┌─────────────────┼─────────────────┐
     │                 │                 │

PostgreSQL Redis FastAPI AI
│ │
└────────────── Alice Blue ──────────┘
