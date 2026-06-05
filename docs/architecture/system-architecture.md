# EventSync Architecture

## Mermaid Diagram
```mermaid
flowchart LR
    Student[Student User]
    Organizer[Organizer User]

    subgraph Frontend[Frontend - React + Vite]
      UI[Presentation Layer\nPages + Components + Routes]
      FBL[Business Layer\nAuth/Event Services\nRoom Orchestration]
      FDA[Data Access Layer\nRepositories]
      FIN[Integration Layer\nAxios Client + Socket Client + Token/Image Storage]
    end

    subgraph Backend[Backend - Express + Socket.io]
      BPRE[Presentation Layer\nRoutes + Controllers + Middleware]
      BBL[Business Layer\nAuth/Event/RSVP/Message Services]
      BDA[Data Access Layer\nMongoose Models + Repositories]
      BIN[Integration Layer\nMongoDB + JWT + Cloudinary + Socket Server]
    end

    DB[(MongoDB Atlas)]
    CDN[(Cloudinary)]

    Student --> UI
    Organizer --> UI

    UI --> FBL --> FDA --> FIN
    FIN -->|REST /api| BPRE --> BBL --> BDA --> DB
    FIN -->|Socket.io JWT Handshake| BIN
    BIN --> BBL
    BBL --> BIN
    BBL -->|Poster Upload/Delete| CDN

    BIN -->|event:rsvp-updated| FIN
    BIN -->|message:created| FIN
```

## Layer Summary
- Presentation: pages, forms, controllers, routes, and middleware manage user input and HTTP/socket boundaries.
- Business Logic: services coordinate auth, event ownership, RSVP rules, and event-room messaging.
- Data Access: repositories isolate MongoDB queries and persistence details.
- Integration: third-party concerns such as MongoDB Atlas, Cloudinary, JWT, Axios, and Socket.io stay outside the business core.

## Real-Time Flow
1. A user opens `/events/:eventId` in the frontend.
2. The frontend business service ensures a JWT-authenticated Socket.io connection exists.
3. The client joins room `event:{eventId}`.
4. RSVP changes persist through the REST API, then the backend service emits `event:rsvp-updated`.
5. Chat messages flow through the socket server, are persisted by the message service, and broadcast as `message:created`.
