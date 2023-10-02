import { db } from "../config";
import { doc, getDoc, setDoc } from "firebase/firestore";

function getProfile(userId) {
    return new Promise(async (resolve, reject) => {
        const docRef = doc(db, "usuarios", userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            resolve( docSnap.data() );
          } else {
            reject()
          }
    })
}

function setProfile(payload, userId ) {
  return new Promise(async (resolve, reject)=>{
    try {
      await setDoc(doc(db, 'usuarios', userId), payload)
        .then((res)=>{resolve(res)})
    }
    catch(e) {
      reject(e)
    }
  })
}

export default { getProfile, setProfile }