// src/features/mahasiswa/store/mahasiswaSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Mahasiswa } from "@/features/mahasiswa/types";


// Mendefinisikan bentuk state awal
interface MahasiswaState {
  profile: Mahasiswa | null;
  isLoading: boolean;
}

const initialState: MahasiswaState = {
  profile: null,
  isLoading: false,
};

const mahasiswaSlice = createSlice({
  name: "mahasiswa",
  initialState,
  reducers: {
    // Action untuk menyimpan data mahasiswa ke global state
    setProfilMahasiswa: (state, action: PayloadAction<Mahasiswa>) => {
      state.profile = action.payload;
    },
    // Action untuk menghapus data (misal saat logout)
    clearProfilMahasiswa: (state) => {
      state.profile = null;
    },
    // Action untuk mengatur status loading (opsional, berguna saat fetch API)
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }

   
  },
});

export const { setProfilMahasiswa, clearProfilMahasiswa, setLoading } = mahasiswaSlice.actions;
export default mahasiswaSlice.reducer;