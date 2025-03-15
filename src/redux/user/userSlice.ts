import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/user";

interface UserState {
  currentUser: User | null;
}

const initialState: UserState = {
  currentUser: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload; // Now can accept 'null' safely
    },
    clearUser: (state) => {
      state.currentUser = null;
    },
  },
});


export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
