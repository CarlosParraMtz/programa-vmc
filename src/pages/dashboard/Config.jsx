import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"
import atoms from '../../recoil/atoms'
import Input from "../../components/common/Input"
import Tooltip from "../../components/common/Tooltip"
import toast from '../../functions/toast'
import { setProfile } from '../../firebase/controllers/profile.controller'
import congregationController, { getCongregacion } from "../../firebase/controllers/congregation.controller.js"


//TODO: Pedir confirmación para abandonar congregación, y borrar del store todo lo relacionado con esta al terminar de abandonar


export default function Config() {

  const [user, setUser] = useRecoilState(atoms.user)
  const [congregacion, setCongregacion] = useRecoilState(atoms.congregacion)
  const [edicion, setEdicion] = useState({
    user: false,
    congregacion: ""
  })
  const [formUser, setFormUser] = useState({ nombre: "" })
  const [formCongregacion, setFormCongregacion] = useState({
    nombre: "",
    ubicacion: "",
    pais: ""
  })
  const [busqueda, setBusqueda] = useState("")

  const [loading, setLoading] = useState({ user: false, congregacion: false })

  const toggleEdicionUser = () => { setEdicion({ ...edicion, user: !edicion.user }) }
  const toggleEdicionCongregacion = (tipo) => {
    setEdicion({ ...edicion, congregacion: edicion.congregacion === "" ? tipo : "" })
  }

  useEffect(() => {
    if (!user.perfil) {
      toggleEdicionUser()
    }
  }, [user])


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
    setFormCongregacion({ ...congregacion })
    toggleEdicionCongregacion("edicion")
  }

  const submitCongregacion = async (e) => {
    e.preventDefault()
    setLoading({ ...loading, congregacion: true })

    const payload = { ...formCongregacion }
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
    }
  }

  return (
    <>
      <div className="p-2.5 flex gap-3">
        <h1 className="text-2xl" >Configuración</h1>
      </div>
      <div className="flex">
        <div className="w-full max-w-md p-2.5">
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
          </div>
        </div>
        <div className="w-full max-w-md p-2.5">
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
                      name="config-cong-pais"
                      label="País"
                      placeholder="Ej: México"
                      value={formCongregacion.pais}
                      onChange={e => setFormCongregacion({ ...formCongregacion, pais: e.target.value })}
                    />
                    <div className="flex gap-2">
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
                    <div className="flex gap-2 mt-5">

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
                          <b>País:</b>
                          <span> {congregacion?.pais} </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <b>ID de congregación:</b>
                          <span> {congregacion?.id} </span>
                          <Tooltip title="Copiar" >
                            <button className="icon-button" onClick={copiarCodigo}>
                              <i className="fas fa-copy"></i>
                            </button>
                          </Tooltip>
                        </div>
                      </>
                      : <>
                        <h4>No hay una congregación guardada</h4>
                        <div className="flex gap-5 w-full justify-center" >
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
