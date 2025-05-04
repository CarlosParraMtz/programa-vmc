import { AnimatePresence, motion } from "framer-motion"
import IconButton from "./IconButton"

export default function Modal({ id, onClose, open, children, title, size = "lg", error = false, loading = false }) {
    const sizes = {
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        xl2: "max-w-2xl",
        xl4: "max-w-4xl",

    }
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
                        className={`
                            w-full p-5 rounded-xl shadow 
                            max-h-screen overflow-auto flex flex-col
                            bg-white 
                            ${error ? "border-y border-red-500" : ""}
                            ${sizes[size]}
                            `}
                    >
                        {!loading &&
                            <div className={`flex mb-5 items-center ${title ? "justify-between" : "justify-end"}`}>
                                {title &&
                                    <h3 className="text-xl" >{title}</h3>
                                }
                                <IconButton onClick={onClose} >
                                    <i className="fas fa-close"></i>
                                </IconButton>
                            </div>
                        }
                        {children}
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}
