# Technical Challenges and Solutions

## 1. Keeping Layered Architecture Intact
- Challenge: Real-time features can easily push socket logic into components or controllers.
- Solution: socket wiring stayed in the integration layer, while room access, RSVP synchronization, and message persistence were coordinated in business services.

## 2. Secure Real-Time Communication
- Challenge: Socket.io connections needed authentication without weakening route-level security.
- Solution: JWT verification was added to the socket handshake, and event-room access rules were enforced in backend services before users could interact.

## 3. Organizer Ownership Enforcement
- Challenge: Only the event owner should be able to edit or delete an event.
- Solution: organizer role checks happen in middleware, and ownership checks happen again in the event service to protect the domain layer.

## 4. Cloudinary Uploads from a Clean Frontend Architecture
- Challenge: Image upload needed to work without leaking file handling into presentation logic.
- Solution: the frontend converts poster files to data URIs in the integration layer, then the backend integration layer uploads them to Cloudinary.

## 5. Realtime RSVP Consistency
- Challenge: attendee counts must stay correct across refreshes and simultaneous tab interactions.
- Solution: MongoDB remains the source of truth, RSVP endpoints recalculate/persist attendee counts, and the backend emits the updated count to room subscribers.

## 6. Graceful Client Recovery
- Challenge: a classroom demo is sensitive to refreshes and reconnects.
- Solution: the frontend reconnects sockets automatically, rejoins the event room on page load, and restores the latest room state from the backend.

## 7. Report-Friendly Maintainability
- Challenge: course projects are judged on clarity as well as functionality.
- Solution: documentation was kept in sync through milestone-based updates, Mermaid architecture diagrams, a user manual, and a progress tracker.
