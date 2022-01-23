import { initializeApp, FirebaseApp } from "firebase/app";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { useEffect, useState } from "react";

export const useFirebase = () => {
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [firebaseStorage, setFirebaseStorage] =
    useState<FirebaseStorage | null>(null);

  useEffect(() => {
    if (firebaseApp) {
      return;
    }

    const app = initializeApp({
      apiKey: process.env.REACT_APP_API_KEY,
      authDomain: process.env.REACT_APP_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_PROJECT_ID,
      storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_APP_ID,
    });

    setFirebaseApp(app);
    setFirebaseStorage(getStorage(app));
  }, [firebaseApp]);

  return { firebaseApp, firebaseStorage };
};
