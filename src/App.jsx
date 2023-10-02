import Router from './router/router'
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
