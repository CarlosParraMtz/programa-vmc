import { atom } from "recoil";

export const user = atom({
    key: 'userState',
    default: null
})

export const congregacion = atom({
    key: 'congregacionState',
    default: null
})

export const matriculados = atom({
    key: 'matriculadosState',
    default: null
})

export const programas = atom({
    key: 'programasState',
    default: null
})

export const nombrados = atom({
    key: 'nombradosState',
    default: null
})

export const periodo = atom({
    key: 'periodoState',
    default: null
})

export const reuniones = atom({
    key: 'reunionesState',
    default: []
})

export const modal = atom({
    key: 'modalState',
    default: {
        isOpen: false,
        variant: 'success',
        icon: 'info',
        title: '',
        text: '',
        textButton: 'OK',
        textButton2: null,
        onConfirm: () => { },
        skipClose: false,
    }
})

export default {
    user, congregacion, matriculados,
    programas, nombrados, periodo, reuniones
}