"use client";
import { db } from "@/config/firebase.config";
import { collection, getDocs } from "firebase/firestore";
import { useEffect } from "react";

export default function FeedClient() {
  const handleFetch = async () => {
    const querySnapshot = await getDocs(collection(db, "tutorials"));
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
    });
  };

  handleFetch();
  return <main></main>;
}
