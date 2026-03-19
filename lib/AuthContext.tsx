import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { createUserIfNew, getUserProfile } from "./db";
import { auth } from "./firebase";

type User = {
  email: string;
  displayName?: string;
  photoURL?: string;
  uid: string;
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
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isFirstTimeUser: () => Promise<boolean>;
  markUserAsReturning: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signIn: async () => {},
  signInWithEmail: async () => false,
  registerWithEmail: async () => {},
  signOut: () => {},
  isFirstTimeUser: async () => true,
  markUserAsReturning: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || "",
        };
        setUser(userData);
        await AsyncStorage.setItem("userId", firebaseUser.uid);
        try {
          const data = await getUserProfile();
          setProfile(data as Profile);
        } catch {
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data as Profile);
    } catch {
      setProfile(null);
    }
  };

  const signIn = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem("userId", userData.uid);
    try {
      const data = await getUserProfile();
      setProfile(data as Profile);
    } catch {
      setProfile(null);
    }
  };

  // Returns true if profile is incomplete (new user needs setup)
  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await AsyncStorage.setItem("userId", cred.user.uid);
    const data = (await getUserProfile()) as Profile | null;
    setProfile(data);
    const isNewUser =
      !data?.displayName ||
      data.displayName === "" ||
      data.displayName === "User";
    return isNewUser;
  };

  const registerWithEmail = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await AsyncStorage.setItem("userId", cred.user.uid);
    await createUserIfNew(email);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("user");
  };

  const isFirstTimeUser = async (): Promise<boolean> => {
    const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
    return hasSeenOnboarding === null;
  };

  const markUserAsReturning = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        refreshProfile,
        signIn,
        signInWithEmail,
        registerWithEmail,
        signOut,
        isFirstTimeUser,
        markUserAsReturning,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
