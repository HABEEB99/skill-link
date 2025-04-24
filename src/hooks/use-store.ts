import { create } from "zustand";
import { supabase } from "../supabase-client";
import toast from "react-hot-toast";
import type { Session } from "@supabase/supabase-js";

interface StoreState {
  session: Session | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  session: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ session: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  },
  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ session, isLoading: false });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, isLoading: false });
      });
    } catch (error) {
      toast.error("Failed to initialize session");
      set({ isLoading: false });
    }
  },
}));
