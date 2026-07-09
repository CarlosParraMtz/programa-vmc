import { auth } from "../config";
import {
    createUserWithEmailAndPassword,
    getRedirectResult,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
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
        const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

        if (isLocalhost) {
            signInWithPopup(auth, provider)
                .then(async ({ user }) => {
                    resolve(await buildUserPayload(user))
                })
                .catch((error) => {
                    reject(error)
                });
            return
        }

        signInWithRedirect(auth, provider)
            .then(() => {
                resolve(null)
            })
            .catch((error) => {
                reject(error)
            });
    })
}

function getGoogleRedirectResult() {
    return new Promise((resolve, reject) => {
        getRedirectResult(auth)
            .then(async (result) => {
                if (!result?.user) {
                    resolve(null)
                    return
                }

                resolve(await buildUserPayload(result.user))
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
    getGoogleRedirectResult,
    logout,
    checkLoginStatus
}
