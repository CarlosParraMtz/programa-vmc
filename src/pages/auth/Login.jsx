import { useState } from 'react'
import auth from '../../firebase/controllers/authController';
import { useSetAtom } from 'jotai';
import atoms from '../../jotai/atoms';
import { Link, useNavigate } from 'react-router-dom';
import toast from '../../functions/toast';

export default function Login() {

	const setUser = useSetAtom(atoms.user) // User's global state
	const [form, setForm] = useState({ email: "", pwd: "" });
	const [loading, setLoading] = useState(false)
	const [googleLoading, setGoogleLoading] = useState(false)
	const [onError, setOnError] = useState(null)
	const navigate = useNavigate()

	const goLogin = async (e) => {
		e.preventDefault();
		setLoading(true)
		await auth.login(form)
			.then((res) => {
				setUser(res)
				navigate("/dashboard")
				setOnError(null)
			})
			.catch(e => {
				setOnError(e)
				let textoError;
				switch (e) {
					case 'auth/user-not-found':
						textoError = 'Usuario no encontrado'
						break;
					case 'auth/wrong-password':
						textoError = 'La contrasena es incorrecta'
						break;
					default:
						textoError = 'Ha ocurrido un error al iniciar sesion'
						break;
				}
				toast.error(textoError)
			})
		setLoading(false)
	}

	const goGoogleLogin = async () => {
		setGoogleLoading(true)
		await auth.loginWithGoogle()
			.then((res) => {
				setUser(res)
				navigate("/dashboard")
				setOnError(null)
			})
			.catch(() => {
				toast.error('No se pudo iniciar sesion con Google')
			})
		setGoogleLoading(false)
	}

	return (
		<div className="login-panel flex flex-col gap-5 w-full max-w-sm">
			<div className="login-panel__header">
				<span className="login-panel__badge">VMC</span>
				<p>Acceso privado</p>
				<h1>Bienvenido de nuevo</h1>
				<span>Continua preparando el programa de tu congregacion.</span>
			</div>
			<form onSubmit={goLogin} className='flex flex-col gap-5 w-full' >
				<div
					className={`input-component ${onError === "auth/user-not-found"
						? "error-state"
						: null
						}`}
				>
					<label htmlFor="login-email">Correo electronico</label>
					<input
						id="login-email"
						type="email"
						value={form.email}
						onChange={e => setForm({ ...form, email: e.target.value })}
						placeholder='tu-correo@ejemplo.com'
						autoComplete="email"
						required
					/>
					{onError === "auth/user-not-found" && <small>Usuario no encontrado</small>}
				</div>
				<div className={`input-component ${onError === "auth/wrong-password"
					? "error-state"
					: null} `}
				>
					<label htmlFor="login-password">Contrasena</label>
					<input
						id="login-password"
						type="password"
						value={form.pwd}
						onChange={e => setForm({ ...form, pwd: e.target.value })}
						placeholder='Escribe tu contrasena'
						autoComplete="current-password"
						required
					/>
					{onError === "auth/wrong-password" && <small>Contrasena incorrecta</small>}
				</div>
				<button type='submit' className="btn main login-panel__submit" disabled={loading} >
					{loading ? "Iniciando..." : "Iniciar sesion"}
				</button>
			</form>
			<p className="login-panel__switch">
				No tienes cuenta? <Link to="/signup">Registrate</Link>
			</p>
			<div className="login-panel__divider">
				<span></span>
				<p>O</p>
				<span></span>
			</div>
			<button
				type="button"
				className="login-panel__google"
				disabled={googleLoading}
				onClick={goGoogleLogin}
			>
				<span>G</span>
				{googleLoading ? "Conectando..." : "Iniciar sesion con Google"}
			</button>
			<Link to="/" className="login-panel__home-link">Volver al inicio</Link>
		</div>
	)
}
