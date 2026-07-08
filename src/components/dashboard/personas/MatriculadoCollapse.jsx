import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import useModal from "../../../hooks/useModal"
import { getTiposAsignacionLabels } from "../../../constants/tiposAsignacionMatriculado"
//import formatearFecha from "../../../functions/formatearFecha"

export default function MatriculadoCollapse({ matriculado, onDelete = () => { }, onEdit = () => { }, onAdd = null, onAddAyudante = null }) {
  const [open, setOpen] = useState(false)
  const { modalConfirm } = useModal()
  const tiposAsignacion = getTiposAsignacionLabels(matriculado.tiposAsignacion || [])

  if(open) {
    console.log(matriculado)
  }
  return (
    <AnimatePresence>
      <motion.div
        key={matriculado.id}
        initial={{ opacity: 0, }}
        animate={{ opacity: 1, }}
        exit={{ opacity: 0, }}
        className="bg-gray-50 shadow border border-gray-50 flex flex-col rounded-lg not-last:mb-1"
      >
        <div className="flex justify-between items-center gap-2 p-2 cursor-pointer hover:bg-purple-100"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="
              w-8 h-8 rounded-full bg-purple-300 text-purple-700 
              flex items-end overflow-hidden justify-center text-2xl
            " >
              <i className="fas fa-user"></i>
            </span>
            <p className="break-words">{matriculado.nombre}</p>
          </div>
          <motion.i
            animate={{ rotateZ: open ? 180 : 0 }}
            className="fas fa-caret-down px-2"
          ></motion.i>
        </div>
        <motion.div
          initial={{ height: 0, opacity:0 }}
          animate={{ height: open ? "auto" : 0, opacity: 1 }}
          className="flex flex-col w-full overflow-hidden">
          <div className="p-3 sm:p-5 border-t border-gray-50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-5 ">
              <p className="text-purple-500 text-xl" >
                <strong>{matriculado.genero === 1 ? "Hombre" : "Mujer"}</strong>
              </p>
              {
                (onAdd || onAddAyudante)
                  ? <div className="flex gap-2" >
                    {onAdd && (
                      <button className="btn main w-12" onClick={() => onAdd(matriculado)} title="Asignar">
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                    {onAddAyudante && (
                      <button className="btn main w-12" onClick={() => onAddAyudante(matriculado)} title="Asignar como ayudante">
                        <i className="fas fa-handshake"></i>
                      </button>
                    )}
                  </div>
                  : <div className="flex gap-2" >
                    <button className="btn main w-12" onClick={() => onEdit(matriculado)} >
                      <i className="fas fa-pencil"></i>
                    </button>
                    <button className="btn error w-12" onClick={() => modalConfirm({
                      title: "¿Seguro que desea borrar a " + matriculado.nombre + "?",
                      icon: 'info',
                      text: matriculado.nombre,
                      textButton: "Borrar",
                      onConfirm: () => onDelete(matriculado.id, matriculado.nombre),
                      skipClose: true,
                    })} >
                      <i className="fas fa-xmark"></i>
                    </button>
                  </div>
              }
            </div>
            {matriculado.ultimaAsignacion &&
              <>
                <p><strong>Última asignación:</strong></p>
                <p className="pl-5" >
                </p>
              </>}
            <p><strong>Puede pasar:</strong></p>
            <p className="pl-5">
              {tiposAsignacion.length > 0 ? tiposAsignacion.join(", ") : "Sin definir"}
            </p>
            {matriculado.detalles != "" && <>
              <p><strong>Observaciones:</strong></p>
              <p className="pl-5" >
                {matriculado.detalles}
              </p>
            </>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence >
  )
}
