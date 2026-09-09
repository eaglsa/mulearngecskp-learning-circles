import React from "react";
import { useParams, Link } from "react-router-dom";
import { getCircleById, addParticipant, getParticipants } from "../firebase/circles";
import type { Circle, Participant } from "../types/circle";
import PasswordGate from "../components/PasswordGate";
import ParticipantAvatar from "../components/ParticipantAvatar";
import LoadingSpinner from "../components/LoadingSpinner";
import "./HostDashboardPage.css";

function generateSeed(name: string): string {
  // Combine name + timestamp for a unique but reproducible-per-run seed
  return `${name.trim().toLowerCase()}-${Date.now()}`;
}

export default function HostDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const [circle, setCircle] = React.useState<Circle | null>(null);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // Add participant form
  const [pName, setPName] = React.useState("");
  const [pDept, setPDept] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [addError, setAddError] = React.useState("");
  const [addSuccess, setAddSuccess] = React.useState("");

  React.useEffect(() => {
    if (!id) return;
    load(id);
  }, [id]);

  async function load(circleId: string) {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        getCircleById(circleId),
        getParticipants(circleId),
      ]);
      if (!c) {
        setError("Circle not found.");
      } else {
        setCircle(c);
        setParticipants(p);
        document.title = `Host Dashboard — ${c.name}`;
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load circle.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !pName.trim() || !pDept.trim() || adding) return;
    setAdding(true);
    setAddError("");
    setAddSuccess("");

    try {
      const seed = generateSeed(pName);
      await addParticipant(id, {
        name: pName.trim(),
        department: pDept.trim(),
        avatarSeed: seed,
      });

      // Refresh participants
      const updated = await getParticipants(id);
      setParticipants(updated);
      setAddSuccess(`${pName.trim()} added successfully!`);
      setPName("");
      setPDept("");
      setTimeout(() => setAddSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to add participant:", err);
      setAddError("Failed to add participant. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage size="lg" text="Loading dashboard…" />;

  if (error || !circle) {
    return (
      <div className="page-wrapper">
        <div className="empty-state" style={{ marginTop: 80 }}>
          <div className="empty-state__icon">😕</div>
          <p className="empty-state__title">{error || "Circle not found"}</p>
          <Link to="/circles" className="btn btn-outline">← Back to Circles</Link>
        </div>
      </div>
    );
  }

  const dashboardContent = (
    <div className="page-wrapper hdp">
      {/* Header */}
      <header className="hdp__header">
        <div className="container hdp__header-inner">
          <div>
            <Link to={`/circles/${circle.id}`} className="hdp__back">← {circle.name}</Link>
            <h1 className="hdp__title">Host Dashboard</h1>
            <p className="hdp__sub">Manage participants for your learning circle</p>
          </div>
          <div className="hdp__stats">
            <div className="hdp__stat">
              <span className="hdp__stat-num">{participants.length}</span>
              <span className="hdp__stat-label">Members</span>
            </div>
          </div>
        </div>
      </header>

      <div className="section">
        <div className="container hdp__layout">
          {/* Add participant panel */}
          <div className="card hdp__add-card">
            <h2 className="hdp__card-title">➕ Add Participant</h2>
            <p className="hdp__card-sub">Add a new member to your circle.</p>

            <form onSubmit={handleAddParticipant} className="hdp__form">
              <div className="form-group">
                <label htmlFor="p-name" className="form-label">Full Name *</label>
                <input
                  id="p-name"
                  type="text"
                  className="form-input"
                  placeholder="Participant's name"
                  value={pName}
                  onChange={(e) => { setPName(e.target.value); setAddError(""); }}
                  disabled={adding}
                />
              </div>
              <div className="form-group">
                <label htmlFor="p-dept" className="form-label">Department *</label>
                <input
                  id="p-dept"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Computer Science"
                  value={pDept}
                  onChange={(e) => { setPDept(e.target.value); setAddError(""); }}
                  disabled={adding}
                />
              </div>

              {addError && <p className="form-error">{addError}</p>}
              {addSuccess && (
                <p className="hdp__success animate-fade-in">✓ {addSuccess}</p>
              )}

              <button
                type="submit"
                id="add-participant-btn"
                className="btn btn-primary"
                disabled={adding || !pName.trim() || !pDept.trim()}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {adding ? (
                  <><span className="pg-spinner" /> Adding…</>
                ) : (
                  "Add to Circle"
                )}
              </button>
            </form>
          </div>

          {/* Participant roster */}
          <div className="hdp__roster">
            <h2 className="hdp__roster-title">
              Current Members
              <span className="cdp__member-count">{participants.length}</span>
            </h2>

            {participants.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">👥</div>
                <p className="empty-state__title">No members yet</p>
                <p className="empty-state__text">Add your first participant using the form.</p>
              </div>
            ) : (
              <div className="hdp__participant-list">
                {participants.map((p, i) => (
                  <div
                    key={p.id}
                    className="card hdp__participant-row animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <ParticipantAvatar
                      name={p.name}
                      department={p.department}
                      avatarSeed={p.avatarSeed}
                      size="md"
                    />
                    <span className="hdp__participant-num">#{i + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PasswordGate hash={circle.passwordHash} label={`the "${circle.name}" dashboard`}>
      {dashboardContent}
    </PasswordGate>
  );
}
