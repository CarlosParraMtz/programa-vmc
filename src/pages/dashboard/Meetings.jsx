import { useEffect, useState } from "react"
import Modal from "../../components/common/Modal"
import atoms from "../../recoil/atoms"
import { useRecoilValue } from "recoil"
import Input from "../../components/common/Input"
import getDiaHoy from '../../functions/getDiaHoy'
import { AnimatePresence, motion } from "framer-motion"
import animations from "../../constants/animations"
import datareunionesController from "../../firebase/controllers/datareuniones.controller"
import reunionesController from "../../firebase/controllers/reuniones.controller"
import toast, { LoaderIcon } from "react-hot-toast"
import Tablero from '../../components/dashboard/Tablero'
import Advertencia from "../../components/common/Advertencia"
import TableroEdicion from "../../components/dashboard/TableroEdicion"
import useModal from '../../hooks/useModal'
import formatearRangoSemanal from "../../functions/formatearRangoSemanal"

export default function Meetings() {
  const periodo = useRecoilValue(atoms.periodo)
  const congregacion = useRecoilValue(atoms.congregacion)
  const reuniones = useRecoilValue(atoms.reuniones)
  const [reunionesFilter, setReunionesFilter] = useState([])
  const [seleccion, setSeleccion] = useState(null)
  const [modalAgregarReunion, setModalAgregarReunion] = useState(false)
  const { modalConfirm, modalError } = useModal()
  const [agregarReunionesTab, setAgregarReunionesTab] = useState(0)
  const [loading, setLoading] = useState(false)

  const [edicion, setEdicion] = useState(null)
  const [asignadosVacios, setAsignadosVacios] = useState(false)

  const [rangoFechas, setRangoFechas] = useState({
    inicial: getDiaHoy(new Date()),
    final: getDiaHoy(new Date())
  })


  const abrirModalAgregarReunion = () => {
    if (!periodo) {
      modalError({
        title: "Error al agregar reunión",
        text: "Primero seleccione un periodo"
      })
      return
    }
    setModalAgregarReunion(true)
  }
  const cerrarModalAgregarReunion = () => setModalAgregarReunion(false)

  //* Funciones para la edición
  const activarEdicion = () => {
    setEdicion(JSON.parse(JSON.stringify(seleccion)))
  }

  const cancelarEdicion = () => setEdicion(null)



  // * Función para agregar reuniones a la lista, con base en las
  // * reuniones previamente cargadas en la base de datos.
  const agregarReuniones = async (e) => {
    e.preventDefault()

    /*const hoy = getDiaHoy(new Date())
     if (rangoFechas.inicial < hoy || rangoFechas.final < hoy) {
      modalError({
        title: "La fecha o rango de fechas introducidas ya pasaron.",
        text: "Es necesario poner una fecha futura."
      })
      return
    } */
    if (agregarReunionesTab === 0 && rangoFechas.inicial > rangoFechas.final) {
      modalError({
        title: "No se pueden seleccionar estas fechas",
        text: "La fecha inicial debe ser una fecha anterior a la final"
      })
      return
    }
    if (!periodo) {
      modalError({
        title: "Es necesario seleccionar un periodo"
      })
      return
    }

    const guardarReunion = async (reunion) => {
      const nuevaReunion = {
        ...reunion,
        periodo: periodo.id,
        asignaciones: reunion.asignaciones.map(
          asignacion => ({ ...asignacion, asignado: "" })
        )
      }
      await reunionesController.createReunion(nuevaReunion, congregacion.id)
    }

    setLoading(true)
    if (agregarReunionesTab === 0) {
      try {
        const reuniones = await datareunionesController.getDataReuniones(rangoFechas)
        console.log(reuniones)
        reuniones.forEach(async (reunion) => {
          await guardarReunion(reunion)
        })
        cerrarModalAgregarReunion()
      } catch (e) {
        modalError({
          title: "Ha habido un error al guardar la reunión",
          text: e
        })
        console.log(e)
      }

    } else if (agregarReunionesTab === 1) {
      try {
        const reunion = await datareunionesController.getDataReunion(rangoFechas.inicial)
        if (reunion) {
          await guardarReunion(reunion)
          cerrarModalAgregarReunion()
        } else {
          modalError({ title: "Error", text: "No hay información guardada para esta reunión" })
        }
      } catch (e) {
        modalError({
          title: "Ha habido un error al guardar la reunión",
          text: e
        })
        console.log(e)
      }
    }
    setLoading(false)

  }


  const borrarReunion = async () => {
    if (!congregacion) {
      modalError({ text: "Es necesario ser parte de una congregación para borrar sus reuniones" });
      return;
    }

    setLoading(true);
    try {
      await reunionesController.deleteReunion(seleccion.id, congregacion.id);
      toast.success("Se ha borrado esta reunión correctamente")
      setSeleccion(null);
    } catch (error) {
      modalError({ title: "Ha habido un error al borrar" });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  // * Side effects

  useEffect(() => {
    if (periodo) {
      const _reunionesFilter = reuniones.filter(reunion => reunion.periodo == periodo.id)
      setReunionesFilter(_reunionesFilter)
    }
  }, [reuniones, periodo])

  useEffect(() => {
    if (seleccion) {
      const asignados = seleccion.asignaciones.map(asignacion => asignacion.asignado)
      setAsignadosVacios(asignados.includes(""))
    } else {
      setAsignadosVacios(false)
    }
  }, [seleccion])

  return (
    <>
      <div className="p-2.5 pl-5">
        <h1 className="text-2xl" >Reuniones</h1>
      </div>
      <div className="flex meetings">
        <div className="w-full max-w-md p-2.5 pl-5">
          <div className="card">
            <div className="card_title">
              <h2><b>Reuniones en este periodo:</b></h2>
              <button className="icon-button" onClick={abrirModalAgregarReunion}>
                <i className="fas fa-add"></i>
              </button>
            </div>
            <div className="divider"></div>
            {
              reunionesFilter.length === 0
                ? <div className="p-16 flex flex-col items-center justify-center gap-5">
                  <p>No hay reuniones agregadas a este periodo</p>
                  <button className="btn main" onClick={abrirModalAgregarReunion} >
                    Agregar reuniones...
                  </button>
                </div>

                : <ul className="gap-2 flex flex-col max-h-[300px] overflow-auto">
                  {reunionesFilter.map(reunion =>
                    <li key={reunion.id}
                      onClick={() => {
                        if (!edicion)
                          setSeleccion({ ...reunion })
                      }}
                      className={`
                        px-4 py-2 rounded-lg shadow-md bg-purple-50 
                        border hover:border-purple-500 cursor-pointer
                        ${seleccion && seleccion.id === reunion.id ? "bg-violet-100 border-purple-600" : ""}
                      `}
                    >
                      Semana {formatearRangoSemanal(reunion.fecha)}
                    </li>
                  )}
                </ul>
            }

          </div>
        </div>



        <div className="w-full max-w-4xl p-2.5">
          {
            (asignadosVacios && !edicion) &&
            <Advertencia text="Hay partes en esta reunión sin asignar a nadie. Edita esta reunión para poder asignar a alguien" />
          }

          <div className="card">
            <div className="card_title">
              {seleccion &&
                <div className="rounded-xl bg-gray-300" >
                  {
                    edicion
                      ? <>
                        <button onClick={cancelarEdicion}
                          className="w-10 h-10 hover:text-white hover:bg-violet-400 rounded-l-xl bg-red-300">
                          <i className="fas fa-cancel" ></i>
                        </button>
                        {/*                         <button className="w-10 h-10 hover:text-white  hover:bg-primary">
                          <i className="fas fa-save" ></i>
                        </button> */}
                        <button className="w-10 h-10 hover:text-white  hover:bg-violet-400 rounded-r-xl">
                          <i className="fas fa-save" ></i>
                        </button>
                      </>
                      : <>
                        <button onClick={activarEdicion}
                          className="w-10 h-10 hover:text-white hover:bg-violet-400 rounded-l-xl">
                          <i className="fas fa-edit" ></i>
                        </button>
                        <button className="w-10 h-10 hover:text-white  hover:bg-violet-400">
                          <i className="fas fa-print" ></i>
                        </button>
                        <button className="w-10 h-10 hover:text-white  hover:bg-violet-400"
                          onClick={() => modalConfirm({
                            title: "¿Seguro que desea borrar esta reunión y sus datos?",
                            text: "Esta acción es imposible deshacerla",
                            onConfirm: borrarReunion,
                            textButton: "Borrar",
                          })}
                        >
                          <i className="fas fa-trash" ></i>
                        </button>
                        <button className="w-10 h-10 hover:text-white  hover:bg-violet-400 rounded-r-xl">
                          <i className="fas fa-paper-plane" ></i>
                        </button>
                      </>
                  }

                </div>
              }

            </div>
            <div className="divider"></div>

            {
              seleccion
                ? edicion
                  ? <TableroEdicion useReunion={[edicion, setEdicion]} />
                  : <Tablero programa={seleccion} />
                : <div className="p-16">
                  <p className="text-center" >
                    Haz click en una reunión para ver y editar los detalles
                  </p>
                </div>
            }

          </div>
        </div>
      </div>

      <Modal id="agregar-reunion-modal"
        title="Agregar reunión"
        open={modalAgregarReunion}
        onClose={cerrarModalAgregarReunion}
        loading={loading}
      >
        <AnimatePresence mode="wait" >
          {
            loading
              ? <LoaderIcon className="w-10 h-10 self-center my-10 border-r-primary" />
              : <>
                <div className="flex justify-start" >
                  <button
                    className={`btn tab ${agregarReunionesTab === 0 ? "active" : ""} relative`}
                    onClick={() => setAgregarReunionesTab(0)}
                  >
                    Rango
                  </button>
                  <button
                    className={`btn tab ${agregarReunionesTab === 1 ? "active" : ""}`}
                    onClick={() => setAgregarReunionesTab(1)}
                  >
                    Una
                  </button>
                </div>
                <motion.div key="agregar-reunion-page-0" {...animations.fadeInOut} >
                  <form className="w-full mt-4" onSubmit={agregarReuniones}>
                    <div className="flex flex-col w-full gap-2" >
                      <Input
                        label={agregarReunionesTab === 1 ? "Fecha" : "Fecha inicial"}
                        type="date"
                        required
                        value={rangoFechas.inicial}
                        onChange={e => setRangoFechas({ ...rangoFechas, inicial: e.target.value })}
                      />
                      {agregarReunionesTab === 0 &&
                        <Input
                          label="Fecha final"
                          type="date"
                          required
                          value={rangoFechas.final}
                          onChange={e => setRangoFechas({ ...rangoFechas, final: e.target.value })}
                        />
                      }
                    </div>
                    <div className="flex items-center justify-end mt-2 gap-2" >
                      <button className="btn error" type="button" onClick={cerrarModalAgregarReunion} >Cancelar</button>
                      <button className="btn main" type="submit" >Guardar</button>
                    </div>
                  </form>
                </motion.div>
              </>
          }
        </AnimatePresence>
      </Modal>



    </>
  )
}
