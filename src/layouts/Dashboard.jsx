import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/layouts/Sidebar'
import Header from '../components/layouts/Header'
import { useRecoilState, useSetRecoilState } from 'recoil';
import atoms from '../recoil/atoms';
import toast from '../functions/toast';
import auth from '../firebase/controllers/authController';
import { getCongregacion } from '../firebase/controllers/congregation.controller';

//TODO: Crear una función useEffect que detece cambios en el atom de congregación. Cuando cambie y lo encuentre, que descargue Matriculados, nombrados, periodos y reuniones.

export default function Dashboard() {

  const [open, setOpen] = useState(false)
  const [user, setUser] = useRecoilState(atoms.user)
  const setCongregacion = useSetRecoilState(atoms.congregacion)
  const navigate = useNavigate()

  useEffect(() => {

    if (!user) {
      auth.checkLoginStatus()
        .then(async (u) => {
          if (!user) { setUser({ ...u }) }

        })
        .catch(() => {
          navigate('/login')
          toast.error('Inicia sesión para continuar')
        })
      return
    }

    if ((user?.signed && user?.perfil === null) || !user?.perfil?.congregacion) {
      navigate("/dashboard/config")
      toast.info('Por favor, completa el perfil para continuar')
    }

    if (typeof user.perfil.congregacion === "string" && user.perfil.congregacion.length > 0) {
      getCongregacion(user.perfil.congregacion)
        .then(congregacion => setCongregacion(congregacion))
        .catch(() => toast.error("Ha habido un error al intentar obtener la congregación"))
    }
  }, [user])

  if (!user) { return null }

  return (
    <div className='dashboard'>
      <Sidebar useOpen={[open, setOpen]} />
      <div className={`dashboard_content ${open ? "open" : ""}`}>
        <Header setOpen={setOpen} />
        <Outlet />
      </div>
    </div>
  )
}
