# Mini Task Manager

A simple full-stack task management application built with React, TypeScript, Express.js, and SQLite.

The application allows users to create, view, update, and delete tasks. Each task follows a predefined status workflow, and every successful status transition is recorded in an immutable audit log.

## Tech Stack

**Frontend**
- React with TypeScript
- Vite
- Tailwind CSS v4

**Backend**
- Node.js
- Express.js with TypeScript
- SQLite using `better-sqlite3`

## Features

- Create tasks with an initial `to_do` status.
- View all active tasks.
- Move tasks forward through a predefined workflow.
- Select an actor from a predefined list before changing a task's status.
- View the status change history of each task.
- Delete tasks using soft deletion.
- Preserve audit logs after tasks are deleted.
- Prevent audit logs from being updated or deleted through database triggers.

## Task Status Workflow

Tasks follow this sequence:

`to_do → pending → in_progress → done`

Only one-step forward transitions are allowed.

For example:
- `to_do → pending`: Allowed
- `pending → in_progress`: Allowed
- `pending → done`: Rejected
- `done → to_do`: Rejected

Updating a task to its current status does not create a new audit log.

## Project Structure

```text
mini-task-manager/
├── backend/
│   └── src/
│       ├── constants/
│       │   └── users.ts
│       ├── db/
│       │   └── database.ts
│       ├── routes/
│       │   └── task.routes.ts
│       ├── services/
│       │   └── task.service.ts
│       └── index.ts
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── App.tsx
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd mini-task-manager
```

### 2. Run the Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs at:

`http://localhost:3000`

SQLite database tables and audit log protection triggers are initialized automatically when the backend starts.

By default, the database is stored in `tasks.db` relative to the backend process's working directory.

You can optionally configure a different database path using the `DB_PATH` environment variable.

### 3. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

`http://localhost:5173`

Keep both servers running while using the application.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Retrieve active tasks |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id/status` | Update task status |
| DELETE | `/tasks/:id` | Soft-delete a task |
| GET | `/tasks/:id/audit-logs` | Retrieve task audit history |
| GET | `/users` | Retrieve predefined actors |

### Example: Create a Task

**POST** `/tasks`

```json
{
  "title": "Review project requirements"
}
```

New tasks start with the `to_do` status.

### Example: Update Task Status

**PUT** `/tasks/:id/status`

```json
{
  "status": "pending",
  "actor": "admin"
}
```

The backend validates the actor and the requested status transition.

## Audit Log Design

Every successful status transition creates an audit log containing:

- Task ID
- Task title
- Actor
- Previous status
- New status
- Timestamp

Audit logs are append-only.

SQLite triggers prevent existing audit log records from being updated or deleted through ordinary SQL operations.

Task deletion uses soft deletion, allowing audit history to remain associated with the original task.

Audit logs are retrieved in chronological order.

## Data Consistency and Transactions

Task status updates and audit log insertion are performed within a single SQLite transaction.

This ensures atomicity: both operations must succeed, or neither change is committed.

If inserting an audit log fails, the task status update is rolled back.

The backend also checks the current task status inside the transaction before allowing a transition.

## Multi-User and Concurrency Considerations

The application uses SQLite transactions to maintain consistency when multiple requests attempt to update the same task.

SQLite serializes writes, and the backend validates transitions using the current database state within the transaction.

A concurrency test was performed by sending two parallel requests to update the same task from `to_do` to `pending`. The result produced only one audit log entry.

However, the application does not currently implement user authentication or optimistic version checking. Actors are selected from a predefined list rather than being verified through authenticated sessions.

For a larger multi-user application, I would introduce authentication, authorization, and explicit version-based concurrency control to better handle stale client updates.

## Design Decisions and Assumptions

**1. SQLite for persistence**

SQLite was chosen because it is lightweight, requires no separate database server, and is sufficient for a small take-home assignment.

**2. Soft deletion**

Tasks are soft-deleted instead of permanently removed to preserve their relationship with audit history.

**3. Predefined actors**

The application uses a fixed list of actors to keep the scope focused on task management and audit tracking rather than authentication.

**4. Backend-controlled transitions**

The frontend only presents the next available status, but the backend independently validates all status changes. This prevents clients from bypassing workflow rules.

**5. Separation of responsibilities**

The frontend separates API calls, reusable components, task types, and state management. The backend separates HTTP routes, business logic, and database initialization.

## Testing and Validation

The application was tested manually using the browser and Postman.

The following scenarios were checked:

- Creating and retrieving tasks
- Valid status transitions
- Invalid and skipped status transitions
- Repeated updates to the same status
- Invalid actor selection
- Audit log creation and chronological retrieval
- Audit log immutability triggers
- Soft deletion and audit history preservation
- Concurrent status update requests
- Frontend and backend TypeScript/build verification

A separate SQLite transaction rollback simulation was also used to verify that a failed audit log insertion rolls back the preceding task update. This simulation tested the transaction mechanism rather than invoking the production service directly.

## Trade-offs and Limitations

- SQLite is suitable for this project's scope but may not be ideal for a high-write, distributed application.
- Actor selection is not a replacement for authentication.
- The frontend does not provide real-time synchronization between different users or browser sessions.
- The application does not include a comprehensive automated unit and integration test suite.
- Audit immutability is enforced through database triggers, but a database administrator with full schema access could still remove those protections.
- The application is designed for local development and demonstration rather than production deployment.

## What I Would Improve First

My first improvement would be to add automated integration tests covering task transitions, audit log consistency, soft deletion, and concurrent updates.

This would make future refactoring safer and reduce reliance on manual testing.

After that, I would introduce authenticated users and optimistic concurrency control using a task version field.

## AI Usage and Validation

I used AI assistance during development to discuss implementation approaches, review code, identify edge cases, and improve testing and documentation.

I reviewed the suggested code, adapted it to the project's structure, and validated the implemented behavior through manual API testing, browser testing, concurrency testing, and build checks.

I treated AI suggestions as development assistance rather than assuming generated code was correct without verification.