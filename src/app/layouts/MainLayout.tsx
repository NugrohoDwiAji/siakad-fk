import { Outlet } from "react-router-dom";
import MahasiswaHeader from "../../components/organisms/MahasiswaHeader";
import MahasiswaFooter from "../../components/organisms/MahasiswaFooter";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MahasiswaHeader />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <MahasiswaFooter />
    </div>
  );
}
