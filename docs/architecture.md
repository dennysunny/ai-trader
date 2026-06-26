25/06/2026
PHASE 1:
+----------------+
| Angular UI |
+-------+--------+
|
REST / WebSocket
|
+-------v--------+
| NestJS |
+-------+--------+
|
+-----------------+----------------+
| |
PostgreSQL FastAPI AI
| |
+-----------------+----------------+
|
Redis

26/06/2026
Phase 2 - Market Data Pipeline

Alice Blue
│
▼
Broker Adapter
│
▼
Market Data Pipeline
│
┌────┴───────────┐
│ │
▼ ▼
Redis PostgreSQL
│ │
▼ ▼
AI Engine Historical Data
│
▼
Recommendation
│
▼
Angular
