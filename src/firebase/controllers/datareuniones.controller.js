import { db } from '../config'
import { doc, updateDoc, addDoc, collection, deleteDoc, query, where, getDocs } from 'firebase/firestore'
import getLunesAnterior from '../../functions/getLunesAnterior';
import { fromZonedTime } from 'date-fns-tz'

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
        console.log("Lunes anterior:", fromZonedTime(lunes))
        const q = query(collection(db, dbPath), where("fecha", "==", fromZonedTime(lunes)));
        let data = null;
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const snap = doc.data()
            data = { ...snap, fecha: new Date(snap.fecha.seconds * 1000) }
        });
        console.log(data)
        return data;
    },

    getDataReuniones: async (rangoFechas) => {
        const { inicial, final } = rangoFechas;
        const lunesInicial = getLunesAnterior(inicial)
        const lunesFinal = getLunesAnterior(final)
        const q = query(collection(db, dbPath), where("fecha", ">=", fromZonedTime(lunesInicial)), where("fecha", "<=", fromZonedTime(lunesFinal)));
        let data = [];
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const snap = doc.data();
            data.push({ ...snap, fecha: new Date(snap.fecha.seconds * 1000) });
        });
        return data;
    }

}