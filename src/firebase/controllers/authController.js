import { auth } from "../config";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from "firebase/auth";
import profile from "./profile.controller";
import toast from "react-hot-toast";

function login(data) {
    return new Promise(async (resolve, reject) => {
        await signInWithEmailAndPassword(auth, data.email, data.pwd)
            .then(async ({ user }) => {

                const payload = {
                    id: user.uid,
                    signed: true,
                    perfil: null,
                    token: user.accessToken,
                }

                await profile.getProfile(user.uid)
                    .then(( userProfile ) => 
                        resolve({ ...payload, perfil: userProfile }))
                    .catch(() => {
                        resolve(payload)
                    })
            })
            .catch((error) => {
                reject(error.code)
            });
    })
}

function checkLoginStatus() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (u) => {
            if (u) {
                const payload = {
                    id: u.uid,
                    signed: true,
                    perfil: null,
                    token: u.accessToken,
                }
                await profile.getProfile(u.uid)
                    .then(( perfil ) => resolve({ ...payload, perfil }))
                    .catch(() => resolve(payload))
            }
            else { reject() }
        });
    })

}

export default {
    login, checkLoginStatus
}