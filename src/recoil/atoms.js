import { atom } from "recoil";

export const user = atom({
    key: 'userState',
    default: null
})

export const congregacion = atom({
    key:'congregacionState',
    default: null
})

export const matriculados = atom({
    key:'matriculadosState',
    default: null
})

export const periodos = atom({
    key:'periodosState',
    default: null
})

export const nombrados = atom({
    key:'nombradosState',
    default: null
})


export default {
    user, congregacion, matriculados, periodos, nombrados
}