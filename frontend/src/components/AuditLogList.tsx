import type { AuditLog } from "../types/task";

interface AuditLogListProps {
  logs: AuditLog[];
  loading: boolean;
  error: string;
}

function AuditLogList({
  logs,
  loading,
  error,
}: AuditLogListProps) {
  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <h4 className="mb-3 font-semibold text-slate-800">
        Status History
      </h4>

      {loading ? (
        <p className="text-sm text-slate-500">
          Loading history...
        </p>
      ) : error ? (
        <p className="text-sm text-red-600">
          {error}
        </p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-slate-500">
          No status changes yet.
        </p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-lg bg-slate-50 p-3 text-sm"
            >
              <p className="font-medium text-slate-800">
                {log.from_status.replaceAll("_", " ")}
                {" → "}
                {log.to_status.replaceAll("_", " ")}
              </p>

              <p className="mt-1 text-slate-600">
                Changed by: {log.actor}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuditLogList;