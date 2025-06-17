import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/layouts/Sidebar'
import Header from '../components/layouts/Header'
import { useAtom, useSetAtom } from 'jotai';
import atoms from '../jotai/atoms';
import toast from '../functions/toast';
import auth from '../firebase/controllers/authController';
import { getCongregacion } from '../firebase/controllers/congregation.controller';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

//TODO: Crear una función useEffect que detece cambios en el atom de congregación. Cuando cambie y lo encuentre, que descargue Matriculados, nombrados, periodos y reuniones.

export default function Dashboard() {

  const [open, setOpen] = useState(false)
  const [user, setUser] = useAtom(atoms.user)
  const [congregacion, setCongregacion] = useAtom(atoms.congregacion)
  const setPeriodo = useSetAtom(atoms.periodo)
  const setNombrados = useSetAtom(atoms.nombrados)
  const setMatriculados = useSetAtom(atoms.matriculados)
  const [programas, setProgramas] = useAtom(atoms.programas)
  const setReuniones = useSetAtom(atoms.reuniones)
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



  useEffect(() => { //* Esta función detecta y descarga cambios en los periodos
    if (congregacion) {
      return onSnapshot(
        collection(db, `congregaciones/${congregacion.id}/programas`),
        (snapshot) => {
          let data = snapshot.docs.map(doc => {
            const snap = doc.data()
            return {
              ...snap,
              id: doc.id,
              created: new Date(snap.created.seconds * 1000),
              updated: snap.updated ? new Date(snap.updated.seconds * 1000) : null
            }
          })
          setProgramas(data.sort((a, b) => a.created - b.created))
        })
    }
  }, [congregacion])

  useEffect(() => { //* Esta función detecta y descarga cambios en las reuniones
    if (congregacion) {
      return onSnapshot(
        collection(db, `congregaciones/${congregacion.id}/reuniones`),
        (snapshot) => {
          let data = snapshot.docs.map(doc => {
            const snap = doc.data()
            return ({
              ...snap,
              id: doc.id,
              created: new Date(snap.created?.seconds * 1000 || snap.created),
            })
          })
          setReuniones(data.sort((a, b) => a.fecha.localeCompare(b.fecha)))
        })
    }
  }, [congregacion])


  useEffect(() => { //* Esta función detecta y descarga cambios en los nombrados
    if (congregacion) {
      return onSnapshot(
        collection(db, `congregaciones/${congregacion.id}/nombrados`),
        (snapshot) => {
          let data = snapshot.docs.map(doc => {
            const snap = doc.data()
            return {
              ...snap,
              id: doc.id,
            }
          })
          setNombrados(data.sort((a, b) => a.nombre.localeCompare(b.nombre)))
        })
    }
  }, [congregacion])

  useEffect(() => { //* Esta función detecta y descarga cambios en los matriculados
    if (congregacion) {
      return onSnapshot(
        collection(db, `congregaciones/${congregacion.id}/matriculados`),
        (snapshot) => {
          let data = snapshot.docs.map(doc => {
            const snap = doc.data()
            return {
              ...snap,
              id: doc.id,
            }
          })
          setMatriculados(data.sort((a, b) => a.nombre.localeCompare(b.nombre)))
        })
    }
  }, [congregacion])


  useEffect(() => {
    if (programas && programas.length > 0) {
      setPeriodo({ ...programas[0] })
    }
  }, [programas])



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
