| Service    | Responsibility                                    |
| ---------- | ------------------------------------------------- |
| Angular    | UI                                                |
| NestJS     | API Gateway + Authentication + Broker Integration |
| FastAPI    | AI, Indicators, Analysis                          |
| PostgreSQL | Persistent Storage                                |
| Redis      | Live Cache                                        |
| Alice Blue | Market Data                                       |

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
