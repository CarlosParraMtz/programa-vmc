import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { loader } from "../jotai/atoms";
import "./Loader.scss";

export default function Loader() {
  const isLoading = useAtomValue(loader);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="app-loader"
          className="app-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="status"
          aria-live="polite"
          aria-label="Cargando"
        >
          <motion.div
            className="app-loader__panel"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
          >
            <div className="app-loader__mark" aria-hidden="true">
              <span className="app-loader__ring app-loader__ring--outer" />
              <span className="app-loader__ring app-loader__ring--middle" />
              <span className="app-loader__ring app-loader__ring--inner" />
              <span className="app-loader__spark app-loader__spark--one" />
              <span className="app-loader__spark app-loader__spark--two" />
              <span className="app-loader__spark app-loader__spark--three" />
            </div>
            <p>Cargando</p>
            <div className="app-loader__dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
