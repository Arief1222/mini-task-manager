import { useState } from "react";
import type { SubmitEvent } from "react";

interface TaskFormProps {
  onCreateTask: (title: string) => Promise<void>;
}

function TaskForm({ onCreateTask }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await onCreateTask(title.trim());

      setTitle("");
    } catch (err) {
      setError("Failed to create task");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Create Task
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter task title..."
            disabled={submitting}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Task"}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}

export default TaskForm;