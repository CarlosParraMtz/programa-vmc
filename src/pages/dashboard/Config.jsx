import { useState } from "react"
import { useAtom, useSetAtom } from "jotai"
import { useNavigate } from "react-router-dom"
import atoms from '../../jotai/atoms'
import Input from "../../components/common/Input"
import Select from "../../components/common/Select"
import Tooltip from "../../components/common/Tooltip"
import toast from '../../functions/toast'
import auth from "../../firebase/controllers/authController"
import { setProfile } from '../../firebase/controllers/profile.controller'
import congregationController, { getCongregacion } from "../../firebase/controllers/congregation.controller.js"
import { diasSemana, getDiaSemanaLabel } from "../../constants/diasSemana"


//TODO: Pedir confirmación para abandonar congregación, y borrar del store todo lo relacionado con esta al terminar de abandonar


export default function Config() {

  const [user, setUser] = useAtom(atoms.user)
  const [congregacion, setCongregacion] = useAtom(atoms.congregacion)
  const setMatriculados = useSetAtom(atoms.matriculados)
  const setProgramas = useSetAtom(atoms.programas)
  const setNombrados = useSetAtom(atoms.nombrados)
  const setPeriodo = useSetAtom(atoms.periodo)
  const setReuniones = useSetAtom(atoms.reuniones)
  const navigate = useNavigate()
  const [edicion, setEdicion] = useState({
    user: !user?.perfil,
    congregacion: ""
  })
  const [formUser, setFormUser] = useState({ nombre: "" })
  const [formCongregacion, setFormCongregacion] = useState({
    nombre: "",
    superintendenteCircuito: "",
    ubicacion: "",
    pais: "",
    diaReunion: 1,
    salas: 1
  })
  const [busqueda, setBusqueda] = useState("")

  const [loading, setLoading] = useState({ user: false, congregacion: false, logout: false })

  const toggleEdicionUser = () => { setEdicion({ ...edicion, user: !edicion.user }) }
  const toggleEdicionCongregacion = (tipo) => {
    setEdicion({ ...edicion, congregacion: edicion.congregacion === "" ? tipo : "" })
  }

  const submitUser = async (e) => {
    e.preventDefault()
    setLoading({ ...loading, user: true })

    await setProfile(formUser, user.email)
      .then(() => {
        setUser({ ...user, perfil: { ...user.perfil, nombre: formUser.nombre } })
      })
      .catch(err => toast.error(err));

    setLoading({ ...loading, user: false })
    toggleEdicionUser()
  }


  const editarCongregacion = () => {
    setFormCongregacion({
      ...congregacion,
      diaReunion: Number(congregacion?.diaReunion ?? 1),
      salas: Number(congregacion?.salas || 1)
    })
    toggleEdicionCongregacion("edicion")
  }

  const submitCongregacion = async (e) => {
    e.preventDefault()
    setLoading({ ...loading, congregacion: true })

    const payload = {
      ...formCongregacion,
      diaReunion: Number(formCongregacion.diaReunion ?? 1),
      salas: Number(formCongregacion.salas || 1)
    }
    delete payload.id

    try {
      let congId = null
      if (formCongregacion.id) {
        congId = formCongregacion.id
      }
      const res = await congregationController.setCongregacion(payload, user.email, congId)
      setCongregacion(res)
    }
    catch (err) {
      console.error(err)
    }

    setLoading({ ...loading, congregacion: false })
    toggleEdicionCongregacion("")
  }

  const copiarCodigo = () => {
    navigator.clipboard.writeText(congregacion.id)
    toast.success("Código copiado al portapapeles")
  }




  const cancelarBusqueda = () => {
    setBusqueda("")
    toggleEdicionCongregacion("")
  }

  const buscarCongregacion = async (e) => {
    e.preventDefault()
    setLoading({ ...loading, congregacion: true })
    try {
      const _congregacion = await getCongregacion(busqueda)
      if (_congregacion) {
        setCongregacion(_congregacion)
        setUser({ ...user, perfil: { ...user.perfil, congregacion: _congregacion.id } })
        await setProfile({ congregacion: _congregacion.id }, user.email)
        toast.success("Congregación encontrada")
      }
    }
    catch (err) {
      toast.error("No se ha encontrado este ID de congregación")
      console.error(err)
    }

    setLoading({ ...loading, congregacion: false })
    cancelarBusqueda()
  }


  const abandonarCongregacion = async () => {
    try {
      await setProfile({ congregacion: null }, user.email)
      setUser({ ...user, perfil: { ...user.perfil, congregacion: null } })
      setCongregacion(null)
    } catch (err) {
      toast.error("Ha habido un error al intentar restablecer el perfil. Favor de reiniciar la página")
      console.error(err)
    }
  }

  const cerrarSesion = async () => {
    setLoading({ ...loading, logout: true })

    try {
      await auth.logout()
      setUser(null)
      setCongregacion(null)
      setMatriculados(null)
      setProgramas(null)
      setNombrados(null)
      setPeriodo(null)
      setReuniones([])
      navigate("/login", { replace: true })
      toast.success("Sesion cerrada")
    } catch (err) {
      toast.error("No se pudo cerrar sesion")
      console.error(err)
      setLoading({ ...loading, logout: false })
    }
  }

  return (
    <>
      <div className="p-3 sm:p-4 flex gap-3">
        <h1 className="text-2xl" >Configuración</h1>
      </div>
      <div className="dashboard-settings flex flex-col lg:flex-row gap-3 sm:gap-4 px-3 sm:px-4 pb-4">
        <div className="w-full lg:max-w-md">
          <div className="card">
            <div className="card_title">
              <h2><b>Perfil:</b></h2>
              {!edicion.user &&
                <Tooltip title="Editar opciones" >
                  <button className="icon-button" onClick={() => toggleEdicionUser()}>
                    <i className="fas fa-edit"></i>
                  </button>
                </Tooltip>
              }
            </div>
            <div className="divider"></div>
            {
              edicion.user
                ? <form onSubmit={submitUser}>
                  <Input
                    name="config-user"
                    label="¿Cómo se llama?"
                    value={formUser.nombre}
                    onChange={e => setFormUser({ ...formUser, nombre: e.target.value })}
                    required
                  />
                  <button className="btn main mt-5" type="submit" >Guardar</button>
                </form>
                : <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <b>Nombre:</b>
                    <span>{user?.perfil?.nombre}</span>
                  </div>
                  <div className="flex gap-2">
                    <b>Email:</b>
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex gap-2">
                    <b>Congregación:</b>
                    <span> {congregacion ? congregacion.nombre : "No se enlazó a ninguna congregación"} </span>
                  </div>
                </div>
            }
            <button
              type="button"
              className="btn error mt-5"
              onClick={cerrarSesion}
              disabled={loading.logout}
            >
              {loading.logout ? "Cerrando sesion..." : "Cerrar sesion"}
            </button>
          </div>
        </div>
        <div className="w-full lg:max-w-md">
          <div className="card">
            <div className="card_title">
              <h2><b>Congregación:</b></h2>
              {(congregacion && !edicion.congregacion) &&
                <Tooltip title="Editar congregación" >
                  <button className="icon-button" onClick={editarCongregacion}>
                    <i className="fas fa-edit"></i>
                  </button>
                </Tooltip>
              }
            </div>
            <div className="divider"></div>
            {
              edicion.congregacion != ""
                ? edicion.congregacion === "edicion"
                  ? <form onSubmit={submitCongregacion} >
                    <Input
                      name="config-cong-nombre"
                      label="Nombre"
                      placeholder="Congregación"
                      value={formCongregacion.nombre}
                      onChange={e => setFormCongregacion({ ...formCongregacion, nombre: e.target.value })}
                    />
                    <Input
                      name="config-cong-ubicacion"
                      label="Ubicación"
                      placeholder="Ej: Xalapa, Ver."
                      value={formCongregacion.ubicacion}
                      onChange={e => setFormCongregacion({ ...formCongregacion, ubicacion: e.target.value })}
                    />
                    <Input
                      name="config-cong-superintendente"
                      label="Superintendente de circuito"
                      placeholder="Nombre del superintendente"
                      value={formCongregacion.superintendenteCircuito || ""}
                      onChange={e => setFormCongregacion({ ...formCongregacion, superintendenteCircuito: e.target.value })}
                    />
                    <Input
                      name="config-cong-pais"
                      label="País"
                      placeholder="Ej: México"
                      value={formCongregacion.pais}
                      onChange={e => setFormCongregacion({ ...formCongregacion, pais: e.target.value })}
                    />
                    <Select
                      name="config-cong-dia-reunion"
                      label="Dia de la reunion"
                      value={formCongregacion.diaReunion ?? 1}
                      onChange={e => setFormCongregacion({ ...formCongregacion, diaReunion: Number(e.target.value) })}
                    >
                      {diasSemana.map((dia) => (
                        <option key={dia.value} value={dia.value}>{dia.label}</option>
                      ))}
                    </Select>
                    <Select
                      name="config-cong-salas"
                      label="Numero de salas"
                      value={formCongregacion.salas || 1}
                      onChange={e => setFormCongregacion({ ...formCongregacion, salas: Number(e.target.value) })}
                    >
                      <option value={1}>1 sala</option>
                      <option value={2}>2 salas</option>
                    </Select>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button className="btn main mt-5" type="submit" >Guardar</button>
                      <button
                        className="btn error mt-5"
                        type="button"
                        onClick={() => toggleEdicionCongregacion("")}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                  : <form onSubmit={buscarCongregacion} >
                    <Input
                      name="config-busqueda-id"
                      label="ID de congregación existente"
                      required
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                    />
                    <div className="flex flex-col sm:flex-row gap-2 mt-5">

                      <button
                        type="submit"
                        className="btn main"
                      >
                        Enviar
                      </button>
                      <button
                        type="button"
                        className="btn error"
                        onClick={cancelarBusqueda}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                : <div className="flex flex-col gap-4">

                  {
                    congregacion
                      ? <>
                        <div className="flex gap-2">
                          <b>Nombre:</b>
                          <span> {congregacion?.nombre} </span>
                        </div>
                        <div className="flex gap-2">
                          <b>Ciudad:</b>
                          <span> {congregacion?.ubicacion} </span>
                        </div>
                        <div className="flex gap-2">
                          <b>Superintendente de circuito:</b>
                          <span> {congregacion?.superintendenteCircuito || "No se ha registrado"} </span>
                        </div>
                        <div className="flex gap-2">
                          <b>País:</b>
                          <span> {congregacion?.pais} </span>
                        </div>
                        <div className="flex gap-2">
                          <b>Salas:</b>
                          <span> {Number(congregacion?.salas || 1) === 2 ? "A y B" : "A"} </span>
                        </div>
                        <div className="flex gap-2">
                          <b>Dia de reunion:</b>
                          <span> {getDiaSemanaLabel(congregacion?.diaReunion)} </span>
                        </div>
                        <div className="flex gap-2 lg:items-center flex-col lg:flex-row">
                          <b>ID de congregación:</b>
                          <span className="flex gap-3 items-center">
                            {congregacion?.id}
                            <Tooltip title="Copiar" >
                              <button className="icon-button" onClick={copiarCodigo}>
                                <i className="fas fa-copy"></i>
                              </button>
                            </Tooltip>
                          </span>
                        </div>
                      </>
                      : <>
                        <h4>No hay una congregación guardada</h4>
                        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center" >
                          <button className="btn main" onClick={() => toggleEdicionCongregacion("edicion")}>Crear congregación</button>
                          <button className="btn main" onClick={() => toggleEdicionCongregacion("busqueda")}>Administrar congregación existente</button>
                        </div>
                      </>
                  }

                  {user?.perfil?.congregacion &&
                    <button className="btn error" onClick={abandonarCongregacion} >Abandonar congregación</button>
                  }
                </div>
            }
          </div>
        </div>
      </div>
    </>
  )
}
