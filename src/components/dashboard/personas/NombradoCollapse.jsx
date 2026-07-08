import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import useModal from "../../../hooks/useModal"
import { nombramientos } from "../../../constants/nombramientos"
import { getTiposAsignacionNombradoLabels } from "../../../constants/tiposAsignacionNombrado"

export default function NombradoCollapse({ nombrado, onDelete = () => { }, onEdit = () => { }, onAdd = null }) {
  const [open, setOpen] = useState(false)
  const { modalConfirm } = useModal()
  const tiposAsignacion = getTiposAsignacionNombradoLabels(nombrado.tiposAsignacion || [])

  return (
    <AnimatePresence>
      <motion.div
        key={nombrado.id}
        initial={{ opacity: 0, }}
        animate={{ opacity: 1, }}
        exit={{ opacity: 0, }}
        className="bg-gray-50 shadow border border-gray-50 flex flex-col rounded-lg [&:not(:last-child)]:mb-1"
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
            <p className="break-words">{nombrado.nombre}</p>
          </div>
          <motion.i
            animate={{ rotateZ: open ? 180 : 0 }}
            className="fas fa-caret-down px-2"
          ></motion.i>
        </div>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: open ? "auto" : 0, opacity: 1 }}
          className="flex flex-col w-full overflow-hidden">
          <div className="p-3 sm:p-5 border-t border-gray-50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-5 ">
              <p className="text-purple-500 text-xl" >
                <strong>{nombramientos[nombrado.nombramiento]}</strong>
              </p>
              {
                onAdd
                  ? <div className="flex gap-2" >
                    <button className="btn main w-12" onClick={() => onAdd(nombrado)} >
                      <i className="fas fa-check"></i>
                    </button>
                  </div>
                  : <div className="flex gap-2" >
                    <button className="btn main w-12" onClick={() => onEdit(nombrado)} >
                      <i className="fas fa-pencil"></i>
                    </button>
                    <button className="btn error w-12" onClick={() => modalConfirm({
                      title: "¿Seguro que desea borrar este nombrado?",
                      icon: 'info',
                      text: nombrado.nombre,
                      textButton: "Borrar",
                      onConfirm: () => onDelete(nombrado.id, nombrado.nombre),
                      skipClose: true,
                    })} >
                      <i className="fas fa-xmark"></i>
                    </button>
                  </div>
              }

            </div>
            {nombrado.ultimaAsignacion &&
              <>
                <p><strong>Última asignación:</strong></p>
                <p className="pl-5" >
                  Presidir - 24 de mayo de 2025
                </p>
              </>}
            <p><strong>Puede pasar:</strong></p>
            <p className="pl-5">
              {tiposAsignacion.length > 0 ? tiposAsignacion.join(", ") : "Sin definir"}
            </p>
            {nombrado.detalles != "" && <>
              <p><strong>Observaciones:</strong></p>
              <p className="pl-5" >
                {nombrado.detalles}
              </p>
            </>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence >
  )
}
