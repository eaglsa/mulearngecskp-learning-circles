import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCircleById, getParticipants } from "../firebase/circles";
import type { Circle, Participant } from "../types/circle";
import ParticipantAvatar from "../components/ParticipantAvatar";
import StatusBadge from "../components/StatusBadge";
import ContactHostCard from "../components/ContactHostCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./CircleDetailPage.css";

// Deterministic gradient (same algorithm as CircleCard)
function topicGradient(topic: string): string {
  const hue = Math.abs(
    topic.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  );
  return `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 40) % 360}, 75%, 40%))`;
}

export default function CircleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [circle, setCircle] = React.useState<Circle | null>(null);
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

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
        document.title = `${c.name} — μLearn Learning Circles`;
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load circle. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner fullPage size="lg" text="Loading circle…" />;

  if (error || !circle) {
    return (
      <div className="page-wrapper">
        <div className="empty-state" style={{ marginTop: 80 }}>
          <div className="empty-state__icon">😕</div>
          <p className="empty-state__title">{error || "Circle not found"}</p>
          <button className="btn btn-outline" onClick={() => navigate("/circles")}>
            ← Back to Circles
          </button>
        </div>
      </div>
    );
  }

  const grad = topicGradient(circle.topic);

  return (
    <div className="page-wrapper cdp">
      {/* Hero banner */}
      <header className="cdp__hero" style={{ background: grad }}>
        <div className="container cdp__hero-inner">
          <Link to="/circles" className="cdp__back">← All Circles</Link>
          <div className="cdp__hero-topic">{circle.topic}</div>
          <h1 className="cdp__hero-title">{circle.name}</h1>
          <div className="cdp__hero-meta">
            <StatusBadge status={circle.status} />
            <span className="cdp__hero-members">
              {participants.length} {participants.length === 1 ? "member" : "members"}
            </span>
          </div>
        </div>
        <div className="cdp__hero-blob" aria-hidden />
      </header>

      {/* Content */}
      <div className="section">
        <div className="container cdp__layout">
          {/* Main: description + participants */}
          <main className="cdp__main">
            <div className="card cdp__desc-card">
              <h2 className="cdp__section-title">About this Circle</h2>
              <p className="cdp__description">{circle.description}</p>
            </div>

            <div className="cdp__participants">
              <div className="cdp__participants-header">
                <h2 className="cdp__section-title">
                  Members
                  <span className="cdp__member-count">{participants.length}</span>
                </h2>
                <Link to={`/circles/${circle.id}/manage`} className="btn btn-ghost btn-sm">
                  🔑 Host Dashboard
                </Link>
              </div>

              {participants.length === 0 ? (
                <div className="empty-state" style={{ padding: "48px 24px" }}>
                  <div className="empty-state__icon">👥</div>
                  <p className="empty-state__title">No members yet</p>
                  <p className="empty-state__text">
                    The host can add participants from the Host Dashboard.
                  </p>
                </div>
              ) : (
                <div className="cdp__participant-grid">
                  {participants.map((p) => (
                    <div key={p.id} className="cdp__participant-item card">
                      <ParticipantAvatar
                        name={p.name}
                        department={p.department}
                        avatarSeed={p.avatarSeed}
                        size="md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* Sidebar: host info */}
          <aside className="cdp__sidebar">
            <div className="card cdp__host-card">
              <h3 className="cdp__sidebar-title">Hosted by</h3>
              <div className="cdp__host-avatar">
                {circle.hostName.charAt(0).toUpperCase()}
              </div>
              <p className="cdp__host-name">{circle.hostName}</p>
              <p className="cdp__host-dept">{circle.hostDepartment}</p>

              <ContactHostCard
                hostName={circle.hostName}
                hostContact={circle.hostContact}
                hostContactType={circle.hostContactType}
              />
            </div>

            <div className="card cdp__manage-card">
              <p className="cdp__manage-text">Are you the host of this circle?</p>
              <Link
                to={`/circles/${circle.id}/manage`}
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "center" }}
                id="manage-circle-btn"
              >
                🔑 Manage Circle
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
