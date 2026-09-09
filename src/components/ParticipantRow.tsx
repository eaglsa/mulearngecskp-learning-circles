import React from "react";
import type { Participant } from "../types/circle";
import ParticipantAvatar from "./ParticipantAvatar";
import { updateParticipant, deleteParticipant } from "../firebase/circles";
import "./ParticipantRow.css";

interface Props {
  circleId: string;
  participant: Participant;
  index: number;
  onUpdated: (id: string, newName: string) => void;
  onDeleted: (id: string) => void;
}

export default function ParticipantRow({
  circleId,
  participant: p,
  index,
  onUpdated,
  onDeleted,
}: Props) {
  const [editing, setEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(p.name);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function handleSave() {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === p.name) { setEditing(false); return; }
    setSaving(true);
    try {
      await updateParticipant(circleId, p.id, trimmed);
      onUpdated(p.id, trimmed);
      setEditing(false);
    } catch (err) {
      console.error("Failed to rename participant:", err);
      alert("Could not save — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Remove "${p.name}" from this circle?`)) return;
    setDeleting(true);
    try {
      await deleteParticipant(circleId, p.id);
      onDeleted(p.id);
    } catch (err) {
      console.error("Failed to delete participant:", err);
      alert("Could not remove — please try again.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="card prow animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <ParticipantAvatar
        name={p.name}
        department={p.department}
        avatarSeed={p.avatarSeed}
        size="md"
      />

      <div className="prow__info">
        {editing ? (
          <input
            ref={inputRef}
            className="form-input prow__edit-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") { setEditing(false); setEditName(p.name); }
            }}
            disabled={saving}
          />
        ) : (
          <span className="prow__name">{p.name}</span>
        )}
        <span className="prow__dept">{p.department}</span>
      </div>

      <span className="prow__num">#{index + 1}</span>

      <div className="prow__actions">
        {editing ? (
          <>
            <button
              className="btn btn-success btn-sm"
              onClick={handleSave}
              disabled={saving}
              id={`save-participant-${p.id}`}
            >
              {saving ? "…" : "✓ Save"}
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => { setEditing(false); setEditName(p.name); }}
              disabled={saving}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setEditing(true)}
              id={`edit-participant-${p.id}`}
            >
              ✏️ Edit
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              disabled={deleting}
              id={`remove-participant-${p.id}`}
            >
              {deleting ? "…" : "🗑 Remove"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
