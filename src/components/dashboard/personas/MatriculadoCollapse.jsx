import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import useModal from "../../../hooks/useModal"

export default function MatriculadoCollapse({ matriculado, onDelete = () => { }, onEdit = () => { } }) {
  const [open, setOpen] = useState(false)
  const { modalConfirm } = useModal()

  return (
    <AnimatePresence>
      <motion.div
        key={matriculado.id}
        initial={{ opacity: 0, }}
        animate={{ opacity: 1, }}
        exit={{ opacity: 0, }}
        className="bg-gray-50 shadow border flex flex-col rounded-lg [&:not(:last-child)]:mb-1"
      >
        <div className="flex justify-between items-center p-2 cursor-pointer hover:bg-purple-100"
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center gap-2">
            <span className="
              w-8 h-8 rounded-full bg-purple-300 text-purple-700 
              flex items-end overflow-hidden justify-center text-2xl
            " >
              <i className="fas fa-user"></i>
            </span>
            <p>{matriculado.nombre}</p>
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
          <div className="p-5 border-t">
            <div className="flex justify-between items-end mb-5 ">
              <p className="text-purple-500 text-xl" >
                <strong>{matriculado.genero === 1 ? "Hombre" : "Mujer"}</strong>
              </p>
              <div className="flex gap-2" >
                <button className="btn main w-12" onClick={() => onEdit(matriculado)} >
                  <i className="fas fa-pencil"></i>
                </button>
                <button className="btn error w-12" onClick={() => modalConfirm({
                  title: "¿Seguro que desea borrar este nombrado?",
                  icon: 'info',
                  text: matriculado.nombre,
                  textButton: "Borrar",
                  onConfirm: () => onDelete(matriculado.id, matriculado.nombre),
                  skipClose: true,
                })} >
                  <i className="fas fa-xmark"></i>
                </button>
              </div>
            </div>
            {matriculado.ultimaAsignacion &&
              <>
                <p><strong>Última asignación:</strong></p>
                <p className="pl-5" >
                  Presidir - 24 de mayo de 2025
                </p>
              </>}
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
