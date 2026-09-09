import React from "react";
import type { Circle, CircleStatus } from "../types/circle";
import StatusBadge from "./StatusBadge";
import { updateCircle, confirmCircleDeletion, setCircleStatus } from "../firebase/circles";
import "./AdminCircleRow.css";

interface Props {
  circle: Circle;
  onUpdated: (id: string, fields: Partial<Circle>) => void;
  onDeleted: (id: string) => void;
}

const ALL_STATUSES: CircleStatus[] = [
  "pending",
  "approved",
  "rejected",
  "on_hold",
  "deletion_requested",
];

export default function AdminCircleRow({ circle: c, onUpdated, onDeleted }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [fields, setFields] = React.useState({
    name: c.name,
    topic: c.topic,
    description: c.description,
    hostName: c.hostName,
    hostContact: c.hostContact,
    hostDepartment: c.hostDepartment,
  });
  const [saving, setSaving] = React.useState(false);
  const [statusBusy, setStatusBusy] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  function patch(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateCircle(c.id, fields);
      onUpdated(c.id, fields);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update circle:", err);
      alert("Could not save — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as CircleStatus;
    setStatusBusy(true);
    try {
      await setCircleStatus(c.id, status);
      onUpdated(c.id, { status });
    } catch (err) {
      console.error("Failed to set status:", err);
      alert("Could not change status.");
    } finally {
      setStatusBusy(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Permanently delete "${c.name}"?\n\nThis will remove all participants too. There is no undo.`
      )
    )
      return;
    setDeleting(true);
    try {
      await confirmCircleDeletion(c.id);
      onDeleted(c.id);
    } catch (err) {
      console.error("Failed to delete circle:", err);
      alert("Could not delete — please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="card acr">
      <div className="acr__main">
        {/* Header row */}
        <div className="acr__header">
          {editing ? (
            <input
              className="form-input acr__edit-name"
              value={fields.name}
              onChange={patch("name")}
              placeholder="Circle name"
            />
          ) : (
            <h3 className="acr__name">{c.name}</h3>
          )}

          <div className="acr__header-controls">
            <select
              className="acr__status-select"
              value={c.status}
              onChange={handleStatusChange}
              disabled={statusBusy}
              id={`status-select-${c.id}`}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            <StatusBadge status={c.status} />
          </div>
        </div>

        {/* Topic */}
        {editing ? (
          <input
            className="form-input"
            value={fields.topic}
            onChange={patch("topic")}
            placeholder="Topic"
          />
        ) : (
          <p className="acr__meta">📚 {c.topic}</p>
        )}

        {/* Description */}
        {editing ? (
          <textarea
            className="form-input form-textarea acr__edit-desc"
            value={fields.description}
            onChange={patch("description")}
            rows={3}
          />
        ) : (
          <p className="acr__desc">{c.description}</p>
        )}

        {/* Host fields */}
        {editing ? (
          <div className="acr__host-fields">
            <input
              className="form-input"
              value={fields.hostName}
              onChange={patch("hostName")}
              placeholder="Host name"
            />
            <input
              className="form-input"
              value={fields.hostDepartment}
              onChange={patch("hostDepartment")}
              placeholder="Department"
            />
            <input
              className="form-input"
              value={fields.hostContact}
              onChange={patch("hostContact")}
              placeholder="Contact"
            />
          </div>
        ) : (
          <p className="acr__meta">
            👤 {c.hostName} · {c.hostDepartment}
            {c.hostContact && (
              <span className="acr__contact"> · {c.hostContact}</span>
            )}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="acr__actions">
        {editing ? (
          <>
            <button
              className="btn btn-success btn-sm"
              onClick={handleSave}
              disabled={saving}
              id={`save-circle-${c.id}`}
            >
              {saving ? "…" : "✓ Save"}
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => { setEditing(false); setFields({ name: c.name, topic: c.topic, description: c.description, hostName: c.hostName, hostContact: c.hostContact, hostDepartment: c.hostDepartment }); }}
              disabled={saving}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setEditing(true)}
            id={`edit-circle-${c.id}`}
          >
            ✏️ Edit
          </button>
        )}
        <button
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={deleting}
          id={`delete-circle-${c.id}`}
        >
          {deleting ? "…" : "🗑 Delete"}
        </button>
      </div>
    </div>
  );
}
