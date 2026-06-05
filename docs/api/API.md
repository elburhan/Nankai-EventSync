# EventSync API Reference

> **Base URL (local):** `http://localhost:4000/api`
> **Base URL (production):** `https://<your-render-service>.onrender.com/api`

---

## Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Tokens are obtained from `POST /auth/login` or `POST /auth/register`. They expire after the configured `JWT_EXPIRES_IN` period (default: `7d`).

---

## Response Envelope

All responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Human-readable error message.",
  "details": null
}
```

Validation errors (400) include a `details` object from Zod's `flatten()`.

---

## Rate Limiting

All API endpoints are subject to a global rate limit of **200 requests per 15-minute window** per IP address. Exceeding the limit returns HTTP `429`.

---

## Endpoints

### Health

#### `GET /health`

Returns the API and database status.

**Auth required:** No

**Response 200:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "message": "EventSync backend is healthy.",
    "database": "connected",
    "timestamp": "2026-05-11T18:00:00.000Z",
    "environment": "development",
    "uptimeInSeconds": 1234.56
  }
}
```

**Response 200** (database not ready):
```json
{
  "success": true,
  "data": {
    "status": "degraded",
    "message": "EventSync backend is experiencing database connectivity issues.",
    "database": "disconnected",
    "timestamp": "2026-05-11T18:00:00.000Z",
    "environment": "development",
    "uptimeInSeconds": 1234.56
  }
}
```

The endpoint always responds with HTTP `200`. Consumers should inspect the `data.status` and `data.database` fields to detect degraded health.

---

### Authentication

#### `POST /auth/register`

Register a new user account.

**Auth required:** No

**Request body:**
```json
{
  "fullName": "Liu Wen",
  "email": "student@nankai.edu.cn",
  "password": "minimum8chars",
  "role": "student"
}
```

| Field | Type | Constraints |
|---|---|---|
| `fullName` | string | 2–100 characters |
| `email` | string | Valid email format |
| `password` | string | Minimum 8 characters |
| `role` | string | `"student"` or `"organizer"` |

**Response 201:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": "64abc...",
      "fullName": "Liu Wen",
      "email": "student@nankai.edu.cn",
      "role": "student"
    }
  }
}
```

**Errors:** `400` (validation), `409` (email already registered)

---

#### `POST /auth/login`

Log in to an existing account.

**Auth required:** No

**Request body:**
```json
{
  "email": "student@nankai.edu.cn",
  "password": "minimum8chars"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "<jwt_token>",
    "user": {
      "id": "64abc...",
      "fullName": "Liu Wen",
      "email": "student@nankai.edu.cn",
      "role": "student"
    }
  }
}
```

**Errors:** `400` (validation), `401` (invalid credentials)

---

#### `DELETE /auth/me`

Permanently delete the authenticated user's account, including all owned events, RSVPs, and messages.

**Auth required:** Yes (any role)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "deletedOwnedEventCount": 3,
    "deletedRsvpCount": 7,
    "deletedMessageCount": 21
  }
}
```

**Errors:** `401` (unauthenticated)

---

### Events

#### `GET /events`

List events with optional filtering and pagination.

**Auth required:** No

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Full-text search across title, description, location, tags |
| `category` | string | Filter by category string |
| `status` | string | `draft`, `published`, `cancelled`, or `completed` |
| `organizerId` | string | Filter by organizer's MongoDB ObjectId |
| `upcoming` | boolean | If `true`, only return events whose `startAt` is in the future |
| `page` | integer | Page number (default: `1`) |
| `limit` | integer | Results per page (default: `10`, max: `50`) |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "64abc...",
        "title": "Nankai Innovation Showcase",
        "description": "...",
        "category": "Academic",
        "location": "Main Auditorium",
        "timezone": "Asia/Shanghai",
        "startAt": "2026-06-01T09:00:00.000Z",
        "endAt": "2026-06-01T17:00:00.000Z",
        "posterUrl": "https://res.cloudinary.com/...",
        "capacity": 200,
        "attendeeCount": 47,
        "tags": ["innovation", "technology"],
        "status": "published",
        "organizer": {
          "id": "64def...",
          "fullName": "Dr. Wang",
          "email": "wang@nankai.edu.cn"
        },
        "createdAt": "2026-05-01T10:00:00.000Z",
        "updatedAt": "2026-05-05T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

#### `GET /events/:eventId`

Get a single event by its ID.

**Auth required:** No

**Path parameters:**

| Parameter | Type | Description |
|---|---|---|
| `eventId` | string | MongoDB ObjectId |

**Response 200:** Single event object (same shape as items in list response).

**Errors:** `400` (invalid ID format), `404` (not found)

---

#### `POST /events`

Create a new event.

**Auth required:** Yes — `organizer` role only

