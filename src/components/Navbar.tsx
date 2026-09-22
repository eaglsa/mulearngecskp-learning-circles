import React from "react";
import { NavLink, Link } from "react-router-dom";
import muLearnLogo from "../assets/mulearn-logo.png";
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
        <div className="navbar__logo">
          <img src={muLearnLogo} alt="muLearn GECSKP" className="navbar__logo-img" />
        </div>

        {/* Desktop links */}
        <div className="navbar__links">
          <a
            href="https://campus-chapter-mulearn.vercel.app/"
            className="navbar__link"
          >
            Home
          </a>
          <NavLink
            to="/circles"
            end={false}
            className={({ isActive }) =>
              `navbar__link ${isActive ? "navbar__link--active" : ""}`
            }
          >
            Learning Circles
          </NavLink>
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
          <a
            href="https://campus-chapter-mulearn.vercel.app/"
            className="navbar__mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </a>
          <NavLink
            to="/circles"
            end={false}
            className={({ isActive }) =>
              `navbar__mobile-link ${isActive ? "navbar__mobile-link--active" : ""}`
            }
            onClick={() => setMobileOpen(false)}
          >
            Learning Circles
          </NavLink>
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
