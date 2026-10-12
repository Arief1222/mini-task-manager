import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

const db = new Database(":memory:");

db.exec(`
  CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );

  CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    task_title TEXT NOT NULL,
    actor TEXT NOT NULL,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
  );

  CREATE TRIGGER fail_audit_insert
  BEFORE INSERT ON audit_logs
  BEGIN
    SELECT RAISE(ABORT, 'Simulated audit log failure');
  END;
`);

const taskId = randomUUID();
const now = new Date().toISOString();

db.prepare(`
  INSERT INTO tasks (id, title, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
`).run(taskId, "Rollback Test", "to_do", now, now);

const updateTransaction = db.transaction(() => {
  db.prepare(`
    UPDATE tasks SET status = ?, updated_at = ?
    WHERE id = ?
  `).run("pending", new Date().toISOString(), taskId);

  db.prepare(`
    INSERT INTO audit_logs
      (id, task_id, task_title, actor, from_status, to_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    taskId,
    "Rollback Test",
    "admin",
    "to_do",
    "pending",
    new Date().toISOString()
  );
});

let failedAsExpected = false;

try {
  updateTransaction();
} catch (error) {
  failedAsExpected = true;
  console.log("Expected error:", error.message);
}

const task = db.prepare(
  "SELECT status FROM tasks WHERE id = ?"
).get(taskId);

const auditCount = db.prepare(
  "SELECT COUNT(*) AS total FROM audit_logs WHERE task_id = ?"
).get(taskId);

db.close();

if (!failedAsExpected) {
  throw new Error("Expected transaction to fail");
}

if (task.status !== "to_do") {
  throw new Error(`Rollback failed: status is ${task.status}`);
}

if (auditCount.total !== 0) {
  throw new Error("Rollback failed: audit log was inserted");
}

console.log("PASS: Transaction rollback works correctly");
console.log("Task status:", task.status);
console.log("Audit log count:", auditCount.total);