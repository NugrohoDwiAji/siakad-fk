import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StafUser } from "@/features/auth/stafTypes";

interface AdminState {
  profile: StafUser | null;
  isLoading: boolean;
}

const initialState: AdminState = {
  profile: null,
  isLoading: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setProfilAdmin: (state, action: PayloadAction<StafUser>) => {
      state.profile = action.payload;
    },
    clearProfilAdmin: (state) => {
      state.profile = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setProfilAdmin, clearProfilAdmin, setLoading } = adminSlice.actions;
export default adminSlice.reducer;
