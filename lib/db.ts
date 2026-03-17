import {
  collection, addDoc, getDocs, query,
  orderBy, limit, serverTimestamp,
  doc, getDoc, setDoc, updateDoc,
  where, Timestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

export const uid = () => auth.currentUser?.uid;
export const userDocRef = () => doc(db, 'users', uid()!);
export const txColRef  = () => collection(db, 'users', uid()!, 'transactions');

// ── Create user on first login ──────────────────────────
export async function createUserIfNew(phone: string) {
  const ref  = userDocRef();
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      phone,
      displayName: '',
      avatarUrl: '',
      createdAt: serverTimestamp(),
    });
  }
}

// ── Get user profile ────────────────────────────────────
export async function getUserProfile() {
  const snap = await getDoc(userDocRef());
  return snap.exists() ? snap.data() : null;
}

// ── Update display name ─────────────────────────────────
export async function updateDisplayName(name: string) {
  await updateDoc(userDocRef(), { displayName: name });
}

// ── Save a transaction ──────────────────────────────────
export async function saveTransaction(data: {
  name: string;
  amount: number;
  type: 'income' | 'expense';
  paymentType: 'MoMo' | 'Cash';
  network?: 'MTN' | 'Vodafone' | 'AirtelTigo';
  category: string;
  note?: string;
}) {
  return addDoc(txColRef(), {
    ...data,
    createdAt: serverTimestamp(),
    source: 'manual',
  });
}

// ── Get recent transactions ─────────────────────────────
export async function getRecentTransactions(limitCount = 10) {
  const q    = query(txColRef(), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  }));
}

// ── Get all transactions for a month ───────────────────
export async function getMonthlyTransactions(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end   = new Date(year, month + 1, 0, 23, 59, 59);
  const q = query(
    txColRef(),
    where('createdAt', '>=', Timestamp.fromDate(start)),
    where('createdAt', '<=', Timestamp.fromDate(end)),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  }));
}

// ── Calculate balance summary ───────────────────────────
export function calcSummary(transactions: any[]) {
  let income  = 0;
  let expense = 0;
  let momoVol = 0;
  let cashVol = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income')  income  += tx.amount;
    if (tx.type === 'expense') expense += tx.amount;
    if (tx.paymentType === 'MoMo') momoVol += tx.amount;
    if (tx.paymentType === 'Cash') cashVol += tx.amount;
  });

  return {
    income,
    expense,
    balance: income - expense,
    momoVol,
    cashVol,
  };
}