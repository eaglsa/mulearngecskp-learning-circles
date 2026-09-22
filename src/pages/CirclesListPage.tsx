import React from "react";
import { Link } from "react-router-dom";
import { getApprovedCircles, getParticipants } from "../firebase/circles";
import type { Circle } from "../types/circle";
import CircleCard from "../components/CircleCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./CirclesListPage.css";

export default function CirclesListPage() {
  const [circles, setCircles] = React.useState<Circle[]>([]);
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [topic, setTopic] = React.useState("all");

  React.useEffect(() => {
    document.title = "Learning Circles — μLearn";
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getApprovedCircles();
      setCircles(data);

      // Fetch participant counts in parallel
      const entries = await Promise.all(
        data.map(async (c) => {
          const p = await getParticipants(c.id);
          return [c.id, p.length] as [string, number];
        })
      );
      setCounts(Object.fromEntries(entries));
    } catch (err) {
      console.error("Failed to load circles:", err);
    } finally {
      setLoading(false);
    }
  }

  // Unique topics for filter
  const topics = ["all", ...Array.from(new Set(circles.map((c) => c.topic)))];

  const filtered = circles.filter((c) => {
    const matchesTopic = topic === "all" || c.topic === topic;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.topic.toLowerCase().includes(q) ||
      c.hostName.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q);
    return matchesTopic && matchesSearch;
  });

  const totalMembers = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="page-wrapper clp">
      {/* Hero */}
      <header className="clp__hero">
        <div className="container clp__hero-inner">
          <div className="clp__hero-tag animate-fade-in">🔵 Peer-to-peer learning</div>
          <h1 className="clp__hero-title animate-slide-up">
            Learning <span className="clp__hero-accent">Circles</span>
          </h1>
          <p className="clp__hero-sub animate-slide-up">
            A Learning Circle is a small group of students learning the same skill
            together — no lectures, no formal sessions. Just a few people who pick
            a topic, team up, and learn by actually building and doing it, at their own pace.
          </p>
          <p className="clp__hero-contact animate-slide-up">
            Have questions before requesting a circle? Reach out to{" "}
            <strong>Muhammed Shadil M P</strong> — 📞{" "}
            <a href="tel:+919895195654" className="clp__hero-contact-link">+919895195654</a>
          </p>

          <div className="clp__hero-actions animate-slide-up">
            <Link to="/circles/new" className="btn btn-primary btn-lg">
              + Start a Circle
            </Link>
            <a href="#circles-grid" className="btn btn-outline btn-lg">
              Browse Circles
            </a>
          </div>

          {/* Stats strip */}
          {!loading && (
            <div className="clp__stats animate-fade-in">
              <div className="clp__stat">
                <span className="clp__stat-num">{circles.length}</span>
                <span className="clp__stat-label">Active Circles</span>
              </div>
              <div className="clp__stat-divider" />
              <div className="clp__stat">
                <span className="clp__stat-num">{totalMembers}</span>
                <span className="clp__stat-label">Total Learners</span>
              </div>
              <div className="clp__stat-divider" />
              <div className="clp__stat">
                <span className="clp__stat-num">{topics.length - 1}</span>
                <span className="clp__stat-label">Topics Covered</span>
              </div>
            </div>
          )}
        </div>

        {/* Floating decorative blobs */}
        <div className="clp__blob clp__blob--1" aria-hidden />
        <div className="clp__blob clp__blob--2" aria-hidden />
      </header>

      {/* Circles grid */}
      <section id="circles-grid" className="section">
        <div className="container">
          {/* Search + filter bar */}
          <div className="clp__filters">
            <div className="clp__search-wrap">
              <span className="clp__search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search circles, topics, hosts…"
                className="form-input clp__search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search circles"
              />
            </div>

            <div className="clp__topic-filters">
              {topics.map((t) => (
                <button
                  key={t}
                  className={`clp__topic-btn ${topic === t ? "active" : ""}`}
                  onClick={() => setTopic(t)}
                >
                  {t === "all" ? "All Topics" : t}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <LoadingSpinner fullPage size="lg" text="Loading circles…" />
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🔭</div>
              <p className="empty-state__title">
                {search || topic !== "all" ? "No circles match your filter" : "No circles yet"}
              </p>
              <p className="empty-state__text">
                Be the first to start a learning circle!
              </p>
              <Link to="/circles/new" className="btn btn-primary" style={{ marginTop: 8 }}>
                Request a Circle
              </Link>
            </div>
          ) : (
            <div className="grid-3">
              {filtered.map((c) => (
                <CircleCard
                  key={c.id}
                  circle={c}
                  participantCount={counts[c.id]}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA banner */}
      <section className="clp__cta-banner">
        <div className="container clp__cta-inner">
          <div>
            <h2 className="clp__cta-title">Ready to start learning together?</h2>
            <p className="clp__cta-sub">
              Host a circle on any topic you're passionate about.
            </p>
          </div>
          <Link to="/circles/new" className="btn btn-primary btn-lg">
            Request a Circle →
          </Link>
        </div>
      </section>
    </div>
  );
}
