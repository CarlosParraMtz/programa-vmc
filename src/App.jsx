import Router from './router/Router'
import { Toaster } from 'react-hot-toast';
import toastOptions from './components/toastOptions'

function App() {
  return <>
    <Router />
    <Toaster 
      position="bottom-right"
      toastOptions={toastOptions}
    />
  </>

}

export default App
