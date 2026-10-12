import type { Task, TaskStatus, AuditLog } from "../types/task";

const API_URL = "http://localhost:3000";

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/tasks`);

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  const data: Task[] = await response.json();

  return data;
}

export async function createTask(title: string): Promise<Task> {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return response.json();
}

export async function fetchUsers(): Promise<string[]> {
  const response = await fetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}


export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  actor: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, actor }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update task status");
  }
}

export async function fetchAuditLogs(
  taskId: string
): Promise<AuditLog[]> {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}/audit-logs`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch audit logs");
  }

  return response.json();
}

export async function deleteTask(
  taskId: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/tasks/${taskId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
}