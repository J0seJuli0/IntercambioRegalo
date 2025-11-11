'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, Timestamp, serverTimestamp, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useDebouncedCallback } from 'use-debounce';

export function useTypingStatus() {
  const firestore = useFirestore();
  const { user } = useUser();
  const typingRef = collection(firestore, 'typingStatus');

  const updateTypingStatus = useDebouncedCallback(() => {
    if (!user) return;
    const userTypingRef = doc(typingRef, user.uid);
    setDoc(userTypingRef, {
      name: user.displayName || user.email,
      timestamp: serverTimestamp(),
    });

    // Automatically remove typing status after a few seconds
    setTimeout(() => {
      deleteDoc(userTypingRef);
    }, 3000); 
  }, 500);

  return { updateTypingStatus };
}


export default function TypingIndicator() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  useEffect(() => {
    const q = query(collection(firestore, 'typingStatus'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const typing: string[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Check if timestamp is recent (e.g., within last 5 seconds)
        if (data.timestamp && (now - data.timestamp.toDate().getTime()) < 5000) {
            if (doc.id !== user?.uid) { // Exclude current user
               typing.push(data.name || 'Alguien');
            }
        } else {
            // Clean up stale typing indicators
            deleteDoc(doc.ref);
        }
      });
      setTypingUsers(typing);
    });

    return () => unsubscribe();
  }, [firestore, user]);

  if (typingUsers.length === 0) {
    return <div className="h-5"></div>; // Placeholder to prevent layout shift
  }

  const message = typingUsers.length === 1 
    ? `${typingUsers[0]} está escribiendo...`
    : `${typingUsers.slice(0, 2).join(' y ')} están escribiendo...`;

  return (
    <div className="h-5 text-sm text-muted-foreground italic px-6 pb-1 animate-pulse">
      {message}
    </div>
  );
}
