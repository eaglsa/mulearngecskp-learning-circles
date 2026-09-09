import React from "react";
import { verifyPassword } from "../firebase/auth";
import "./PasswordGate.css";

interface Props {
  /** bcrypt hash to verify against */
  hash: string;
  /** What the gate is protecting (shows in the heading) */
  label?: string;
  /** Content to render once unlocked */
  children: React.ReactNode;
}

export default function PasswordGate({ hash, label = "this area", children }: Props) {
  const [input, setInput] = React.useState("");
  const [unlocked, setUnlocked] = React.useState(false);
  const [checking, setChecking] = React.useState(false);
  const [error, setError] = React.useState("");
  const [shake, setShake] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || checking) return;

    setChecking(true);
    setError("");

    const ok = await verifyPassword(input, hash);

    setChecking(false);

    if (ok) {
      setUnlocked(true);
    } else {
      setError("Incorrect password. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setInput("");
      inputRef.current?.focus();
    }
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="pg-overlay">
      <div className={`pg-card card animate-pop-in ${shake ? "animate-shake" : ""}`}>
        <div className="pg-icon">🔒</div>
        <h2 className="pg-title">Password Required</h2>
        <p className="pg-subtitle">
          Enter the password to access {label}.
        </p>

        <form onSubmit={handleSubmit} className="pg-form">
          <div className="form-group">
            <label htmlFor="pg-password" className="form-label">
              Password
            </label>
            <input
              ref={inputRef}
              id="pg-password"
              type="password"
              autoFocus
              className="form-input"
              placeholder="Enter password…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={checking}
            />
            {error && <span className="form-error">{error}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={checking || !input.trim()}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {checking ? (
              <>
                <span className="pg-spinner" />
                Checking…
              </>
            ) : (
              "Unlock"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
