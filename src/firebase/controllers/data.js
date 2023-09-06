import { db } from "../config";
import { doc, getDoc } from "firebase/firestore";

export function getProfile(userId) {
    return new Promise(async (resolve, reject) => {
        const docRef = doc(db, "usuarios", userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            resolve( docSnap.data() );
          } else {
            reject("Profile not found")
          }
    })
}