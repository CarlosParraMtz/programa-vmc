import { useEffect, useState } from "react"
import Modal from "../../components/common/Modal"
import atoms from "../../jotai/atoms"
import { useAtomValue } from "jotai"
import Input from "../../components/common/Input"
import getDia from '../../functions/getDia'
import { AnimatePresence, motion } from "framer-motion"
import animations from "../../constants/animations"
import datareunionesController from "../../firebase/controllers/datareuniones.controller"
import reunionesController from "../../firebase/controllers/reuniones.controller"
import toast, { LoaderIcon } from "react-hot-toast"
import Tablero from '../../components/dashboard/Tablero'
import Advertencia from "../../components/common/Advertencia"
import TableroEdicion from "../../components/dashboard/TableroEdicion"
import useModal from '../../hooks/useModal'
import useLoader from "../../hooks/useLoader"
import formatearRangoSemanal from "../../functions/formatearRangoSemanal"
import matriculadosController from "../../firebase/controllers/matriculados.controller"
import nombradosController from "../../firebase/controllers/nombrados.controller"
import { downloadStudentAssignmentCardsPng } from "../../functions/studentAssignmentCards"
import {
  applyMeetingHistory,
  getPersonName,
  getPublicProgramUrl,
  stripUndefined,
  validateProgram,
} from "../../functions/programHelpers"
import { getFechaReunionDesdeSemana } from "../../functions/meetingDates"

