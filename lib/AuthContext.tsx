import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getUserProfile } from "./db";

type User = {
  email: string;
  displayName?: string;
  photoURL?: string;
};

type Profile = {
  email: string;
  displayName: string;
  avatarUrl: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (user: User) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signIn: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already signed in (from AsyncStorage)
    const checkAuthState = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          // Load user profile
          getUserProfile()
            .then((data) => {
              setProfile(data as Profile);
            })
            .catch(() => {
              setProfile(null);
            });
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      }
      setLoading(false);
    };

    checkAuthState();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      try {
        const data = await getUserProfile();
        setProfile(data as Profile);
      } catch (error) {
        console.error("Failed to refresh profile:", error);
        setProfile(null);
      }
    }
  };

  const signIn = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem("user", JSON.stringify(userData));

    // Create or update user profile
    try {
      const data = await getUserProfile();
      setProfile(data as Profile);
    } catch (error) {
      console.error("Failed to load/create profile:", error);
      setProfile(null);
    }
  };

  const signOut = () => {
    setUser(null);
    setProfile(null);
    AsyncStorage.removeItem("user");
    // TODO: Clear Google OAuth session if needed
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, refreshProfile, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
