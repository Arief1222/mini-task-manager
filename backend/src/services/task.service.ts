import db from "../db/database";
import { randomUUID } from "node:crypto";

export function createTask(title: string) {
  const now = new Date().toISOString();

  const task = {
    id: randomUUID(),
    title: title.trim(),
    status: "to_do",
    created_at: now,
    updated_at: now
  };

  const statement = db.prepare(`
    INSERT INTO tasks (
      id, title, status, created_at, updated_at
    )
    VALUES (
      @id, @title, @status, @created_at, @updated_at
    )
  `);

  statement.run(task);

  return task;
}

export function getTasks() {
  const statement = db.prepare(`
    SELECT
      id,
      title,
      status,
      created_at,
      updated_at
    FROM tasks
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
  `);

  return statement.all();
}

const statuses = [
  "to_do",
  "pending",
  "in_progress",
  "done"
];

export function updateTaskStatus(
  id: string,
  newStatus: string,
  actor: string
) {
  const updateTransaction = db.transaction(() => {
    const task = db.prepare(`
      SELECT id, title, status
      FROM tasks
      WHERE id = ? AND deleted_at IS NULL
    `).get(id) as {
      id: string;
      title: string;
      status: string;
    } | undefined;

    if (!task) {
      return { type: "not_found" };
    }

    if (task.status === newStatus) {
      return { type: "unchanged", task };
    }

    const currentIndex = statuses.indexOf(task.status);
    const nextIndex = statuses.indexOf(newStatus);

    if (
      currentIndex === -1 ||
      nextIndex === -1 ||
      nextIndex !== currentIndex + 1
    ) {
      return { type: "invalid_transition" };
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE tasks
      SET status = ?, updated_at = ?
      WHERE id = ?
    `).run(newStatus, now, id);

    db.prepare(`
      INSERT INTO audit_logs (
        id,
        task_id,
        task_title,
        actor,
        from_status,
        to_status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      task.id,
      task.title,
      actor,
      task.status,
      newStatus,
      now
    );

    return {
      type: "updated",
      task: {
        ...task,
        status: newStatus
      }
    };
  });

  return updateTransaction();
}

export function getAuditLogs(taskId: string) {
  const statement = db.prepare(`
    SELECT
      id,
      task_id,
      task_title,
      actor,
      from_status,
      to_status,
      created_at
    FROM audit_logs
    WHERE task_id = ?
    ORDER BY created_at ASC, rowid ASC
  `);

  return statement.all(taskId);
}

export function deleteTask(id: string) {
  const now = new Date().toISOString();

  const statement = db.prepare(`
    UPDATE tasks
    SET deleted_at = ?, updated_at = ?
    WHERE id = ? AND deleted_at IS NULL
  `);

  const result = statement.run(now, now, id);

  return result.changes > 0;
}