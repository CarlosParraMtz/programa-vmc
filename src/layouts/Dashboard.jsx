import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/layouts/Sidebar'
import Header from '../components/layouts/Header'
import { useRecoilState } from 'recoil';
import atoms from '../recoil/atoms';
import toast from 'react-hot-toast';
import auth from '../firebase/controllers/authController';



export default function Dashboard() {

  const [open, setOpen] = useState(false)
  const [user, setUser] = useRecoilState(atoms.user)
  const navigate = useNavigate()

  useEffect(()=>{

    if(!user.signed) {
      auth.checkLoginStatus()
      .then((u) => {
        if (!user.signed) { setUser({ ...u }) }
      })
      .catch(() => {
        navigate('/login')
        toast.error('Inicia sesión para continuar')
      })
      return
    }

    if(user.signed && user.perfil === null) {
      navigate("/dashboard/config")
      toast.error("No existe el perfil para esta cuenta")
      toast('Por favor, completa el perfil para continuar', {icon: '⚠️'})
    }
  },[user])

  if (!user.signed) { return null }

  return (
    <div className='dashboard'>
      <Sidebar useOpen={[open, setOpen]} />
      <div className={`dashboard_content ${open ? "open" : ""}`}>
        <Header />
        <Outlet />
      </div>
    </div>
  )
}
