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
            className="app-loader__content"
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
          >
            <div className="app-loader__mark" aria-hidden="true">
              <span className="app-loader__halo" />
              <span className="app-loader__orbit" />
              <i className="fas fa-calendar-alt app-loader__icon app-loader__icon--calendar" />
              <i className="fas fa-users app-loader__icon app-loader__icon--people" />
              <i className="fas fa-book-open app-loader__icon app-loader__icon--book" />
            </div>
            <p>Cargando...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
