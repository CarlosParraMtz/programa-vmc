import { useEffect } from 'react';
import Router from './router/router'
import { useRecoilState } from 'recoil'
import { userState } from './recoil/atoms'
import { checkLoginStatus } from './firebase/controllers/authController';

function App() {

  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    checkLoginStatus()
      .then(({ uid }) => {
        if (!user.signed) { setUser({ ...user, id: uid, signed: true }) }
      })
      .catch(() => { })
  }, [])

  return (<Router />)
}

export default App
