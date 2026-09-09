import React from "react";
import { Link } from "react-router-dom";
import { requestCircle } from "../firebase/circles";
import { hashPassword } from "../firebase/auth";
import "./RequestCirclePage.css";

interface FormData {
  name: string;
  topic: string;
  description: string;
  hostName: string;
  hostDepartment: string;
  hostContact: string;
  password: string;
  confirmPassword: string;
}

const INITIAL: FormData = {
  name: "",
  topic: "",
  description: "",
  hostName: "",
  hostDepartment: "",
  hostContact: "",
  password: "",
  confirmPassword: "",
};

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: "Too short", color: "#ef4444" },
    { label: "Weak",      color: "#f97316" },
    { label: "Fair",      color: "#eab308" },
    { label: "Good",      color: "#22c55e" },
    { label: "Strong",    color: "#16a34a" },
  ];

  return { score, ...levels[Math.min(score, 4)] };
}

export default function RequestCirclePage() {
  const [form, setForm] = React.useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Partial<FormData>>({});
  const [showPw, setShowPw] = React.useState(false);

  React.useEffect(() => {
    document.title = "Request a Circle — μLearn";
  }, []);

  function update(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((errs) => ({ ...errs, [field]: undefined }));
    };
  }

  function validate(): boolean {
    const errs: Partial<FormData> = {};
    if (!form.name.trim())         errs.name = "Circle name is required";
    if (!form.topic.trim())        errs.topic = "Topic is required";
    if (!form.description.trim())  errs.description = "Description is required";
    if (!form.hostName.trim())     errs.hostName = "Your name is required";
    if (!form.hostDepartment.trim()) errs.hostDepartment = "Department is required";
    if (!form.hostContact.trim())  errs.hostContact = "Contact info is required";
    if (form.password.length < 6)  errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      const passwordHash = await hashPassword(form.password);
      const id = await requestCircle({
        name: form.name.trim(),
        topic: form.topic.trim(),
        description: form.description.trim(),
        hostName: form.hostName.trim(),
        hostDepartment: form.hostDepartment.trim(),
        hostContact: form.hostContact.trim(),
        passwordHash,
      });
      setSuccess(id);
    } catch (err) {
      console.error("Failed to submit circle request:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (success) {
    return (
      <div className="page-wrapper rcp__success-page">
        <div className="rcp__success-card card animate-pop-in">
          <div className="rcp__success-icon">🎉</div>
          <h1 className="rcp__success-title">Request Submitted!</h1>
          <p className="rcp__success-text">
            Your learning circle has been submitted for review. You'll be notified
            once it's approved. Save your password — you'll need it to manage
            participants.
          </p>
          <div className="rcp__success-actions">
            <Link to="/circles" className="btn btn-primary btn-lg">
              Browse Circles
            </Link>
            <button
              className="btn btn-outline"
              onClick={() => { setForm(INITIAL); setSuccess(null); }}
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pwStrength = form.password ? passwordStrength(form.password) : null;

  return (
    <div className="page-wrapper rcp">
      {/* Hero */}
      <header className="rcp__hero">
        <div className="container">
          <Link to="/circles" className="rcp__back">← Back to Circles</Link>
          <h1 className="rcp__title">Start a Learning Circle</h1>
          <p className="rcp__sub">
            Share your knowledge and grow with a community of passionate learners.
          </p>
        </div>
      </header>

      {/* Form */}
      <section className="section">
        <div className="container-sm">
          <form onSubmit={handleSubmit} className="rcp__form">

            {/* ── Section 1: Circle Info ── */}
            <div className="rcp__section">
              <div className="rcp__section-header">
                <div className="rcp__step">1</div>
                <h2 className="rcp__section-title">Circle Details</h2>
              </div>
              <div className="rcp__fields">
                <div className="form-group">
                  <label htmlFor="rc-name" className="form-label">Circle Name *</label>
                  <input
                    id="rc-name"
                    type="text"
                    className={`form-input ${errors.name ? "form-input--error" : ""}`}
                    placeholder="e.g. Web Dev Builders"
                    value={form.name}
                    onChange={update("name")}
                    maxLength={80}
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="rc-topic" className="form-label">Topic / Domain *</label>
                  <input
                    id="rc-topic"
                    type="text"
                    className={`form-input ${errors.topic ? "form-input--error" : ""}`}
                    placeholder="e.g. Web Development, AI/ML, UI/UX…"
                    value={form.topic}
                    onChange={update("topic")}
                    maxLength={60}
                  />
                  {errors.topic && <span className="form-error">{errors.topic}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="rc-desc" className="form-label">Description *</label>
                  <textarea
                    id="rc-desc"
                    className={`form-input form-textarea ${errors.description ? "form-input--error" : ""}`}
                    placeholder="What will this circle focus on? What's the vibe? Who should join?"
                    value={form.description}
                    onChange={update("description")}
                    rows={4}
                    maxLength={500}
                  />
                  <span className="form-hint">{form.description.length}/500 characters</span>
                  {errors.description && <span className="form-error">{errors.description}</span>}
                </div>
              </div>
            </div>

            {/* ── Section 2: Host Info ── */}
            <div className="rcp__section">
              <div className="rcp__section-header">
                <div className="rcp__step">2</div>
                <h2 className="rcp__section-title">Your Details</h2>
              </div>
              <div className="rcp__fields">
                <div className="rcp__row">
                  <div className="form-group">
                    <label htmlFor="rc-hostName" className="form-label">Your Name *</label>
                    <input
                      id="rc-hostName"
                      type="text"
                      className={`form-input ${errors.hostName ? "form-input--error" : ""}`}
                      placeholder="Full name"
                      value={form.hostName}
                      onChange={update("hostName")}
                    />
                    {errors.hostName && <span className="form-error">{errors.hostName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="rc-dept" className="form-label">Department *</label>
                    <input
                      id="rc-dept"
                      type="text"
                      className={`form-input ${errors.hostDepartment ? "form-input--error" : ""}`}
                      placeholder="e.g. Computer Science"
                      value={form.hostDepartment}
                      onChange={update("hostDepartment")}
                    />
                    {errors.hostDepartment && <span className="form-error">{errors.hostDepartment}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="rc-contact" className="form-label">Contact (WhatsApp link / email) *</label>
                  <input
                    id="rc-contact"
                    type="text"
                    className={`form-input ${errors.hostContact ? "form-input--error" : ""}`}
                    placeholder="https://wa.me/91xxxxxxxxxx or you@email.com"
                    value={form.hostContact}
                    onChange={update("hostContact")}
                  />
                  <span className="form-hint">This will be visible to members who want to reach you.</span>
                  {errors.hostContact && <span className="form-error">{errors.hostContact}</span>}
                </div>
              </div>
            </div>

            {/* ── Section 3: Password ── */}
            <div className="rcp__section">
              <div className="rcp__section-header">
                <div className="rcp__step">3</div>
                <h2 className="rcp__section-title">Set a Circle Password</h2>
              </div>
              <p className="rcp__pw-info">
                This password protects your Host Dashboard where you manage participants.
                Keep it safe — it can't be recovered.
              </p>
              <div className="rcp__fields">
                <div className="form-group">
                  <label htmlFor="rc-pw" className="form-label">Password *</label>
                  <div className="rcp__pw-wrap">
                    <input
                      id="rc-pw"
                      type={showPw ? "text" : "password"}
                      className={`form-input ${errors.password ? "form-input--error" : ""}`}
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={update("password")}
                    />
                    <button
                      type="button"
                      className="rcp__pw-toggle"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {pwStrength && (
                    <div className="rcp__pw-strength">
                      <div className="rcp__pw-bars">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="rcp__pw-bar"
                            style={{
                              background:
                                i < pwStrength.score ? pwStrength.color : "var(--ml-gray-100)",
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ color: pwStrength.color, fontSize: "0.8rem", fontWeight: 600 }}>
                        {pwStrength.label}
                      </span>
                    </div>
                  )}
                  {errors.password && <span className="form-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="rc-cpw" className="form-label">Confirm Password *</label>
                  <input
                    id="rc-cpw"
                    type="password"
                    className={`form-input ${errors.confirmPassword ? "form-input--error" : ""}`}
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                  />
                  {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="submit-circle-btn"
              className="btn btn-primary btn-lg rcp__submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="pg-spinner" />
                  Submitting…
                </>
              ) : (
                "Submit Circle Request →"
              )}
            </button>

            <p className="rcp__disclaimer">
              Your request will be reviewed by the μLearn team before going live.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
