// hooks/useUserRole.js
import { useEffect, useState } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export function useUserRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsub = onSnapshot(doc(db, 'users', uid), (docSnap) => {
      if (docSnap.exists()) {
        setRole(docSnap.data().role);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { role, loading };
}
