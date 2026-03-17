import {
  collection, addDoc, getDocs,
  query, orderBy, limit,
  serverTimestamp, doc, getDoc, setDoc,
} from 'firebase/firestore';
import { db, auth } from './firebase';

const uid = () => auth.currentUser?.uid;

export const userDocRef = () => doc(db, 'users', uid()!);
export const txColRef  = () => collection(db, 'users', uid()!, 'transactions');

export async function createUserIfNew(phone: string) {
  const ref  = userDocRef();
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      phone,
      displayName: '',
      createdAt: serverTimestamp(),
    });
  }
}

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

export async function getRecentTransactions(limitCount = 20) {
  const q    = query(txColRef(), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}