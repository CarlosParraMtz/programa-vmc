import { db } from "../config";
import { doc, setDoc, collection, getDoc } from "firebase/firestore";
import { setProfile } from "./profile.controller";


export function getCongregacion(congregacionId) {
    return new Promise((resolve, reject) => {
      const docRef = doc(db, "congregaciones", congregacionId)
      getDoc(docRef)
        .then(docSnap => {
          if (docSnap.exists()) {
            const payload = docSnap.data()
            resolve({...payload, id: congregacionId});
          } else {
            reject()
          }
        })
    })
  }

export function setCongregacion(payload, userId, congregacionId = null) {
    return new Promise((resolve, reject) => {
        const congregacionRef = congregacionId
            ? doc(db, "congregaciones", congregacionId)
            : doc(collection(db, 'congregaciones'))
        setDoc(congregacionRef, payload)
            .then(async () => {
                await setProfile({ congregacion: congregacionRef.id }, userId)
                resolve({ ...payload, id: congregacionRef.id })
            })
            .catch(e => reject(e))
    })
}

export default { getCongregacion, setCongregacion }