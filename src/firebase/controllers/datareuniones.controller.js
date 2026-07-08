import { db } from '../config'
import { doc, updateDoc, addDoc, collection, deleteDoc, query, where, getDocs, orderBy } from 'firebase/firestore'
import getLunesAnterior from '../../functions/getLunesAnterior';
import getDia from '../../functions/getDia';

const dbPath = "data-reuniones";

function getFechaSemana(fecha) {
    const lunes = getLunesAnterior(fecha);
    return getDia(lunes);
}

function getFechaFinSemana(fecha) {
    const lunes = getLunesAnterior(fecha);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return getDia(domingo);
}

function normalizeDataReunion(payload) {
    if (!payload?.fecha) return { ...payload };
    return {
        ...payload,
        fecha: getFechaSemana(payload.fecha),
    };
}

async function getDataReunionPorFecha(fecha) {
    const q = query(collection(db, dbPath), where("fecha", "==", fecha));
    let data = null;
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const snap = doc.data()
        data = { ...snap, id: doc.id }
    });
    return data;
}

async function getDataReunionEnSemana(fecha) {
    const fechaInicial = getFechaSemana(fecha);
    const fechaFinal = getFechaFinSemana(fecha);
    const q = query(
        collection(db, dbPath),
        where("fecha", ">=", fechaInicial),
        where("fecha", "<=", fechaFinal),
        orderBy("fecha", "asc")
    );
    let data = null;
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        if (data) return;
        const snap = doc.data()
        data = { ...snap, id: doc.id }
    });
    return data;
}

export default {
    createDataReunion: (payload) => {
        return new Promise((resolve, reject) => {
            addDoc(
                collection(db, `/${dbPath}`),
                normalizeDataReunion(payload)
            ).then(docRef => resolve(docRef.id))
            .catch(error => reject(error));
        })
    },

    updateDataReunion: (payload, id) => {
        return new Promise((resolve, reject) => {
            updateDoc(doc(db, dbPath, id),
                normalizeDataReunion(payload)
            ).then(res => resolve(res))
                .catch(error => reject(error));
        })
    },

    deleteReunion: (id) => {
        return deleteDoc(doc(db, dbPath, id))
    },

    getAllDataReuniones: async () => {
        const q = query(collection(db, dbPath), orderBy("fecha", "asc"));
        const data = [];
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            data.push({ ...doc.data(), id: doc.id });
        });
        return data;
    },

    getDataReunion: async (fecha) => {
        const fechaSemana = getFechaSemana(fecha);
        const data = await getDataReunionPorFecha(fechaSemana);
        if (data) return data;

        return getDataReunionEnSemana(fecha);
    },

    getDataReuniones: async (rangoFechas) => {
        const { inicial, final } = rangoFechas;
        const fechaInicial = getFechaSemana(inicial)
        const fechaFinal = getFechaFinSemana(final)
        const q = query(
            collection(db, dbPath),
            where("fecha", ">=", fechaInicial),
            where("fecha", "<=", fechaFinal)
        );
        let data = [];
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const snap = doc.data();
            data.push({ ...snap, id: doc.id });
        });
        return data;
    }

}
