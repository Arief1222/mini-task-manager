import { useEffect, useRef, useState } from "react";

import {
  createTask,
  fetchTasks,
  fetchUsers,
  updateTaskStatus,
  fetchAuditLogs,
  deleteTask,
} from "../api/task";

import type { Task, AuditLog } from "../types/task";
import { getNextStatus } from "../types/task";

export function useTasks() {
  // Task state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Actor state
  const [users, setUsers] = useState<string[]>([]);
  const [selectedActor, setSelectedActor] = useState("");

  // Update status state
  const [updatingTaskId, setUpdatingTaskId] =
    useState<string | null>(null);
  const [statusError, setStatusError] = useState("");

  // Delete state
  const [deletingTaskId, setDeletingTaskId] =
    useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  // Audit log state
  const [selectedHistoryTaskId, setSelectedHistoryTaskId] =
    useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const historyRequestId = useRef(0);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  // Fetch tasks when the component mounts
  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        setError("Failed to load tasks");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  // Fetch predefined users
  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchUsers();

        setUsers(data);

        if (data.length > 0) {
          setSelectedActor(data[0]);
        }
      } catch (err) {
        setStatusError("Failed to load users");
        console.error(err);
      }
    }

    loadUsers();
  }, []);

  async function refreshTasks(): Promise<boolean> {
    try {
      const updatedTasks = await fetchTasks();

      setTasks(updatedTasks);
      setError("");
      setNeedsRefresh(false);

      return true;
    } catch (err) {
      setError(
        "Failed to refresh tasks. Reload the page before making further changes."
      );
      setNeedsRefresh(true);

      console.error("Failed to refresh tasks:", err);

      return false;
    }
  }

  // Create task
  async function handleCreateTask(title: string) {
    await createTask(title);

    await refreshTasks();
  }

  // Update task status
  async function handleUpdateStatus(task: Task) {
    const nextStatus = getNextStatus(task.status);

    if (!nextStatus || !selectedActor) {
      return;
    }

    setUpdatingTaskId(task.id);
    setStatusError("");

    try {
      await updateTaskStatus(
        task.id,
        nextStatus,
        selectedActor
      );
    } catch (err) {
      setStatusError("Failed to update task status");
      console.error("Failed to update task status:", err);
      setUpdatingTaskId(null);
      return;
    }

    const refreshed = await refreshTasks();

    if (!refreshed) {
      setStatusError(
        "Status updated, but the task list could not be refreshed. Reload before updating again."
      );
    }

    setUpdatingTaskId(null);
  }
  // View audit log history
  async function handleViewHistory(taskId: string) {
    const requestId = ++historyRequestId.current;

    if (selectedHistoryTaskId === taskId) {
      setSelectedHistoryTaskId(null);
      setAuditLogs([]);
      setHistoryError("");
      setHistoryLoading(false);
      return;
    }

    setSelectedHistoryTaskId(taskId);
    setAuditLogs([]);
    setHistoryError("");
    setHistoryLoading(true);

    try {
      const logs = await fetchAuditLogs(taskId);

      if (requestId !== historyRequestId.current) {
        return;
      }

      setAuditLogs(logs);
    } catch (err) {
      if (requestId !== historyRequestId.current) {
        return;
      }

      setHistoryError("Failed to load audit logs");
      console.error(err);
    } finally {
      if (requestId === historyRequestId.current) {
        setHistoryLoading(false);
      }
    }
  }

  // Delete task
  async function handleDeleteTask(task: Task) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTaskId(task.id);
      setDeleteError("");

      await deleteTask(task.id);

      if (selectedHistoryTaskId === task.id) {
        historyRequestId.current += 1;

        setSelectedHistoryTaskId(null);
        setAuditLogs([]);
        setHistoryError("");
        setHistoryLoading(false);
      }
    } catch (err) {
      setDeleteError("Failed to delete task");
      console.error("Failed to delete task:", err);
      return;
    } finally {
      setDeletingTaskId(null);
    }

    await refreshTasks();
  }

  return {
    tasks,
    loading,
    error,
    needsRefresh,

    users,
    selectedActor,
    setSelectedActor,

    updatingTaskId,
    statusError,

    deletingTaskId,
    deleteError,

    selectedHistoryTaskId,
    auditLogs,
    historyLoading,
    historyError,

    handleCreateTask,
    handleUpdateStatus,
    handleViewHistory,
    handleDeleteTask,
  };
}