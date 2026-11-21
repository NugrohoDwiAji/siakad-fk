import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-[120px] font-bold text-blue-600 leading-none tracking-tighter">
            404
          </h1>
        </div>

        <div className="space-y-3 mb-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            Silakan kembali ke halaman sebelumnya.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition"
          >
            Kembali
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
