import React from "react";
import type { Circle } from "../types/circle";
import { confirmCircleDeletion, denyCircleDeletion } from "../firebase/circles";
import "./DeletionRequestRow.css";

interface Props {
  circle: Circle;
  onConfirmed: (id: string) => void;
  onDenied: (id: string) => void;
}

export default function DeletionRequestRow({ circle: c, onConfirmed, onDenied }: Props) {
  const [confirming, setConfirming] = React.useState(false);
  const [denying, setDenying] = React.useState(false);

  async function handleConfirm() {
    if (
      !window.confirm(
        `Permanently delete "${c.name}" and all its participants?\n\nThis cannot be undone.`
      )
    )
      return;
    setConfirming(true);
    try {
      await confirmCircleDeletion(c.id);
      onConfirmed(c.id);
    } catch (err) {
      console.error("Failed to delete circle:", err);
      alert("Could not delete — please try again.");
      setConfirming(false);
    }
  }

  async function handleDeny() {
    setDenying(true);
    try {
      await denyCircleDeletion(c.id);
      onDenied(c.id);
    } catch (err) {
      console.error("Failed to deny deletion:", err);
      alert("Could not deny — please try again.");
      setDenying(false);
    }
  }

  return (
    <div className="card drr">
      <div className="drr__main">
        <h3 className="drr__name">{c.name}</h3>
        <p className="drr__meta">
          📚 {c.topic} · 👤 {c.hostName} · {c.hostDepartment}
        </p>
        <p className="drr__desc">{c.description}</p>
      </div>

      <div className="drr__actions">
        <button
          className="btn btn-danger btn-sm"
          onClick={handleConfirm}
          disabled={confirming || denying}
          id={`confirm-delete-${c.id}`}
        >
          {confirming ? "Deleting…" : "🗑 Confirm Delete"}
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={handleDeny}
          disabled={confirming || denying}
          id={`deny-delete-${c.id}`}
        >
          {denying ? "…" : "↩ Deny"}
        </button>
      </div>
    </div>
  );
}
