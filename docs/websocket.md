# AliceBlue WebSocket Connection Flow

Authenticated ✅
↓
userSession
↓
Create WS Session
↓
Double SHA256(userSession)
↓
Connect to Alice Blue WebSocket
↓
Send Connection Message
↓
Receive cf: OK
↓
Start Heartbeat
↓
CONNECTED 🟢

## done on 18/07/2026
