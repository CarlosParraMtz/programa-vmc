import { db } from '../config'
import { doc, updateDoc, addDoc, collection, deleteDoc, query, where, getDocs } from 'firebase/firestore'
import getLunesAnterior from '../../functions/getLunesAnterior';
import getDia from '../../functions/getDia';

const dbPath = "data-reuniones";

export default {
    createDataReunion: (payload) => {
        return new Promise((resolve, reject) => {
            const docRef = addDoc(
                collection(db, `/${dbPath}`),
                { ...payload }
            ).catch(error => reject(error));
            resolve(docRef.id);
        })
    },

    updateDataReunion: (payload, id) => {
        return new Promise((resolve, reject) => {
            updateDoc(doc(db, dbPath, id),
                { ...payload }
            ).then(res => resolve(res))
                .catch(error => reject(error));
        })
    },

    deleteReunion: (id) => {
        return deleteDoc(doc(db, dbPath, id))
    },

    getDataReunion: async (fecha) => {
        const lunes = getLunesAnterior(fecha)
        console.log("Lunes anterior:", getDia(lunes))
        const q = query(collection(db, dbPath), where("fecha", "==", getDia(lunes)));
        let data = null;
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const snap = doc.data()
            data = { ...snap }
        });
        return data;
    },

    getDataReuniones: async (rangoFechas) => {
        const { inicial, final } = rangoFechas;
        const lunesInicial = getLunesAnterior(inicial)
        const lunesFinal = getLunesAnterior(final)
        const q = query(
            collection(db, dbPath),
            where("fecha", ">=", getDia(lunesInicial)),
            where("fecha", "<=", getDia(lunesFinal))
        );
        let data = [];
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const snap = doc.data();
            data.push({ ...snap });
        });
        return data;
    }

}