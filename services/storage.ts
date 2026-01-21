
import { UserProfile } from '../types';

const USER_KEY = 'pwa_user_profile';

export const storageService = {
  saveUser: (user: UserProfile): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: (): UserProfile | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  clearUser: (): void => {
    localStorage.removeItem(USER_KEY);
  }
};
