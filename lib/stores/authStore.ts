import { create } from 'zustand';

interface AuthState {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user ? { ...user, userId: user.sub ?? user.userId ?? user.id, permissions: user.permissions?.includes('*') ? user.permissions : [...(user.permissions || []), '*'] } : null }),
  initialize: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const user = JSON.parse(jsonPayload);
        set({ currentUser: { ...user, userId: user.sub ?? user.userId ?? user.id, permissions: user.permissions?.includes('*') ? user.permissions : [...(user.permissions || []), '*'] } });
      } catch (e) {
        console.error('Invalid token', e);
      }
    }
  }
}));
