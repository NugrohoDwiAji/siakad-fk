import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Profile from "@/features/mahasiswa/pages/profile";
import MahasiswaSignIn from "@/features/mahasiswa/pages/mahasiswaSignIn";
import AdminSignIn from "@/features/admin/pages/adminSigIn";
import DosenAuth from "@/features/dosen/pages/dosenAuth";
import MahasiswaKurikulum from "@/features/mahasiswa/pages/kurikulum";
import AdminKurikulum from "@/features/admin/pages/kurikulum";
import Krs from "@/features/mahasiswa/pages/krs";
import Khs from "@/features/mahasiswa/pages/khs";
import Dashboard from "@/features/admin/pages/dashboard";
import DosenDashboard from "@/features/dosen/pages/dosenDashboard";
import DosenPerwalian from "@/features/dosen/pages/dosenPerwalian";
import DosenKurikulumMahasiswa from "@/features/dosen/pages/dosenKurikulumMahasiswa";
import DosenKelas from "@/features/dosen/pages/dosenKelas";
import DosenPenilaianKelas from "@/features/dosen/pages/dosenPenilaianKelas";
import DosenPenilaianMahasiswa from "@/features/dosen/pages/dosenPenilaianMahasiswa";
import DosenKaprodiPantauanKelas from "@/features/dosen/pages/dosenKaprodiPantauanKelas";
import DosenKaprodiMahasiswaKelas from "@/features/dosen/pages/dosenKaprodiMahasiswaKelas";
import DosenKaprodiValidasiNilai from "@/features/dosen/pages/dosenKaprodiValidasiNilai";
import AdminLayout from "@/components/layout/AdminLayout";
import DosenLayout from "@/features/dosen/components/layouts/DosenLayout";
import PenilaianBlok from "@/features/admin/pages/penilaianBlok";
import MasterDataBlok from "@/features/admin/pages/masterDataBlok";
import TemplateDetail from "@/features/admin/pages/templateDetail";
import TemplateEdit from "@/features/admin/pages/templateEdit";
import PrivateRoute from "@/components/layout/PrivateLayout";
import AdminPrivateRoute from "@/components/layout/AdminPrivateRoute";
import DosenPrivateRoute from "@/features/dosen/components/layouts/DosenPrivateRoute";
import AdminKrs from "@/features/admin/pages/krs";
import AdminKhs from "@/features/admin/pages/khs";
import PetikanNilai from "@/features/mahasiswa/pages/petikanNilai";
import DataMahasiswa from "@/features/admin/pages/dataMahasiswa";
import DataDosen from "@/features/admin/pages/dataDosen";
import MataKuliah from "@/features/admin/pages/mataKuliah";
import ProgramStudi from "@/features/admin/pages/programStudi";
import TahunAkademik from "@/features/admin/pages/tahunAkademik";
import Trash from "@/features/admin/pages/trash";
import Perwalian from "@/features/admin/pages/perwalian";
import AdminKelas from "@/features/admin/pages/kelas";
import AdminAssessment from "@/features/admin/pages/assessment";
import AssessmentDetail from "@/features/admin/pages/assessmentDetail";
import AdminPembayaran from "@/features/admin/pages/pembayaran";
import AuditPddikti from "@/features/admin/pages/auditPddikti";
import NotFound from "@/features/common/pages/notFound";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<MahasiswaSignIn />} />
        <Route path="/admin/login" element={<AdminSignIn />} />

        {/* Mahasiswa routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to={"/profile"} replace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/kurikulum" element={<MahasiswaKurikulum />} />
            <Route path="/krs" element={<Krs />} />
            <Route path="/khs" element={<Khs />} />
            <Route path="/petikan-nilai" element={<PetikanNilai />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<AdminPrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={<Navigate to={"/admin/dashboard"} replace />}
            />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/kurikulum" element={<AdminKurikulum />} />
            <Route path="/admin/krs" element={<AdminKrs />} />
            <Route path="/admin/khs" element={<AdminKhs />} />
            <Route path="/admin/data-mahasiswa" element={<DataMahasiswa />} />
            <Route path="/admin/data-dosen" element={<DataDosen />} />
            <Route path="/admin/matakuliah" element={<MataKuliah />} />
            <Route path="/admin/program-studi" element={<ProgramStudi />} />
            <Route path="/admin/tahun-akademik" element={<TahunAkademik />} />
            <Route path="/admin/perwalian" element={<Perwalian />} />
            <Route path="/admin/kelas" element={<AdminKelas />} />
            <Route path="/admin/assessment" element={<AdminAssessment />} />
            <Route path="/admin/assessment/:codeKelas" element={<AssessmentDetail />} />
            <Route path="/admin/assessment/detail" element={<AssessmentDetail />} />
            <Route path="/admin/blok/assessment" element={<AdminAssessment />} />
            <Route path="/admin/blok/assessment/:codeKelas" element={<AssessmentDetail />} />
            <Route path="/admin/blok/assessment/detail" element={<AssessmentDetail />} />
            <Route path="/admin/keuangan/pembayaran" element={<AdminPembayaran />} />
            <Route path="/admin/pembayaran" element={<Navigate to="/admin/keuangan/pembayaran" replace />} />
            <Route path="/admin/blok/PenilaianBlok" element={<PenilaianBlok />} />
            <Route path="/admin/blok/master-data" element={<MasterDataBlok />} />
            <Route path="/admin/blok/master-data/:code" element={<TemplateDetail />} />
            <Route path="/admin/blok/master-data/:code/edit" element={<TemplateEdit />} />
            <Route path="/admin/audit-pddikti" element={<AuditPddikti />} />
            <Route path="/admin/pddikti" element={<Navigate to="/admin/audit-pddikti" replace />} />
            <Route path="/admin/pddikti/audit" element={<Navigate to="/admin/audit-pddikti" replace />} />
            <Route path="/admin/blok/audit-pddikti" element={<Navigate to="/admin/audit-pddikti" replace />} />
            <Route path="/admin/trash/mahasiswa" element={<Trash />} />
            <Route path="/admin/trash/dosen" element={<Trash />} />
            <Route path="/admin/trash/matakuliah" element={<Trash />} />
          </Route>
        </Route>

        {/* Dosen routes */}
        <Route path="/dosen/auth" element={<DosenAuth />} />
        <Route element={<DosenPrivateRoute />}>
          <Route element={<DosenLayout />}>
            <Route
              path="/dosen"
              element={<Navigate to={"/dosen/dashboard"} replace />}
            />
            <Route path="/dosen/dashboard" element={<DosenDashboard />} />
            <Route path="/dosen/kurikulum" element={<DosenKurikulumMahasiswa />} />
            <Route path="/dosen/kelas" element={<DosenKelas />} />
            <Route path="/dosen/perwalian" element={<DosenPerwalian />} />
            <Route path="/dosen/penilaian" element={<DosenPenilaianKelas />} />
            <Route
              path="/dosen/penilaian/:codeKelas"
              element={<DosenPenilaianMahasiswa />}
            />
            {/* Kaprodi Validasi Penilaian routes */}
            <Route
              path="/dosen/penilaian/validasi"
              element={<DosenKaprodiPantauanKelas />}
            />
            <Route
              path="/dosen/penilaian/validasi/:codeKelas"
              element={<DosenKaprodiMahasiswaKelas />}
            />
            {/* Backward compatibility redirects */}
            <Route
              path="/dosen/persetujuan-nilai"
              element={<Navigate to={"/dosen/penilaian/validasi"} replace />}
            />
            <Route
              path="/dosen/persetujuan-nilai/pantauan-kelas"
              element={<Navigate to={"/dosen/penilaian/validasi"} replace />}
            />
            <Route
              path="/dosen/persetujuan-nilai/pantauan-kelas/:codeKelas"
              element={<Navigate to={"/dosen/penilaian/validasi"} replace />}
            />
            <Route
              path="/dosen/persetujuan-nilai/validasi-nilai"
              element={<DosenKaprodiValidasiNilai />}
            />
          </Route>
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
