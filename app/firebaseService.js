import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import app from './firebaseConfig';

const db = getFirestore(app);

/**
 * Firestore에서 작품 데이터를 가져오는 함수
 * @param {string} [category] - 카테고리 필터 (선택 사항)
 * @returns {Promise<Array>} 작품 데이터의 배열을 반환하는 Promise
 */
export const fetchArtworks = async (category = null) => {
  try {
    let q;
    if (category) {
      // 특정 카테고리의 작품만 가져오기 위한 쿼리
      q = query(collection(db, "artworks"), where("category", "==", category));
    } else {
      // 전체 작품 가져오기
      q = collection(db, "artworks");
    }

    const querySnapshot = await getDocs(q);
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
