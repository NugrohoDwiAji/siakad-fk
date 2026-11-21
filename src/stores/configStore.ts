import { configureStore } from "@reduxjs/toolkit";
import mahasiswaReducer from "@/features/mahasiswa/store/mahasiswaSlice";
import adminReducer from "@/features/admin/store/adminSlice";

export const store = configureStore({
  reducer: {
    mahasiswa: mahasiswaReducer,
    admin: adminReducer,
  },
});

// Setup tipe untuk TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;