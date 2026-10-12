interface ActorSelectProps {
  users: string[];
  selectedActor: string;
  onActorChange: (actor: string) => void;
  disabled: boolean;
}

function ActorSelect({
  users,
  selectedActor,
  onActorChange,
  disabled,
}: ActorSelectProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <label
        htmlFor="actor"
        className="text-sm font-medium text-slate-700"
      >
        Acting as:
      </label>

      <select
        id="actor"
        value={selectedActor}
        onChange={(event) =>
          onActorChange(event.target.value)
        }
        disabled={disabled || users.length === 0}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
      >
        {users.length === 0 && (
          <option value="">No users available</option>
        )}

        {users.map((user) => (
          <option key={user} value={user}>
            {user}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ActorSelect;