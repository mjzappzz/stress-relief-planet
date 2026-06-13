import { create } from "zustand";

const useStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  activities: [],
  stressLevel: 5,
  stats: { today: {}, allTime: {}, topActivities: [] },

  login: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user });
  },
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },
  clearUser: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
  setActivities: (activities) => set({ activities }),
  setStressLevel: (level) => set({ stressLevel: level }),
  setStats: (stats) => set({ stats })
}));

export default useStore;
