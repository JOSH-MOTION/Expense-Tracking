import AsyncStorage from "@react-native-async-storage/async-storage";
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

// TODO: Replace with actual user ID from Google OAuth
export const uid = async () => {
  // For now, return a placeholder or get from Google OAuth response
  // You'll need to store user ID after Google sign-in
  const userId = await AsyncStorage.getItem("userId");
  return userId || "temp-user-id";
};

export const userDocRef = async () => {
  const userId = await uid();
  return doc(db, "users", userId);
};

export const txColRef = async () => {
  const userId = await uid();
  return collection(db, "users", userId, "transactions");
};

// ── Create user on first login ──────────────────────────
export async function createUserIfNew(phone: string) {
  const ref = await userDocRef();
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      phone,
      displayName: "",
      avatarUrl: "",
      createdAt: serverTimestamp(),
    });
  }
}

// ── Get user profile ────────────────────────────────────
export async function getUserProfile() {
  const ref = await userDocRef();
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// ── Update display name ─────────────────────────────────
export async function updateDisplayName(name: string) {
  const ref = await userDocRef();
  await updateDoc(ref, { displayName: name });
}

// ── Save a transaction ──────────────────────────────────
export async function saveTransaction(data: {
  name: string;
  amount: number;
  type: "income" | "expense";
  paymentType: "MoMo" | "Cash";
  network?: "MTN" | "Vodafone" | "AirtelTigo";
  category: string;
  note?: string;
}) {
  const colRef = await txColRef();
  return addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    source: "manual",
  });
}

// ── Get recent transactions ─────────────────────────────
export async function getRecentTransactions(limitCount = 10) {
  const colRef = await txColRef();
  const q = query(colRef, orderBy("createdAt", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ── Get all transactions for a month ───────────────────
export async function getMonthlyTransactions(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  const colRef = await txColRef();
  const q = query(
    colRef,
    where("createdAt", ">=", Timestamp.fromDate(start)),
    where("createdAt", "<=", Timestamp.fromDate(end)),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ── Calculate balance summary ───────────────────────────
export function calcSummary(transactions: any[]) {
  let income = 0;
  let expense = 0;
  let momoVol = 0;
  let cashVol = 0;

  transactions.forEach((tx) => {
    if (tx.type === "income") income += tx.amount;
    if (tx.type === "expense") expense += tx.amount;
    if (tx.paymentType === "MoMo") momoVol += tx.amount;
    if (tx.paymentType === "Cash") cashVol += tx.amount;
  });

  return {
    income,
    expense,
    balance: income - expense,
    momoVol,
    cashVol,
  };
}
