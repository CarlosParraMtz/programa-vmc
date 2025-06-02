import { useSetRecoilState } from "recoil";
import { modal } from '../recoil/atoms';

export default function useModal() {
  const setModal = useSetRecoilState(modal);

  const modalSuccess = (options) => {
    setModal({
      isOpen: true,
      variant: 'success',
      title: options.title || 'Listo',
      text: options.text || 'texto genérico',
      textButton: options.textButton || 'Aceptar',
      textButton2: options.textButton2 || null,
      onConfirm: options.onConfirm || null
    });
  };

  const modalError = (options) => {
    setModal({
      isOpen: true,
      variant: 'error',
      title: options.title || 'Error',
      text: options.text || 'texto genérico',
      textButton: options.textButton || 'Aceptar',
      textButton2: options.textButton2 || null,
      onConfirm: options.onConfirm || null
    });
  };

  return { modalSuccess, modalError }
}