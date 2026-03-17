import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Get current user ID
export const uid = () => auth().currentUser?.uid;

// Collections scoped to user
export const txCollection = () =>
  firestore().collection('users').doc(uid()).collection('transactions');

export const userDoc = () =>
  firestore().collection('users').doc(uid());

// Save a transaction
export async function saveTransaction(data: {
  name: string;
  amount: number;
  type: 'income' | 'expense';
  paymentType: 'MoMo' | 'Cash';
  network?: 'MTN' | 'Vodafone' | 'AirtelTigo';
  category: string;
  note?: string;
}) {
  return txCollection().add({
    ...data,
    createdAt: firestore.FieldValue.serverTimestamp(),
    source: 'manual',
  });
}

// Fetch recent transactions
export async function getRecentTransactions(limit = 10) {
  const snap = await txCollection()
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}