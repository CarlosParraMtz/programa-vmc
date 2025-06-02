// components/ModalAlert.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { useRecoilState } from 'recoil';
import { modal as modalState } from '../recoil/atoms';


const btnVariants = {
  success: "main",
  error: "error"
}

const variants = {
  success: "fas fa-check text-green-500",
  error: "fas fa-xmark text-red-400"
}

export default function ModalAlert() {
  const [modal, setModal] = useRecoilState(modalState);

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const handleConfirm = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
    }
    closeModal();
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
          bg-gray-800 text-white px-5 py-5 rounded-2xl mx-auto my-auto fixed 
          w-full max-w-xs flex flex-col items-center gap-4 text-center
          '
          >
            <i className={` text-4xl ${variants[modal.variant]}`} />
            <h2 className='text-xl font-bold'>{modal.title}</h2>
            <p className='text-sm'>{modal.text}</p>
            <button
              className={` btn ${btnVariants[modal.variant]} w-full`}
              onClick={handleConfirm}
            >
              {modal.textButton}
            </button>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>
  );
}
