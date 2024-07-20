import { db } from '../config'
import { getDoc, doc, updateDoc, addDoc, setDoc, collection } from 'firebase/firestore'

const dbPath = "programas";

export function createPeriod(payload, congregacionId) {
    return new Promise((resolve, reject) => {
        const docRef = addDoc(
            collection(db, dbPath),
            { ...payload, congregacion: congregacionId }
        ).catch(error => reject(error));
        resolve(docRef.id);
    })
}

export function updatePeriod(payload, id) {
    return new Promise((resolve, reject) => {
        updateDoc(doc(db, dbPath, id), payload)
            .then(res => resolve(res))
            .catch(error => reject(error));
    })
}