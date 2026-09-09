import React from "react";
import {
  getCirclesByStatus,
  getAllCircles,
  setCircleStatus,
} from "../firebase/circles";
import type { Circle, CircleStatus } from "../types/circle";
import PasswordGate from "../components/PasswordGate";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import AdminCircleRow from "../components/AdminCircleRow";
import DeletionRequestRow from "../components/DeletionRequestRow";
import "./AdminPanelPage.css";

// Admin password hash is stored in .env as VITE_ADMIN_PASSWORD_HASH
// Default: bcrypt hash of "mulearn-admin" (10 rounds)
// Generate a new one at https://bcrypt-generator.com or via node: bcrypt.hashSync("yourpw", 10)
const ADMIN_HASH =
  import.meta.env.VITE_ADMIN_PASSWORD_HASH ??
  "$2a$10$Xm.L9eEFxCZSu1pY8bsq6eP/nkKnJRZWFJWQfHTPumxl5uy0F9FGS"; // default: "mulearn-admin"

type Tab = CircleStatus | "all";

export default function AdminPanelPage() {
  React.useEffect(() => {
    document.title = "Admin Panel — μLearn Circles";
  }, []);

  return (
    <PasswordGate hash={ADMIN_HASH} label="the Admin Panel">
      <AdminContent />
    </PasswordGate>
  );
}

function AdminContent() {
  const [tab, setTab] = React.useState<Tab>("pending");
  const [circles, setCircles] = React.useState<Circle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadTab(tab);
  }, [tab]);

  async function loadTab(t: Tab) {
    setLoading(true);
    try {
      let data: Circle[];
      if (t === "all") {
        data = await getAllCircles();
      } else {
        data = await getCirclesByStatus(t as CircleStatus);
      }
      setCircles(data);
    } catch (err) {
      console.error("Failed to load circles:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(id: string, status: CircleStatus) {
    setUpdating(id);
    try {
      await setCircleStatus(id, status);
      // Remove from current list optimistically
      setCircles((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(null);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending",            label: "⏳ Pending" },
    { key: "approved",           label: "✓ Approved" },
    { key: "rejected",           label: "✕ Rejected" },
    { key: "all",                label: "🗂 All Circles" },
    { key: "deletion_requested", label: "🗑 Deletion Requests" },
  ];

  const tabEmptyIcon: Partial<Record<Tab, string>> = {
    pending:            "📭",
    approved:           "✅",
    rejected:           "❌",
    all:                "📋",
    deletion_requested: "🗑",
  };

  return (
    <div className="page-wrapper adp">
      {/* Header */}
      <header className="adp__header">
        <div className="container">
          <div className="adp__header-tag">🛡️ Admin Area</div>
          <h1 className="adp__title">Circle Moderation</h1>
          <p className="adp__sub">Review and manage circle requests.</p>
        </div>
      </header>

      <div className="section">
        <div className="container">
          {/* Tabs */}
          <div className="adp__tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`adp__tab ${tab === t.key ? "adp__tab--active" : ""}`}
                onClick={() => setTab(t.key)}
                id={`admin-tab-${t.key}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <LoadingSpinner fullPage size="lg" text="Loading circles…" />
          ) : circles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                {tabEmptyIcon[tab] ?? "📋"}
              </div>
              <p className="empty-state__title">No {tab.replace("_", " ")} circles</p>
              <p className="empty-state__text">
                {tab === "pending"
                  ? "No new requests are waiting for review."
                  : `No circles with ${tab.replace("_", " ")} status.`}
              </p>
            </div>
          ) : tab === "all" ? (
            // ── All Circles tab ──
            <div className="adp__list">
              {circles.map((c) => (
                <AdminCircleRow
                  key={c.id}
                  circle={c}
                  onUpdated={(id, fields) =>
                    setCircles((prev) =>
                      prev.map((x) => (x.id === id ? { ...x, ...fields } : x))
                    )
                  }
                  onDeleted={(id) =>
                    setCircles((prev) => prev.filter((x) => x.id !== id))
                  }
                />
              ))}
            </div>
          ) : tab === "deletion_requested" ? (
            // ── Deletion Requests tab ──
            <div className="adp__list">
              {circles.map((c) => (
                <DeletionRequestRow
                  key={c.id}
                  circle={c}
                  onConfirmed={(id) =>
                    setCircles((prev) => prev.filter((x) => x.id !== id))
                  }
                  onDenied={(id) =>
                    setCircles((prev) => prev.filter((x) => x.id !== id))
                  }
                />
              ))}
            </div>
          ) : (
            // ── Status-filtered tabs (pending / approved / rejected) ──
            <div className="adp__list">
              {circles.map((c) => (
                <div key={c.id} className="card adp__row">
                  <div className="adp__row-main">
                    <div className="adp__row-header">
                      <h3 className="adp__circle-name">{c.name}</h3>
                      <StatusBadge status={c.status} />
                    </div>

                    <div className="adp__row-meta">
                      <span className="adp__meta-item">
                        📚 {c.topic}
                      </span>
                      <span className="adp__meta-item">
                        👤 {c.hostName} · {c.hostDepartment}
                      </span>
                      <span className="adp__meta-item">
                        📅 {c.createdAt?.toDate
                          ? new Date(c.createdAt.toDate()).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>

                    <p className="adp__desc">{c.description}</p>

                    {c.hostContact && (
                      <a
                        href={c.hostContact}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="adp__contact-link"
                      >
                        💬 {c.hostContact}
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="adp__actions">
                    {tab !== "approved" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatus(c.id, "approved")}
                        disabled={updating === c.id}
                        id={`approve-${c.id}`}
                      >
                        {updating === c.id ? "…" : "✓ Approve"}
                      </button>
                    )}
                    {tab !== "rejected" && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleStatus(c.id, "rejected")}
                        disabled={updating === c.id}
                        id={`reject-${c.id}`}
                      >
                        {updating === c.id ? "…" : "✕ Reject"}
                      </button>
                    )}
                    {tab === "rejected" && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleStatus(c.id, "approved")}
                        disabled={updating === c.id}
                        id={`re-approve-${c.id}`}
                      >
                        {updating === c.id ? "…" : "↩ Re-approve"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