**Request body:**
```json
{
  "title": "Nankai Innovation Showcase",
  "description": "A showcase of student innovations across engineering and design.",
  "category": "Academic",
  "location": "Main Campus Hall A",
  "timezone": "Asia/Shanghai",
  "startAt": "2026-06-01T09:00:00.000Z",
  "endAt": "2026-06-01T17:00:00.000Z",
  "capacity": 200,
  "tags": ["innovation", "technology"],
  "status": "published",
  "posterDataUri": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

| Field | Type | Constraints |
|---|---|---|
| `title` | string | 3–150 characters |
| `description` | string | 10–5000 characters |
| `category` | string | 2–80 characters |
| `location` | string | 2–200 characters |
| `timezone` | string | Valid IANA timezone (default: `Asia/Shanghai`) |
| `startAt` | ISO 8601 date | Must be before `endAt` |
| `endAt` | ISO 8601 date | Must be after `startAt` |
| `capacity` | integer | Positive integer, optional |
| `tags` | string[] | Max 10 tags, each 1–40 characters |
| `status` | string | `draft`, `published`, `cancelled`, `completed` |
| `posterDataUri` | string | `data:image/` URI or `https://` URL, optional |

**Response 201:** Created event object.

**Errors:** `400` (validation), `401` (unauthenticated), `403` (wrong role)

---

#### `PATCH /events/:eventId`

Update an existing event. Only the event's organizer may edit it.

**Auth required:** Yes — `organizer` or `admin` role

**Path parameters:** `eventId` (MongoDB ObjectId)

**Request body:** Same fields as `POST /events`, all optional. At least one field must be provided.

Additional fields:

| Field | Type | Description |
|---|---|---|
| `removePoster` | boolean | If `true`, removes the existing poster image |

**Response 200:** Updated event object.

**Errors:** `400` (validation), `401`, `403` (not owner), `404` (not found)

---

#### `DELETE /events/:eventId`

Delete an event and all associated RSVPs and messages.

**Auth required:** Yes — organizer (own events only) or `admin` (any event)

**Path parameters:** `eventId` (MongoDB ObjectId)

**Response 200:**
```json
{ "success": true, "data": null }
```

**Errors:** `401`, `403`, `404`

---

### RSVP

#### `POST /events/:eventId/rsvp`

RSVP to an event (mark yourself as attending).

**Auth required:** Yes (any role)

**Path parameters:** `eventId` (MongoDB ObjectId)

**Response 201:**
```json
{
  "success": true,
  "data": {
    "status": "going",
    "attendeeCount": 48
  }
}
```

**Errors:** `400` (already RSVPd), `401`, `404`

---

#### `DELETE /events/:eventId/rsvp`

Cancel an RSVP.

**Auth required:** Yes (any role)

**Path parameters:** `eventId` (MongoDB ObjectId)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "status": "not_going",
    "attendeeCount": 47
  }
}
```

**Errors:** `401`, `404` (no RSVP found)

---

## Socket.io Events

EventSync uses Socket.io for real-time event room functionality. Connect to the socket server root (same host as the backend, not `/api`).

### Authentication

Pass the JWT token in the socket handshake:

```js
import { io } from 'socket.io-client';

const socket = io('https://<backend-host>', {
  auth: { token: '<jwt_token>' },
});
```

The server rejects connections with missing or invalid tokens with a `socket:error` event.

---

### Client → Server Events

#### `event:join`

Join an event room to receive real-time RSVP updates and chat messages.

**Payload:**
```json
{ "eventId": "64abc..." }
```

**Server responds with:** `event:joined`

---

#### `event:leave`

Leave an event room.

**Payload:**
```json
{ "eventId": "64abc..." }
```

**Server responds with:** `event:left`

---

#### `message:send`

Send a chat message to an event room. Requires RSVP or organizer status.

**Payload:**
```json
{
  "eventId": "64abc...",
  "body": "Looking forward to the keynote!"
}
```

**Server broadcasts:** `message:created` to all room members

---

### Server → Client Events

#### `event:joined`

Sent to the joining client upon successful room join. Contains initial room state.

**Payload:**
```json
{
  "eventId": "64abc...",
  "isAttending": true,
  "canChat": true,
  "attendeeCount": 47,
  "messages": [
    {
      "id": "64msg...",
      "body": "Hello!",
      "createdAt": "2026-05-11T10:00:00.000Z",
      "author": {
        "id": "64usr...",
        "fullName": "Liu Wen"
      }
    }
  ]
}
```

---

#### `event:left`

Confirms the client has left the room.

**Payload:**
```json
{ "eventId": "64abc..." }
```

---

#### `event:rsvp-updated`

Broadcast to all clients in the event room when RSVP status changes.

**Payload:**
```json
{
  "eventId": "64abc...",
  "attendeeCount": 48
}
```

---

#### `message:created`

Broadcast to all clients in the event room when a new message is sent.

**Payload:**
```json
{
  "eventId": "64abc...",
  "message": {
    "id": "64msg...",
    "body": "Looking forward to the keynote!",
    "createdAt": "2026-05-11T18:00:00.000Z",
    "author": {
      "id": "64usr...",
      "fullName": "Liu Wen"
    }
  }
}
```

---

#### `socket:error`

Sent to the client when a server-side socket operation fails.

**Payload:**
```json
{
  "message": "You do not have permission to chat in this room.",
  "statusCode": 403
}
```

---

## HTTP Status Code Reference

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request / Validation error |
| `401` | Unauthorized — token missing or invalid |
| `403` | Forbidden — insufficient role or ownership |
| `404` | Not Found |
| `409` | Conflict — duplicate resource |
| `429` | Too Many Requests |
| `500` | Internal Server Error |
| `503` | Service Unavailable — Cloudinary not configured |
