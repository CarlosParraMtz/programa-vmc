import { atom } from "jotai";

export const user = atom(null)

export const congregacion = atom(null)

export const matriculados = atom(null)

export const programas = atom(null)

export const nombrados = atom(null)

export const periodo = atom(null)

export const reuniones = atom([])

export const modal = atom({
        isOpen: false,
        variant: 'success',
        icon: 'info',
        title: '',
        text: '',
        textButton: 'OK',
        textButton2: null,
        onConfirm: () => { },
        skipClose: false,
})

export default {
    user, congregacion, matriculados,
    programas, nombrados, periodo, reuniones
}