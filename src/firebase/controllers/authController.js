import { auth } from "../config";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";
import profile from "./profile.controller";

async function buildUserPayload(user) {
    const payload = {
        id: user.uid,
        signed: true,
        perfil: null,
        token: user.accessToken,
        email: user.email,
    }

    try {
        const userProfile = await profile.getProfile(user.email)
        return { ...payload, perfil: userProfile }
    } catch {
        return payload
    }
}

function login(data) {
    return new Promise((resolve, reject) => {
        signInWithEmailAndPassword(auth, data.email, data.pwd)
            .then(async ({ user }) => {
                resolve(await buildUserPayload(user))
            })
            .catch((error) => {
                reject(error.code)
            });
    })
}

function signup(data) {
    return new Promise((resolve, reject) => {
        createUserWithEmailAndPassword(auth, data.email, data.pwd)
            .then(async ({ user }) => {
                resolve(await buildUserPayload(user))
            })
            .catch((error) => {
                reject(error.code)
            });
    })
}

function loginWithGoogle() {
    return new Promise((resolve, reject) => {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then(async ({ user }) => {
                resolve(await buildUserPayload(user))
            })
            .catch((error) => {
                reject(error)
            });
    })
}

function logout() {
    return signOut(auth)
}

function checkLoginStatus() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (u) => {
            if (u) {
                resolve(await buildUserPayload(u))
            }
            else { reject() }
        });
    })

}

export default {
    login,
    signup,
    loginWithGoogle,
    logout,
    checkLoginStatus
}