export default function Meetings() {
  const periodo = useAtomValue(atoms.periodo)
  const congregacion = useAtomValue(atoms.congregacion)
  const reuniones = useAtomValue(atoms.reuniones)
  const matriculados = useAtomValue(atoms.matriculados) || []
  const nombrados = useAtomValue(atoms.nombrados) || []
  const [reunionesFilter, setReunionesFilter] = useState([])
  const [seleccion, setSeleccion] = useState(null)
  const [modalAgregarReunion, setModalAgregarReunion] = useState(false)
  const { modalConfirm, modalError } = useModal()
  const { setLoader } = useLoader()
  const [agregarReunionesTab, setAgregarReunionesTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [generandoAsignaciones, setGenerandoAsignaciones] = useState(false)

  const [edicion, setEdicion] = useState(null)
  const [asignadosVacios, setAsignadosVacios] = useState(false)

  const [rangoFechas, setRangoFechas] = useState({
    inicial: getDia(new Date()),
    final: getDia(new Date())
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

  const guardarEdicion = async () => {
    if (!edicion || !congregacion) return

    const warnings = validateProgram(edicion, congregacion)
    if (warnings.length > 0) {
      modalConfirm({
        title: "El programa tiene advertencias",
        text: warnings.slice(0, 5).join(" "),
        textButton: "Guardar de todos modos",
        onConfirm: () => guardarEdicionConfirmada(),
      })
      return
    }

    await guardarEdicionConfirmada()
  }

  const guardarEdicionConfirmada = async () => {
    setLoading(true)
    setLoader(true)
    try {
      const payload = {
        ...edicion,
        estado: "asignado",
        actualizado: getDia(new Date()),
      }
      await reunionesController.updateReunion(stripUndefined(payload), congregacion.id, edicion.id)

      const historiales = applyMeetingHistory({ reunion: payload, matriculados, nombrados, congregacion })
      await Promise.all([
        ...historiales.matriculados.map(({ id, ...persona }) =>
          matriculadosController.updateMatriculado(stripUndefined(persona), congregacion.id, id)
        ),
        ...historiales.nombrados.map(({ id, ...persona }) =>
          nombradosController.updateNombrado(stripUndefined(persona), congregacion.id, id)
        ),
      ])

      setSeleccion(payload)
      setEdicion(null)
      toast.success("Programa guardado e historial actualizado")
    } catch (error) {
      console.error(error)
      modalError({ title: "No se pudo guardar el programa", text: String(error?.message || error) })
    } finally {
      setLoading(false)
      setLoader(false)
    }
  }

  const copiarEnlacePublico = async () => {
    if (!seleccion || !congregacion) return
    const url = getPublicProgramUrl(congregacion.id, seleccion.id)
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Enlace copiado")
    } catch {
      window.prompt("Copia el enlace del programa", url)
    }
  }

  const descargarAsignacionesEstudiantiles = async () => {
    if (!seleccion || generandoAsignaciones) return

    setGenerandoAsignaciones(true)
    try {
      const total = await downloadStudentAssignmentCardsPng(seleccion, congregacion)
      if (total === 0) {
        toast.error("No hay asignaciones estudiantiles para generar")
        return
      }
      toast.success(`Se generaron ${total} PNG en un archivo ZIP`)
    } catch (error) {
      console.error(error)
      toast.error("No se pudieron generar las hojas de asignación")
    } finally {
      setGenerandoAsignaciones(false)
    }
  }



  // * Función para agregar reuniones a la lista, con base en las
  // * reuniones previamente cargadas en la base de datos.
  const agregarReuniones = async (e) => {
    e.preventDefault()

    /*const hoy = getDia(new Date())
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
        fecha: getFechaReunionDesdeSemana(reunion.fecha, congregacion, reunion),
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
        await Promise.all(reuniones.map((reunion) => guardarReunion(reunion)))
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
      const asignados = seleccion.asignaciones.map(asignacion => getPersonName(asignacion.asignado))
      setAsignadosVacios(asignados.includes(""))
    } else {
      setAsignadosVacios(false)
    }
  }, [seleccion])

  return (
    <>
      <div className="p-3 sm:p-4 no-print">
        <h1 className="text-2xl" >Reuniones</h1>
      </div>
      <div className="flex flex-col xl:flex-row meetings gap-3 sm:gap-4 px-3 sm:px-4 pb-4">
        <div className="w-full xl:max-w-sm no-print">
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
                ? <div className="p-6 sm:p-10 flex flex-col items-center justify-center gap-5 text-center">
                  <p>No hay reuniones agregadas a este periodo</p>
                  <button className="btn main" onClick={abrirModalAgregarReunion} >
                    Agregar reuniones...
                  </button>
                </div>

                : <ul className="gap-2 flex flex-col max-h-[260px] xl:max-h-[calc(100vh-260px)] overflow-auto">
                  {reunionesFilter.map(reunion =>{
                    return (<li key={reunion.id}
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
                      <span>Semana {formatearRangoSemanal(reunion.fecha)}</span>
                      {reunion.semanaVisita && (
                        <span className="ml-2 rounded-full bg-purple-200 px-2 py-0.5 text-xs font-semibold text-purple-800">
                          Visita
                        </span>
                      )}
                    </li>)
                    }
                  )}
                </ul>
            }

          </div>
        </div>



        <div className="w-full min-w-0 xl:flex-1">
          {
            (asignadosVacios && !edicion) &&
            <Advertencia text="Hay partes en esta reunión sin asignar a nadie. Edita esta reunión para poder asignar a alguien" />
          }

          <div className="card">
            <div className={`card_title ${edicion ? "meeting-actions-sticky-shell" : ""}`}>
              {seleccion &&
                <div className="meeting-actions" aria-label="Acciones de la reunión">
                  {
                    edicion
                      ? <>
                        <button onClick={cancelarEdicion}
                          className="meeting-action meeting-action--secondary">
                          <i className="fas fa-xmark" aria-hidden="true"></i>
                          <span>Cancelar</span>
                        </button>
                        <button
                          onClick={guardarEdicion}
                          disabled={loading}
                          className="meeting-action meeting-action--primary"
                        >
                          <i className="fas fa-save" aria-hidden="true"></i>
                          <span>Guardar cambios</span>
                        </button>
                      </>
                      : <>
                        <button onClick={activarEdicion}
                          className="meeting-action meeting-action--secondary">
                          <i className="fas fa-edit" aria-hidden="true"></i>
                          <span>Editar</span>
                        </button>
                        <button className="meeting-action meeting-action--secondary" onClick={() => window.print()}>
                          <i className="fas fa-print" aria-hidden="true"></i>
                          <span>Imprimir</span>
                        </button>
                        <button className="meeting-action meeting-action--secondary" onClick={copiarEnlacePublico}>
                          <i className="fas fa-paper-plane" aria-hidden="true"></i>
                          <span>Compartir</span>
                        </button>
                        <button
                          className="meeting-action meeting-action--primary meeting-action--assignments"
                          onClick={descargarAsignacionesEstudiantiles}
                          disabled={generandoAsignaciones}
                          aria-busy={generandoAsignaciones}
                        >
                          {generandoAsignaciones
                            ? <LoaderIcon className="meeting-action__loader" />
                            : <i className="fas fa-id-badge" aria-hidden="true"></i>
                          }
                          <span>{generandoAsignaciones ? "Generando hojas…" : "Generar hojas de asignación"}</span>
                        </button>
                        <button className="meeting-action meeting-action--danger"
                          onClick={() => modalConfirm({
                            title: "¿Seguro que desea borrar esta reunión y sus datos?",
                            text: "Esta acción es imposible deshacerla",
                            onConfirm: borrarReunion,
                            textButton: "Borrar",
                          })}
                        >
                          <i className="fas fa-trash" aria-hidden="true"></i>
                          <span>Borrar</span>
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
                  : <Tablero programa={seleccion} congregacion={congregacion} congregacionNombre={congregacion?.nombre} />
                : <div className="p-8 sm:p-16">
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
