import { auth } from "../config";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from "firebase/auth";
import profile from "./profile.controller";

function login(data) {
    return new Promise((resolve, reject) => {
        signInWithEmailAndPassword(auth, data.email, data.pwd)
            .then(async ({ user }) => {
                const payload = {
                    id: user.uid,
                    signed: true,
                    perfil: null,
                    token: user.accessToken,
                    email: user.email,
                }

                await profile.getProfile(user.email)
                    .then((userProfile) => {
                        console.log(userProfile)
                        resolve({ ...payload, perfil: userProfile })
                    })
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
                    email: u.email,
                }

                await profile.getProfile(u.email)
                    .then((perfil) => resolve({ ...payload, perfil }))
                    .catch(() => resolve(payload))
            }
            else { reject() }
        });
    })

}

export default {
    login, checkLoginStatus
}