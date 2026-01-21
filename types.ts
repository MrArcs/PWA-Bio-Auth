
export interface UserProfile {
  username: string;
  credentialId: string;
  publicKey: string;
  createdAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
}

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
}
