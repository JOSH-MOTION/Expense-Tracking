import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// Always get UID from Firebase Auth first, fallback to AsyncStorage
export const uid = async (): Promise<string> => {
  const auth = getAuth();
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }
  const stored = await AsyncStorage.getItem("userId");
  return stored || "temp-user-id";
};

export const userDocRef = async () => {
  const userId = await uid();
  return doc(db, "users", userId);
};

export const txColRef = async () => {
  const userId = await uid();
  return collection(db, "users", userId, "transactions");
};

export async function createUserIfNew(email: string, displayName?: string, avatarUrl?: string) {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("No authenticated user");

  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      displayName: displayName || "",
      avatarUrl: avatarUrl || "",
      createdAt: serverTimestamp(),
    });
  }
  await AsyncStorage.setItem("userId", userId);
}

export async function getUserProfile() {
  const snap = await getDoc(await userDocRef());
  return snap.exists() ? snap.data() : null;
}

export async function updateDisplayName(name: string) {
  await updateDoc(await userDocRef(), { displayName: name });
}

export async function updateUserAvatar(url: string) {
  await updateDoc(await userDocRef(), { avatarUrl: url });
}

export async function saveTransaction(data: {
  name: string;
  amount: number;
  type: "income" | "expense";
  paymentType: "MoMo" | "Cash";
  network?: "MTN" | "Vodafone" | "AirtelTigo";
  category: string;
  note?: string;
}) {
  return addDoc(await txColRef(), {
    ...data,
    createdAt: serverTimestamp(),
    source: "manual",
  });
}

export async function getRecentTransactions(limitCount = 10) {
  const q = query(
    await txColRef(),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  }));
}

export async function getMonthlyTransactions(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  const q = query(
    await txColRef(),
    where("createdAt", ">=", Timestamp.fromDate(start)),
    where("createdAt", "<=", Timestamp.fromDate(end)),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  }));
}

export function calcSummary(transactions: any[]) {
  let income = 0, expense = 0, momoVol = 0, cashVol = 0;
  transactions.forEach((tx) => {
    if (tx.type === "income") income += tx.amount;
    if (tx.type === "expense") expense += tx.amount;
    if (tx.paymentType === "MoMo") momoVol += tx.amount;
    if (tx.paymentType === "Cash") cashVol += tx.amount;
  });
  return { income, expense, balance: income - expense, momoVol, cashVol };
}