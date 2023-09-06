import { atom } from "recoil";

export const userState = atom({
    key: 'userState',
    default: {
        congregacion: "",
        id:"",
        signed: false,
        perfil: null
    },
})

export const congregacionState = atom({
    key:'congregacionState',
    default: {
        nombre: '',
        ciudad: '',
        id: ''        
    }
})
