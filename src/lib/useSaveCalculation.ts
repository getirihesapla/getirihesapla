import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

export function useSaveCalculation() {
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const saveCalculation = async (type: string, inputsSummary: string, resultValue: string) => {
    setIsSaving(true);
    try {
      if (user) {
        const historyRef = collection(db, "users", user.uid, "history");
        await addDoc(historyRef, {
          type,
          inputsSummary,
          resultValue,
          createdAt: serverTimestamp(),
        });
      } else {
        const localHistory = JSON.parse(localStorage.getItem('korfu_history') || '[]');
        const newItem = {
          id: Date.now().toString(),
          type,
          inputsSummary,
          resultValue,
          createdAt: new Date().toISOString(),
        };
        localHistory.unshift(newItem);
        localStorage.setItem('korfu_history', JSON.stringify(localHistory.slice(0, 50)));
      }
      window.dispatchEvent(new Event('history_updated'));
    } catch (error) {
      console.error("Kaydetme hatası:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return { saveCalculation, isSaving, user };
}
