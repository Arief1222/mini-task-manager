import TaskForm from "./components/TaskForm";
import ActorSelect from "./components/ActorSelect";
import TaskList from "./components/TaskList";
import { useTasks } from "./hooks/useTasks";

function App() {
  const {
    tasks,
    loading,
    error,

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
     needsRefresh,
    
  } = useTasks();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Mini Task Manager
          </h1>

          <p className="mt-2 text-slate-500">
            Manage tasks and track status changes.
          </p>
        </header>

        <TaskForm onCreateTask={handleCreateTask} />

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Tasks
          </h2>

          <ActorSelect
            users={users}
            selectedActor={selectedActor}
            onActorChange={setSelectedActor}
            disabled={updatingTaskId !== null}
          />

          {statusError && (
            <p className="mb-4 text-sm text-red-600">
              {statusError}
            </p>
          )}

          {deleteError && (
            <p className="mb-4 text-sm text-red-600">
              {deleteError}
            </p>
          )}

          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            selectedActor={selectedActor}
            updatingTaskId={updatingTaskId}
            deletingTaskId={deletingTaskId}
            selectedHistoryTaskId={selectedHistoryTaskId}
            auditLogs={auditLogs}
            historyLoading={historyLoading}
            historyError={historyError}
            onUpdateStatus={handleUpdateStatus}
            onDeleteTask={handleDeleteTask}
            onViewHistory={handleViewHistory}
              actionsDisabled={needsRefresh}
          />
        </section>
      </main>
    </div>
  );
}

export default App;