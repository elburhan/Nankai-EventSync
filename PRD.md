# PRD.md - EventSync Product Requirements Document

## 1. Product Name
EventSync

## 2. Product Summary
EventSync is a full-stack campus event platform for Nankai University that helps students discover activities and helps organizers create, manage, and communicate around events. The product emphasizes real-time participation updates, clear event discovery, and a deployment-ready architecture suitable for a Master's Software Engineering course project.

## 3. Background and Problem Statement
Campus event information is often fragmented across posters, messaging groups, student forums, and informal social channels. This creates several problems:
- students miss events because information is scattered
- organizers struggle to reach the right audience
- RSVP numbers are unreliable or outdated
- communication between organizers and attendees is inconsistent
- there is no single platform for a live, real-time demo of event coordination

Nankai University needs a centralized, modern web platform that supports both event discovery and organizer workflows while also demonstrating robust software engineering practices.

## 4. Product Vision
Deliver a polished, production-ready campus event system where:
- students can quickly discover relevant events
- organizers can publish and manage events with confidence
- event participation updates in real time
- the architecture is strong enough for academic evaluation and real deployment

## 5. Goals and Objectives
### Primary Goals
- centralize campus event discovery in a single platform
- support end-to-end event management for organizers
- demonstrate real-time collaboration and status updates
- provide a system that is deployable on free-tier services
- achieve strong grading potential through architecture, documentation, testing, and demo readiness

### Project Objectives
1. Build a React-based frontend for event browsing, filtering, details, and organizer workflows.
2. Build an Express-based backend API with authentication, event management, and real-time features.
3. Provide role-aware behavior for students and organizers.
4. Support live RSVP updates using Socket.io.
5. Support event poster uploads using Cloudinary.
6. Ensure the project is structured, documented, and testable for course submission and presentation.

## 6. Out of Scope for Initial Delivery
The following are not required unless explicitly approved later:
- native mobile applications
- payment processing
- university single sign-on integration
- push notifications
- recommendation engines
- multilingual support beyond the initial language/content plan
- analytics dashboards beyond basic admin visibility if later requested

## 7. Target Users
### Student
Needs:
- browse upcoming campus events
- search and filter events
- RSVP to events
- receive up-to-date attendance information
- communicate within an event context when appropriate

### Organizer
Needs:
- create and edit events
- upload poster images
- monitor attendance
- communicate with attendees
- manage their own events securely

### Course Evaluator / Demo Audience
Needs:
- observe a polished live demo
- review architecture and documentation
- see evidence of real-time behavior, deployment readiness, and software engineering rigor

## 8. User Stories
### Student User Stories
- As a student, I want to browse upcoming events so that I can find activities that interest me.
- As a student, I want to search and filter events so that I can narrow results by category, date, or keyword.
- As a student, I want to view event details so that I can decide whether to attend.
- As a student, I want to RSVP to an event so that my attendance is recorded.
- As a student, I want the attendee count to update live so that I can see current participation.

### Organizer User Stories
- As an organizer, I want to create a new event so that I can promote it to students.
- As an organizer, I want to upload an event poster so that the event page looks informative and professional.
- As an organizer, I want to update or delete my own events so that information stays accurate.
- As an organizer, I want to message attendees in real time so that I can provide updates or instructions.

### System/Project User Stories
- As a project team, we want layered architecture so that the system is maintainable and academically defensible.
- As a project team, we want deployment on free-tier services so that the system can be demonstrated publicly without paid infrastructure.

## 9. Functional Requirements
### 9.1 Authentication and Authorization
- Users can register with email and password.
- Users can log in securely.
- Authentication uses JWT.
- Passwords are hashed with bcrypt.
- Protected routes require valid authentication.
- Organizer-only actions are restricted to authorized users.

Acceptance criteria:
- registration rejects invalid or duplicate emails
- login returns a usable authenticated session/token flow
- unauthorized users cannot create, edit, or delete events
- organizers can manage only their own events

### 9.2 Event Discovery
- Users can view a list of upcoming events.
- Users can search by keyword.
- Users can filter by category, date, or organizer-related metadata as defined in implementation.
- Users can open an event detail page.
- A calendar-oriented view should be supported in the product scope.

Acceptance criteria:
- event list loads successfully from the backend
- filtering and searching narrow results correctly
- event detail pages show all required event data

### 9.3 Event Management
- Organizers can create events.
- Organizers can edit events.
- Organizers can delete events.
- Events include title, description, category, date/time, location, poster image, organizer reference, and capacity/attendance-related fields as needed.

Acceptance criteria:
- valid events are created successfully
- invalid event payloads are rejected with clear validation messages
- only the owner organizer can update or delete an event

### 9.4 Media Uploads
- Organizers can upload poster images for events.
- Poster images are stored through Cloudinary.
- Upload failures are handled gracefully.

Acceptance criteria:
- successful uploads return a usable asset URL
- invalid file types or failures surface safe error messages

### 9.5 RSVP and Attendance
- Authenticated users can RSVP to events.
- Users can remove their RSVP if allowed by business rules.
- Event attendee counts are stored consistently and displayed clearly.
- Attendance state updates in real time across connected clients.

