import type { CircleStatus } from "../types/circle";
import "./StatusBadge.css";

interface Props {
  status: CircleStatus;
}

const labels: Record<CircleStatus, string> = {
  approved:            "✓ Approved",
  pending:             "⏳ Pending",
  rejected:            "✕ Rejected",
  on_hold:             "⏸ On Hold",
  deletion_requested:  "🗑 Deletion Requested",
};

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {labels[status]}
    </span>
  );
}
