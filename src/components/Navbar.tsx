import React from "react";
import { NavLink, Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: "Home", end: true },
    { to: "/circles", label: "Learning Circles", end: false },
  ];

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="μLearn home">
          <span className="navbar__logo-mu">μ</span>
          <span className="navbar__logo-text">Learn</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar__links">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `navbar__link ${isActive ? "navbar__link--active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* CTA */}
        <Link
          to="/circles/new"
          className="btn btn-primary btn-sm navbar__cta"
        >
          + Request a Circle
        </Link>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger ${mobileOpen ? "open" : ""}`}
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="navbar__mobile animate-slide-down">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `navbar__mobile-link ${isActive ? "navbar__mobile-link--active" : ""}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/circles/new"
            className="btn btn-primary btn-sm"
            onClick={() => setMobileOpen(false)}
          >
            + Request a Circle
          </Link>
        </div>
      )}
    </nav>
  );
}
