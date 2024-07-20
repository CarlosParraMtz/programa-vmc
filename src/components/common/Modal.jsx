import { AnimatePresence, motion } from "framer-motion"
import IconButton from "./IconButton"

export default function Modal({ id, onClose, open, children }) {
    return (
        <AnimatePresence>
            {open &&
                <motion.div
                    key={`bg-${id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-[#00000074] h-screen w-screen fixed top-0 left-0 z-50 flex items-center justify-center"
                >
                    <motion.div
                        key={id}
                        initial={{ opacity: 0, y: -25 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -25 }}
                        className="w-full max-w-lg p-5 rounded-xl bg-white shadow max-h-screen overflow-auto flex flex-col"
                    >
                        <div className="flex justify-end mb-5">
                            <IconButton onClick={onClose} >
                                <i className="fas fa-close"></i>
                            </IconButton>
                        </div>
                        {children}
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}
