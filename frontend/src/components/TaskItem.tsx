import type { Task, AuditLog } from "../types/task";
import { getNextStatus } from "../types/task";
import AuditLogList from "./AuditLogList";

interface TaskItemProps {
  task: Task;
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

function TaskItem({
  task,
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
}: TaskItemProps) {
  const nextStatus = getNextStatus(task.status);

  const isHistoryOpen = selectedHistoryTaskId === task.id;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-medium text-slate-900">
            {task.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Created: {new Date(task.created_at).toLocaleString()}
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
          {task.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => onViewHistory(task.id)}
          disabled={historyLoading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {isHistoryOpen ? "Hide History" : "View History"}
        </button>

        <button
          type="button"
          onClick={() => onUpdateStatus(task)}
          disabled={
            actionsDisabled ||
            !nextStatus ||
            !selectedActor ||
            updatingTaskId !== null ||
            deletingTaskId !== null
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {updatingTaskId === task.id
            ? "Updating..."
            : nextStatus
              ? `Next: ${nextStatus.replaceAll("_", " ")}`
              : "Completed"}
        </button>

        <button
          type="button"
          onClick={() => onDeleteTask(task)}
          disabled={
             actionsDisabled ||
            deletingTaskId !== null ||
            updatingTaskId !== null
          }
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deletingTaskId === task.id ? "Deleting..." : "Delete"}
        </button>
      </div>

      {isHistoryOpen && (
        <AuditLogList
          logs={auditLogs}
          loading={historyLoading}
          error={historyError}
        />
      )}
    </div>
  );
}

export default TaskItem;