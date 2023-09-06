import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/layouts/Sidebar'
import Header from '../components/layouts/Header'
import { useRecoilState } from 'recoil';
import { userState } from '../recoil/atoms';
import { checkLoginStatus } from '../firebase/controllers/authController';



export default function Dashboard() {

  const [open, setOpen] = useState(false)
  const [user, setUser] = useRecoilState(userState)
  const navigate = useNavigate()

  useEffect(() => {
    checkLoginStatus()
      .then((data) => { 
        if (!user.signed) { 
          setUser({...data, signed: true}) } 
        })
      .catch(() => { navigate("/login") })
  }, [])

  useEffect(()=>{
    if(user.signed && user.perfil === null) {
      navigate("/dashboard/config")
      return
    }

    if(user.signed && user.congregacion === "") {
      console.log(user)
      navigate('/configure-congregation')
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