Acceptance criteria:
- RSVP actions persist correctly
- attendee count changes are reflected on refresh and in real time
- concurrent RSVP actions do not produce obviously inconsistent counts

### 9.6 Real-Time Communication
- Socket.io powers real-time event updates.
- Event-specific rooms support scoped communication.
- Organizers and attendees can receive live updates within an event context.

Acceptance criteria:
- two connected browser tabs reflect RSVP count updates with low delay
- event room messages are delivered to the correct connected clients
- reconnect behavior recovers without full application failure

### 9.7 Responsive User Experience
- The application must support mobile and desktop layouts.
- Loading, empty, and error states are mandatory.
- Navigation should remain usable on smaller screens.

Acceptance criteria:
- core pages remain usable on mobile-sized viewports
- key actions remain accessible without layout breakage

## 10. Non-Functional Requirements
### Performance
- primary pages should feel responsive under demo-scale usage
- page loads should aim to complete in under 2 seconds on typical demo conditions
- real-time updates should be visible in under 1 second in normal conditions

### Reliability
- application errors should fail gracefully
- backend should validate all external inputs
- socket disconnects should degrade safely and reconnect when possible

### Security
- secrets must never be exposed in the frontend
- all sensitive configuration must use environment variables
- authentication and authorization must protect privileged actions
- user input must be validated and sanitized appropriately

### Maintainability
- code must follow the required layered architecture
- modules should be organized for readability and extension
- documentation must stay synchronized with implementation

### Accessibility
- forms must use labels
- interactions should be keyboard accessible where relevant
- semantic HTML and basic ARIA support should be considered

### Deployability
- frontend must be deployable to Vercel
- backend must be deployable to Render free tier
- database must be hosted on MongoDB Atlas free tier

## 11. Architecture and Technology Requirements
### Frontend Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui or clean Tailwind components
- React Router v6
- Socket.io-client
- Axios in the service/integration flow only

### Backend Stack
- Node.js
- Express
- TypeScript
- Mongoose
- MongoDB Atlas
- Socket.io
- Cloudinary
- JWT
- bcrypt
- Zod
- dotenv

### Architectural Rule
All features must respect:
1. Presentation Layer
2. Business Logic Layer
3. Data Access Layer
4. Integration Layer

No layer skipping is allowed for convenience.

## 12. Proposed Feature Set for the Course Project
### Core Features
- user registration and login
- role-based access for students and organizers
- event feed
- event details page
- event search and filters
- event creation and management
- Cloudinary poster upload
- RSVP handling
- real-time attendee count
- real-time event messaging

### Supporting Features
- form validation feedback
- loading states
- error boundaries or equivalent safe failure UX
- toasts or equivalent user notifications
- deployment-ready configuration

## 13. Data Expectations
High-level domain entities likely include:
- User
- Event
- RSVP or attendee relationship
- Message or event-room communication record if persistence is required by final design

Each entity should support audit-friendly, course-report-friendly explanation in future architecture docs.

## 14. Edge Cases and Risk Scenarios
The implementation must consider:
- duplicate account registration attempts
- invalid login credentials
- expired or invalid JWT tokens
- organizers attempting to modify events they do not own
- concurrent RSVP requests
- users refreshing or leaving during socket sessions
- Cloudinary upload failures
- MongoDB connectivity issues
- backend deployment cold starts on free tier
- organizer deleting an event while attendees are viewing it

## 15. Acceptance Criteria Summary
The product is acceptable when:
- students can register, log in, browse events, and RSVP
- organizers can create, edit, and delete their own events
- poster uploads work through Cloudinary
- event attendance updates in real time across at least two connected clients
- the system is deployable on Vercel, Render, and MongoDB Atlas
- documentation clearly explains scope, architecture, and progress

## 16. Deliverables for the Master's Course Project
- working monorepo repository
- deployable frontend and backend
- live demo capable of showing real-time updates
- README with setup and architecture explanation
- progress tracking document
- architecture and deployment documentation
- testing evidence and verification commands

## 17. Milestones
### Milestone 1
Repository scaffold and documentation complete

### Milestone 2
Backend foundation complete:
- configuration
- database connection
- auth module
- event module skeleton
- socket foundation

### Milestone 3
Frontend foundation complete:
- routing
- shared layout
- auth flows
- event browsing pages

### Milestone 4
Integrated feature delivery:
- event CRUD
- image upload
- RSVP
- live attendee updates
- event messaging

### Milestone 5
Verification and deployment:
- lint/build/test passes
- deployment configuration
- live demo rehearsal
- final documentation updates

## 18. Success Metrics
- live RSVP counter works across two browser tabs
- application remains stable during classroom demo flow
- architecture is easy to explain and defend
- deployment links are available and functional
- documentation supports both implementation and academic reporting

## 19. Dependencies and External Services
- MongoDB Atlas
- Cloudinary
- Vercel
- Render

The design should avoid paid-only dependencies.

## 20. Source of Truth
This PRD is the authoritative planning document for EventSync until explicitly revised.
