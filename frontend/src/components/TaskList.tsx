import type { Task, AuditLog } from "../types/task";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string;

  selectedActor: string;
  updatingTaskId: string | null;
  deletingTaskId: string | null;

  selectedHistoryTaskId: string | null;
  auditLogs: AuditLog[];
  historyLoading: boolean;
  historyError: string;

  onUpdateStatus: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onViewHistory: (taskId: string) => void;
  actionsDisabled: boolean;
}

function TaskList({
  tasks,
  loading,
  error,
  selectedActor,
  updatingTaskId,
  deletingTaskId,
  selectedHistoryTaskId,
  auditLogs,
  historyLoading,
  historyError,
  onUpdateStatus,
  onDeleteTask,
  onViewHistory,
    actionsDisabled,
}: TaskListProps) {
  if (loading) {
    return (
      <p className="text-slate-500">
        Loading tasks...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-red-600">
        {error}
      </p>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        No tasks yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          actionsDisabled={actionsDisabled}
          key={task.id}
          task={task}
          selectedActor={selectedActor}
          updatingTaskId={updatingTaskId}
          deletingTaskId={deletingTaskId}
          selectedHistoryTaskId={selectedHistoryTaskId}
          auditLogs={auditLogs}
          historyLoading={historyLoading}
          historyError={historyError}
          onUpdateStatus={onUpdateStatus}
          onDeleteTask={onDeleteTask}
          onViewHistory={onViewHistory}
        />
      ))}
    </div>
  );
}

export default TaskList;