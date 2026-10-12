# Mini Task Manager

A full-stack task management application built with React, TypeScript, Express.js, and SQLite.

Users can create tasks, move them through a predefined status workflow, delete tasks, and view an audit history of status changes.

## 1. How to Run

### Requirements

- Node.js compatible with the installed Vite version
- npm

### Backend

Open a terminal in the project directory:

```bash
cd backend
npm install
npm run dev
```

The backend runs at `http://localhost:3000`.

The SQLite database and its tables are created automatically when the backend starts.

By default, the database file is `tasks.db`. A different database path can be configured using the `DB_PATH` environment variable.

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

Both servers must be running to use the application.

## 2. Architecture

The application uses a simple client-server architecture.

**Frontend — React, TypeScript, Vite, Tailwind CSS**

- `components/` contains reusable UI components such as the task form, task list, actor selection, and audit history.
- `hooks/useTasks.ts` manages task state, API requests, and UI interactions.
- `api/task.ts` contains the functions used to communicate with the backend.
- `types/task.ts` defines shared frontend task and audit log types.

**Backend — Express.js, TypeScript, SQLite**

- `routes/task.routes.ts` handles HTTP requests and input validation.
- `services/task.service.ts` contains business logic, including task creation, status transitions, audit logging, and soft deletion.
- `db/database.ts` initializes SQLite tables and audit log protection triggers.
- `constants/users.ts` contains the predefined actor list.

The frontend communicates with the backend through REST API endpoints. The backend validates status changes and stores task data and audit history in SQLite.

### Task Workflow

`to_do → pending → in_progress → done`

Tasks can only move forward by one status at a time. Repeating the current status does not create another audit log.

## 3. Assumptions

- This is a small application intended for local use and demonstration.
- Authentication is outside the assignment scope, so users select an actor from a predefined list.
- Every new task starts with the `to_do` status.
- Task statuses can only move forward, not backward.
- Only actual status changes should create audit logs.
- Deleting a task means removing it from the active task list, while preserving its audit history.
- The backend is responsible for enforcing business rules, even if the frontend already restricts user actions.

## 4. Trade-offs

**SQLite instead of PostgreSQL**

I chose SQLite because it is lightweight, persistent, and easy to run without additional infrastructure. The trade-off is limited write concurrency compared with a database designed for larger multi-user workloads.

**Soft delete instead of permanent deletion**

Soft deletion preserves task references and audit history. The trade-off is that deleted tasks remain in the database and require filtering.

**Predefined actors instead of authentication**

A fixed actor list keeps the implementation focused on task management and audit logging. However, users can select another actor's identity, so the audit trail does not provide verified user attribution.

**Simple state management**

I used a custom React hook instead of introducing a global state management library. This is easier to maintain for the current application size, but more complex synchronization may require a different approach.

## 5. How Do You Ensure Audit Logs Cannot Be Modified?

I use an append-only audit log design.

Each successful task status transition creates a new audit log record. The application does not provide endpoints to edit or delete existing audit logs.

At the database level, SQLite triggers reject `UPDATE` and `DELETE` operations on the `audit_logs` table.

Additionally, the task status update and audit log insertion run inside a single SQLite transaction. If either operation fails, the transaction is rolled back.

This prevents a status change from being committed without its corresponding audit log.

These protections prevent modification through normal application operations and SQL statements while the triggers remain active. They do not provide tamper-proof protection against someone with full access to the database file or schema.

## 6. What Is the Riskiest Part If Many Users Use This Application?

The biggest risk is **concurrent updates combined with unverified actor identities**.

The backend uses SQLite transactions to ensure status updates and audit log inserts are atomic. SQLite also serializes writes, which helps prevent conflicting database operations.

However, the frontend does not synchronize changes in real time between users.

For example, two users might view the same task status. After one user updates it, the other user's screen may still display outdated information.

The backend validates each request against the current database state, but the application does not yet use version numbers to detect stale client updates explicitly.

Another important risk is that actors are selected manually rather than authenticated. In a real multi-user system, this would make audit attribution unreliable.

To address these risks, I would add authentication, authorization, task version checking, and better client synchronization.

## 7. What Would You Refactor First If This Became a Larger System, and Why?

I would first refactor the backend data access and concurrency handling.

Currently, business logic and SQL queries are implemented together in `task.service.ts`. This is manageable for a small project, but it would become harder to maintain as the number of features and database operations increases.

I would introduce a dedicated repository or data access layer to separate SQL operations from business rules.

I would also add optimistic concurrency control using a task version field, so the backend can detect updates based on outdated task data.

This would make the system easier to test, maintain, and extend while reducing the risk of inconsistent behavior as more users interact with tasks.

## 8. What Would You Improve With More Time?

My priorities would be:

1. **Automated tests:** Add unit and integration tests for status transitions, audit logging, transaction rollback, and concurrent updates.
2. **Authentication and authorization:** Replace the predefined actor selection with verified user identities.
3. **Optimistic concurrency control:** Introduce task version numbers to detect stale updates.
4. **Better frontend error handling:** Add clearer retry mechanisms and stale-data indicators.
5. **Production readiness:** Add structured logging, configuration management, and deployment support.

## 9. AI Usage and Validation

I used AI assistance during development for:

- Discussing the application structure and implementation approach.
- Reviewing React and TypeScript code.
- Identifying edge cases in task status transitions.
- Reviewing SQLite transactions, audit log immutability, and concurrency behavior.
- Preparing test scenarios and improving documentation.

I did not treat AI-generated suggestions as automatically correct.

I reviewed the code and checked the implemented behavior using browser testing, Postman requests, TypeScript checks, and frontend build verification.

I also tested concurrent status updates by sending two parallel requests to the same task and checking that only one audit log entry was created.

For transaction rollback, I used a separate SQLite simulation that intentionally failed an audit log insertion and checked that the task status update was rolled back.

These checks helped validate the implementation, although they do not replace a comprehensive automated test suite.

## 10. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | List active tasks |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id/status` | Update task status |
| DELETE | `/tasks/:id` | Soft-delete a task |
| GET | `/tasks/:id/audit-logs` | View task audit history |
| GET | `/users` | List predefined actors |

### Example Status Update

**PUT** `/tasks/:id/status`

```json
{
  "status": "pending",
  "actor": "admin"
}
```

A successful transition updates the task status and creates an audit log in the same transaction.
