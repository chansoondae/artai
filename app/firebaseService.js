// app/firebaseService.js

import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from './firebaseConfig';

const db = getFirestore(app);

/**
 * Firestore에서 모든 작품 데이터를 가져오는 함수
 * @returns {Promise<Array>} 작품 데이터의 배열을 반환하는 Promise
 */
export const fetchArtworks = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "artworks"));
    const artworksData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return artworksData;
  } catch (error) {
    console.error("Error fetching artworks:", error);
    return [];
  }
};
