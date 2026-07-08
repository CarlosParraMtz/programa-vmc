import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import atoms from '../../jotai/atoms';
import auth from '../../firebase/controllers/authController';
import toast from '../../functions/toast';

export default function Signup() {

	const setUser = useSetAtom(atoms.user)
	const [form, setForm] = useState({ email: "", pwd: "", confirmPwd: "" });
	const [loading, setLoading] = useState(false)
	const [onError, setOnError] = useState(null)
	const navigate = useNavigate()

	const goSignup = async (e) => {
		e.preventDefault();

		if (form.pwd !== form.confirmPwd) {
			setOnError('password-mismatch')
			toast.error('Las contrasenas no coinciden')
			return;
		}

		setLoading(true)
		await auth.signup(form)
			.then((res) => {
				setUser(res)
				navigate("/dashboard")
				setOnError(null)
			})
			.catch(e => {
				setOnError(e)
				let textoError;
				switch (e) {
					case 'auth/email-already-in-use':
						textoError = 'Ese correo ya tiene una cuenta'
						break;
					case 'auth/weak-password':
						textoError = 'La contrasena debe tener al menos 6 caracteres'
						break;
					case 'auth/invalid-email':
						textoError = 'El correo no es valido'
						break;
					default:
						textoError = 'Ha ocurrido un error al crear la cuenta'
						break;
				}
				toast.error(textoError)
			})
		setLoading(false)
	}

	return (
		<div className="login-panel flex flex-col gap-5 w-full max-w-sm">
			<div className="login-panel__header">
				<span className="login-panel__badge">VMC</span>
				<p>Crear cuenta</p>
				<h1>Empieza tu programa</h1>
				<span>Registrate para administrar reuniones y asignaciones.</span>
			</div>
			<form onSubmit={goSignup} className='flex flex-col gap-5 w-full' >
				<div
					className={`input-component ${onError === "auth/email-already-in-use" || onError === "auth/invalid-email"
						? "error-state"
						: null
						}`}
				>
					<label htmlFor="signup-email">Correo electronico</label>
					<input
						id="signup-email"
						type="email"
						value={form.email}
						onChange={e => setForm({ ...form, email: e.target.value })}
						placeholder='tu-correo@ejemplo.com'
						autoComplete="email"
						required
					/>
					{onError === "auth/email-already-in-use" && <small>Ese correo ya esta registrado</small>}
					{onError === "auth/invalid-email" && <small>Correo no valido</small>}
				</div>
				<div className={`input-component ${onError === "auth/weak-password" || onError === "password-mismatch"
					? "error-state"
					: null} `}
				>
					<label htmlFor="signup-password">Contrasena</label>
					<input
						id="signup-password"
						type="password"
						value={form.pwd}
						onChange={e => setForm({ ...form, pwd: e.target.value })}
						placeholder='Minimo 6 caracteres'
						autoComplete="new-password"
						required
					/>
					{onError === "auth/weak-password" && <small>Usa al menos 6 caracteres</small>}
				</div>
				<div className={`input-component ${onError === "password-mismatch"
					? "error-state"
					: null} `}
				>
					<label htmlFor="signup-confirm-password">Confirmar contrasena</label>
					<input
						id="signup-confirm-password"
						type="password"
						value={form.confirmPwd}
						onChange={e => setForm({ ...form, confirmPwd: e.target.value })}
						placeholder='Repite tu contrasena'
						autoComplete="new-password"
						required
					/>
					{onError === "password-mismatch" && <small>Las contrasenas no coinciden</small>}
				</div>
				<button type='submit' className="btn main login-panel__submit" disabled={loading} >
					{loading ? "Creando cuenta..." : "Registrarme"}
				</button>
			</form>
			<p className="login-panel__switch">
				Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
			</p>
		</div>
	)
}
