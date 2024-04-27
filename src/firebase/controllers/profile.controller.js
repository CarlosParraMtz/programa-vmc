import { db } from "../config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function getProfile(userId) {
  return new Promise((resolve, reject) => {
    const docRef = doc(db, "usuarios", userId)
    getDoc(docRef)
      .then(docSnap => {
        if (docSnap.exists()) {
          resolve(docSnap.data());
        } else {
          reject()
        }
      })
  })
}

export function setProfile(payload, userId) {
  return new Promise((resolve, reject) => {
    setDoc(doc(db, 'usuarios', userId), payload, { merge: true })
      .then((res) => { resolve(res) })
      .catch(e => reject(e))
  })
}

export default { getProfile, setProfile }