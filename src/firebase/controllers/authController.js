import { auth } from "../config";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from "firebase/auth";
import { getProfile } from "./data";

export function login(data) {
    return new Promise(async (resolve, reject) => {
        await signInWithEmailAndPassword(auth, data.email, data.pwd)
            .then(async ({ user }) => {
                await getProfile(user.uid)
                    .then(( { perfil, congregacion } ) => 
                        resolve({ ...user, congregacion, perfil }))
                    .catch(() => resolve(user))
            })
            .catch((error) => {
                reject(error.code)
            });
    })
}

export function checkLoginStatus() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (u) => {
            if (u) {
                await getProfile(u.uid)
                    .then(( { perfil, congregacion } ) => 
                        resolve({ ...u, congregacion, perfil }))
                    .catch(() => resolve(u))
            }
            else { reject(u) }
        });
    })

}