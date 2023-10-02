import { useState, useEffect } from 'react'
import auth from '../../firebase/controllers/authController';
import { useRecoilState } from 'recoil';
import atoms from '../../recoil/atoms';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {

    const [user, setUser] = useRecoilState(atoms.user) // User's global state
    const [form, setForm] = useState({ email: "", pwd: "" });
    const [loading, setLoading] = useState(false)
    const [onError, setOnError] = useState(null)
    const navigate = useNavigate()

    const goLogin = async (e) => {
        e.preventDefault();
        setLoading(true)
        await auth.login(form)
            .then((res)=>{
                setUser(res)
                navigate("/dashboard")
                setOnError(null)
            })
            .catch(e => { 
                setOnError( e ) 
                let textoError;
                switch(e) {
                    case 'auth/user-not-found':
                        textoError = 'Usuario no encontrado'
                        break;
                    case 'auth/wrong-password':
                        textoError = 'La contraseña es incorrecta'
                        break;
                    default:
                        textoError = 'Ha ocurrido un error al iniciar sesión'
                        break;
                }
                toast.error(textoError)
            }) 
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-5 w-full">
            <h1 className='text-center' >Login</h1>
            <form onSubmit={goLogin} className='flex flex-col gap-5 w-full' >
                <div 
                    className={`input-component ${onError === "auth/user-not-found" 
                        ? "error-state" 
                        : null
                    }`}
                >
                    <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder='Correo'
                        required
                    />
                    {onError === "auth/user-not-found" && <small>Usuario no encontrado</small>}
                </div>
                <div className={`input-component ${onError === "auth/wrong-password"
                    ? "error-state"
                    : null } `}
                >
                    <input
                        type="password"
                        value={form.pwd}
                        onChange={e => setForm({ ...form, pwd: e.target.value })}
                        placeholder='Contraseña'
                        required
                    />
                    {onError === "auth/wrong-password" && <small>Contraseña incorrecta</small>}
                </div>
                <button type='submit' className="main-button">Iniciar sesión</button>
            </form>
        </div>
    )
}
