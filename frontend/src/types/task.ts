export type TaskStatus =
  | "to_do"
  | "pending"
  | "in_progress"
  | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export const TASK_STATUSES: TaskStatus[] = [
  "to_do",
  "pending",
  "in_progress",
  "done",
];

export function getNextStatus(
  currentStatus: TaskStatus
): TaskStatus | null {
  const currentIndex = TASK_STATUSES.indexOf(currentStatus);

  if (
    currentIndex === -1 ||
    currentIndex === TASK_STATUSES.length - 1
  ) {
    return null;
  }

  return TASK_STATUSES[currentIndex + 1];
}

export interface AuditLog {
  id: string;
  task_id: string;
  task_title: string;
  actor: string;
  from_status: TaskStatus;
  to_status: TaskStatus;
  created_at: string;
}