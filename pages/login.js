import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Typography from '@mui/material/Typography'
import {
	Box,
	Button,
} from '@mui/material/';
import Link from 'next/link';
import Router from 'next/router';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";

import {
	getFirestore,
} from "firebase/firestore";
import firebaseApp from '../firebase/config';
import { useRecoilState } from 'recoil';
import userState from '../Recoil/userState';
import matriculadosState from '../Recoil/matriculadosState';
import familiasState from '../Recoil/familiasState';
import { useState, useEffect } from 'react'

import descargarMatriculados from '../firebase/descargarMatriculados';
import descargarFamilias from '../firebase/descargarFamilias'

import comprobarConfigUsuario from '../firebase/comprobarConfigUsuario'



const BotonGoogle = ({ onClick }) => <Button
	size="large"
	variant="outlined"
	onClick={onClick}
	startIcon={<Image src="/g-login.png" width={25} height={25} />}
	sx={{
		padding: 2,
		border: "solid 1px #ccc",
		color: "#ddd",
		"&:hover": {
			border: "solid 1px white",
			color: "white",
			background: "RGBA(255, 255, 255, 0.1)"
		}
	}}
>
	Ingresar con google
</Button>




export default function Login() {

	const auth = getAuth(firebaseApp);
	const googleProvider = new GoogleAuthProvider();

	const [cargando, setCargando] = useState(false);
	const [user, setUser] = useRecoilState(userState);
	const [matriculados, setMatriculados] = useRecoilState(matriculadosState);
	const [familias, setFamilias] = useRecoilState(familiasState);



	async function checarLogin() {
		const auth = getAuth()
		await onAuthStateChanged(auth, async (usuario) => {
			if (usuario) {

				let dataCong;
				const congreLS = localStorage.getItem('user/congregacion')
				if (congreLS) { dataCong = JSON.parse(congreLS); }
				else { dataCong = await comprobarConfigUsuario(usuario.email) }

				const newSesion = {
					logeado: true,
					uid: usuario.uid,
					data: {
						config: {},
						congregacion: dataCong
					},
					nombre: usuario.displayName,
					email: usuario.email
				}
				setUser(newSesion)

				if (newSesion.data.congregacion.nombre === '') {
					Router.push('/nuevo-usuario')
				} else {
					const matr = await descargarMatriculados(newSesion.data.congregacion.id)
					const fams = await descargarFamilias(newSesion.data.congregacion.id)
					setMatriculados(matr)
					setFamilias(fams)
					Router.push('/')
				}
			}
		})

	}

	useEffect(() => { checarLogin() }, [])



	const login = async () => {
		setCargando(true)
		await signInWithPopup(auth, googleProvider)
			.then(async (result) => {
				const datosUsuario = result.user;

				let dataCong;
				const congreLS = localStorage.getItem('user/congregacion')
				if (congreLS) { dataCong = JSON.parse(congreLS) }
				else { dataCong = await comprobarConfigUsuario(datosUsuario.email) }

				const usuario = {
					logeado: true,
					uid: datosUsuario.uid,
					data: {
						config: {},
						congregacion: dataCong
					},
					nombre: datosUsuario.displayName,
					email: datosUsuario.email
				}
				setUser(usuario);

				if (usuario.data.congregacion.nombre === '') {
					Router.push('/nuevo-usuario')
				} else {
					const matr = await descargarMatriculados(usuario.data.congregacion.id)
					const fams = await descargarFamilias(usuario.data.congregacion.id)
					setMatriculados(matr)
					setFamilias(fams)
					Router.push('/')
				}



			})
		setCargando(false)
	}




	return (
		<div className={styles.container}>
			<div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#5b3c88", zIndex: "-1" }} />



			<main className={styles.main}>
				<Typography variant="h3" sx={{ color: "white", fontFamily: "sans", mb: 2 }}>
					<b>Bienvenido</b>
				</Typography>

				<BotonGoogle onClick={login} />

				<Typography
					sx={{
						width: "90%",
						maxWidth: "700px",
						mt: 2,
						textAlign: "center",
						color: "white",
					}}
					variant="h6" >
					Para poder acceder al generador autom??tico de asignaciones para la reuni??n Vida y Ministerio Cristianos,
					inicie sesi??n con su cuenta de google. Al hacerlo, confirma que est?? de acuerdo con las condiciones de uso.
				</Typography>


			</main>

			<footer style={{
				background: "#222",
				position: "fixed",
				bottom: 0,
				left: 0,
				width: "100%",
				padding: "10px"
			}} >

				<Box sx={{
					margin: "0 auto",
					maxWidth: "200px",
					textAlign: "center",
				}} >
					<Link href="/condiciones" >
						<a className={styles.btnCondiciones}>
							Condiciones de uso
						</a>
					</Link>
				</Box>
			</footer>

		</div>
	)
}

