import Router from './router/Routes'
import { Toaster } from 'react-hot-toast';
import toastOptions from './components/toastOptions'
import ModalAlert from './components/ModalAlert';
import Loader from './components/Loader';

function App() {
  return <>
    <Router />
    <Loader />
    <Toaster 
      position="bottom-right"
      toastOptions={toastOptions}
    />
    <ModalAlert />
  </>

}

export default App
