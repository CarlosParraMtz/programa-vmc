import { db } from '../config'
import { doc, updateDoc, addDoc, collection, serverTimestamp, deleteDoc } from 'firebase/firestore'

const dbPath = "matriculados";

export default {
    createMatriculado: (payload, congregacionId) => {
        return new Promise((resolve, reject) => {
            addDoc(
                collection(db, `congregaciones/${congregacionId}/${dbPath}`),
                { ...payload, created: serverTimestamp() }
            ).then(docRef => resolve(docRef.id))
            .catch(error => reject(error));
        })
    },

    updateMatriculado: (payload, congregacionId, id) => {
        return new Promise((resolve, reject) => {
            updateDoc(doc(db, `congregaciones/${congregacionId}/${dbPath}`, id),
                { ...payload, updated: serverTimestamp()}
            ).then(res => resolve(res))
            .catch(error => reject(error));
        })
    },

    deleteMatriculado: (id, congregacionId) => {
        return deleteDoc(doc(db, `congregaciones/${congregacionId}/${dbPath}`, id))
    }

}
