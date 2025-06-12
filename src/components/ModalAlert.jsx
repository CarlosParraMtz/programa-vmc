// components/ModalAlert.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { useRecoilState } from 'recoil';
import { modal as modalState } from '../recoil/atoms';
import { LoaderIcon } from 'react-hot-toast';


const btnVariants = {
  success: "main",
  error: "error",
  purple: "main"
}

const variants = {
  success: "text-green-500",
  error: "text-red-400",
  purple: "text-purple-400"
}

const icons = {
  check: "fas fa-check",
  error: "fas fa-xmark",
  info: "far fa-circle-question"
}

export default function ModalAlert() {
  const [modal, setModal] = useRecoilState(modalState);

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const handleConfirm = async () => {
    // Guardamos la función onConfirm antes de limpiar el estado
    const confirmFn = modal.onConfirm;

    // Cerramos el modal inmediatamente
    setModal({
      isOpen: false,
      variant: 'success',
      icon: 'info',
      title: '',
      text: '',
      textButton: 'OK',
      textButton2: null,
      onConfirm: null,
      skipClose: false,
      loading: false
    });

    // Ejecutamos la función de confirmación si existe
    if (confirmFn) {
      await confirmFn(); // Añadimos await por si es una función async
    }
  };

  return (
    <AnimatePresence >
      {
        modal.isOpen &&

        <motion.div
          key="modal-alert-generic-bg"
          initial="closed"
          animate="open"
          exit="closed"
          variants={{
            open: { opacity: 1 },
            closed: { opacity: 0 },
          }}
          className='w-screen h-screen bg-[#00000044] z-50 inset-0 fixed top-0 left-0 flex items-center justify-center px-5'
        >
          <motion.div
            key="modal-alert-generic"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: { opacity: 1, y: 0 },
              closed: { opacity: 0, y: -30 },
            }}
            className='
          bg-gray-800  px-5 py-5 rounded-2xl mx-auto my-auto fixed 
          w-full max-w-xs flex flex-col items-center gap-4 text-center
          '
          >
            {modal.loading
              ? <div className='h-[200px] flex-centered flex items-center justify-center'>
                <LoaderIcon className='w-[100px] h-[100px] border-8 border-purple-400 border-l-purple-300 ' />
              </div>
              : <>
                <i className={` text-4xl ${icons[modal.icon]} ${variants[modal.variant]}`} />
                <h2 className='text-xl text-white font-bold'>{modal.title}</h2>
                <p className='text-sm text-white'>{modal.text}</p>
                <div className={`grid w-full gap-2 ${modal.onConfirm ? "grid-cols-2" : "grid-cols-1"}`}>
                  {
                    (modal.onConfirm) &&
                    <button
                      className={` btn ${btnVariants[modal.variant]} w-full`}
                      onClick={handleConfirm}
                    >
                      {modal.textButton}
                    </button>
                  }
                  <button
                    className={(modal.onConfirm)
                      ? "btn bg-gray-200 text-gray"
                      : ` btn ${btnVariants[modal.variant]} w-full`}
                    onClick={closeModal}
                  >
                    {modal.onConfirm ? "Cancelar" : modal.textButton}
                  </button>
                </div>
              </>
            }

          </motion.div>
        </motion.div>
      }
    </AnimatePresence>
  );
}
