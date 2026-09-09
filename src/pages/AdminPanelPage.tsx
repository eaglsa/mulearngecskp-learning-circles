import React from "react";
import { getCirclesByStatus, setCircleStatus } from "../firebase/circles";
import type { Circle, CircleStatus } from "../types/circle";
import PasswordGate from "../components/PasswordGate";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import "./AdminPanelPage.css";

// Admin password hash is stored in .env as VITE_ADMIN_PASSWORD_HASH
// Default: bcrypt hash of "mulearn-admin" (10 rounds)
// Generate a new one at https://bcrypt-generator.com or via node: bcrypt.hashSync("yourpw", 10)
const ADMIN_HASH =
  import.meta.env.VITE_ADMIN_PASSWORD_HASH ??
  "$2a$10$Xm.L9eEFxCZSu1pY8bsq6eP/nkKnJRZWFJWQfHTPumxl5uy0F9FGS"; // default: "mulearn-admin"

type Tab = CircleStatus;

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

  async function loadTab(status: Tab) {
    setLoading(true);
    try {
      const data = await getCirclesByStatus(status);
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

  const tabs: Tab[] = ["pending", "approved", "rejected"];

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
                key={t}
                className={`adp__tab ${tab === t ? "adp__tab--active" : ""}`}
                onClick={() => setTab(t)}
                id={`admin-tab-${t}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <LoadingSpinner fullPage size="lg" text="Loading circles…" />
          ) : circles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                {tab === "pending" ? "📭" : tab === "approved" ? "✅" : "❌"}
              </div>
              <p className="empty-state__title">No {tab} circles</p>
              <p className="empty-state__text">
                {tab === "pending"
                  ? "No new requests are waiting for review."
                  : `No circles with ${tab} status.`}
              </p>
            </div>
          ) : (
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
