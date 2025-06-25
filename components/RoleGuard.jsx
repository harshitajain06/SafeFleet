import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { View, ActivityIndicator } from 'react-native';

export default function RoleGuard({ children, allowedRoles }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return setAllowed(false);
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      const role = docSnap.data()?.role;
      setAllowed(allowedRoles.includes(role));
    });

    return () => unsub();
  }, []);

  if (allowed === null) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return allowed ? children : <View><Text>Not authorized</Text></View>;
}
