import { atom } from "recoil";

export const user = atom({
    key: 'userState',
    default: {
        congregacion: '',
        id: '',
        signed: false,
        perfil: null,
        token: '',
    },
})

export const congregacion = atom({
    key:'congregacionState',
    default: {
        nombre: '',
        ciudad: '',
        id: ''        
    }
})


export default {
    user, congregacion
}