# Feed Activity System Backend

A backend service for an activity feed and notification system.

## Setup & Run

### Prerequisites
- Docker & Docker Compose
- Node.js (optional, can run via Docker)

### Running with Docker (Recommended)

1. Start services:
   ```bash
   docker-compose up --build
   ```
2. The API will be available at `http://localhost:3000`.

### Running Locally

1. Start Postgres (ensure it matches `.env` config).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run app:
   ```bash
   npm run dev
   ```

## API Endpoints

### 1. Create Event
**POST** `/events`
Distributes event to target users.
```json
{
  "actor_id": "user_1",
  "verb": "like",
  "object_type": "photo",
  "object_id": "photo_123",
  "target_users": ["user_2", "user_3"]
}
```

### 2. Get Feed
**GET** `/feed?user_id=user_2&limit=20`
Returns paginated feed with caching.

### 3. Get Notifications (Polling)
**GET** `/notifications?user_id=user_2`

### 4. Real-time Notifications (SSE)
**GET** `/notifications/stream?user_id=user_2`
Connects to Server-Sent Events stream.

### 5. Analytics
**GET** `/top`
Returns event counts for last minute and hour.

## Architecture Highlights
- **Fan-out on Write**: Events are distributed to feed and notification tables on creation.
- **Caching**: In-memory cache for feed retrieval (1 min TTL).
- **Analytics**: In-memory sliding window counters.
- **Real-time**: SSE for lightweight pushing of notifications.
