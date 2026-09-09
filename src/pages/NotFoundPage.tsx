import { Link } from "react-router-dom";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="page-wrapper nfp">
      <div className="nfp__inner">
        <div className="nfp__number" aria-hidden>404</div>
        <h1 className="nfp__title">Page not found</h1>
        <p className="nfp__sub">
          Looks like this page took a wrong turn. The circle you're looking for
          might have moved or doesn't exist.
        </p>
        <div className="nfp__actions">
          <Link to="/circles" className="btn btn-primary btn-lg">
            Browse Circles
          </Link>
          <Link to="/" className="btn btn-outline">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
