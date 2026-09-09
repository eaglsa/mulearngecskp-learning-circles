import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CirclesListPage from "./pages/CirclesListPage";
import CircleDetailPage from "./pages/CircleDetailPage";
import RequestCirclePage from "./pages/RequestCirclePage";
import HostDashboardPage from "./pages/HostDashboardPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Home → redirects to circles list */}
        <Route path="/" element={<CirclesListPage />} />

        {/* NOTE: /circles/admin MUST come before /circles/:id to avoid shadowing */}
        <Route path="/circles/admin" element={<AdminPanelPage />} />

        <Route path="/circles" element={<CirclesListPage />} />
        <Route path="/circles/new" element={<RequestCirclePage />} />
        <Route path="/circles/:id" element={<CircleDetailPage />} />
        <Route path="/circles/:id/manage" element={<HostDashboardPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
