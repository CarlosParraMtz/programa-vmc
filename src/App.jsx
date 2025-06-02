import Router from './router/Router'
import { Toaster } from 'react-hot-toast';
import toastOptions from './components/toastOptions'
import ModalAlert from './components/ModalAlert';

function App() {
  return <>
    <Router />
    <Toaster 
      position="bottom-right"
      toastOptions={toastOptions}
    />
    <ModalAlert />
  </>

}

export default App
