import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

export default function NombradoCollapse(nombrado) {
  const [open, setOpen] = useState(false)

  return (
    <AnimatePresence>
      <motion.div
        key={nombrado.id}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
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
            <p>Carlos Parra</p>
          </div>
          <motion.i
            animate={{ rotateZ: open ? 180 : 0 }}
            className="fas fa-caret-down px-2"
          ></motion.i>
        </div>
        <motion.div
          animate={{ height: open ? "auto" : 0 }}
          className="flex flex-col w-full overflow-hidden">
          <div className="p-5 border-t">
            <p className="text-purple-500 text-xl mb-2" >
              <strong>Anciano</strong>
            </p>
            <p><strong>Última asignación:</strong></p>
            <p className="pl-5" >
              Presidir - 24 de mayo de 2025
            </p>
            <p><strong>Observaciones:</strong></p>
            <p className="pl-5" >
              Prefiere pasar con menor frecuencia que el resto,
              ya que le cuesta trabajo pasar a la plataforma.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
