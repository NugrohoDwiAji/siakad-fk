import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Profile from "../../features/mahasiswa/pages/profile";
import MahasiswaSignIn from "../../features/auth/pages/MahasiswaSignIn";
import AdminSignIn from "../../features/auth/pages/AdminSigIn";
import Kurikulum from "../../features/mahasiswa/pages/kurikulum";
import Krs from "../../features/mahasiswa/pages/krs";
import Khs from "../../features/mahasiswa/pages/khs";
import Dashboard from "../../features/admin/pages/dashboard";
import AdminLayout from "../layouts/AdminLayout";
import PenilaianBlok from "../../features/admin/pages/penilaianBlok";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<MahasiswaSignIn />} />
        <Route path="/admin/login" element={<AdminSignIn />} />
        <Route
          path="/admin"
          element={<Navigate to={"/admin/dashboard"} replace />}
        />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to={"/profile"} replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/kurikulum" element={<Kurikulum />} />
          <Route path="/krs" element={<Krs />} />
          <Route path="/khs" element={<Khs />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/PenilaianBlok" element={<PenilaianBlok />} />
        </Route>
      </Routes>
    </Router>
  );
}
