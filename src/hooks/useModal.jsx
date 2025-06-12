import { useSetRecoilState } from "recoil";
import { modal } from '../recoil/atoms';

export default function useModal() {
  const setModal = useSetRecoilState(modal);

  const modalSuccess = (options) => {
    setModal({
      isOpen: true,
      variant: 'success',
      icon: 'check',
      title: options.title || 'Listo',
      text: options.text || 'texto genérico',
      textButton: options.textButton || 'Aceptar',
      textButton2: options.textButton2 || null,
      onConfirm: options.onConfirm || null,
      skipClose: options.skipClose || false,
      modalLoading: false,
    });
  };

  const modalError = (options) => {
    setModal({
      isOpen: true,
      variant: 'error',
      icon: 'error',
      title: options.title || 'Error',
      text: options.text || 'texto genérico',
      textButton: options.textButton || 'Aceptar',
      textButton2: options.textButton2 || null,
      onConfirm: options.onConfirm || null,
      skipClose: options.skipClose || false,
      modalLoading: false,
    });
  };

  const modalConfirm = (options) => {
    setModal({
      isOpen: true,
      variant: options.variant || 'purple',
      icon: options.icon || 'info',
      title: options.title || 'Título',
      text: options.text || '',
      textButton: options.textButton || 'Aceptar',
      textButton2: options.textButton2 || null,
      onConfirm: options.onConfirm || null,
      skipClose: options.skipClose || false,
      modalLoading: false,
    });
  };

  const modalLoading = () => setModal(prev => ({
    ...prev,
    loading: true,
    onConfirm: null,  // Esto es importante
    isOpen: true      // Asegurar que se muestre
  }));

  return { modalSuccess, modalError, modalConfirm, modalLoading }
}