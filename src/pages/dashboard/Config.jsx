import { useState } from "react"
import { useRecoilState } from "recoil"
import atoms from '../../recoil/atoms'
import Input from "../../components/common/Input"
import Tooltip from "../../components/common/Tooltip"


export default function Config() {

  const [user, setUser] = useRecoilState(atoms.user)
  const [edicion, setEdicion] = useState(false)

  return (
    <>
      <div className="p-2.5 flex gap-3">
        <h1 className="text-2xl" >Configuración</h1>
        <Tooltip title="Editar opciones" >
          <button className="icon-button">
            <i className="fas fa-edit"></i>
          </button>
        </Tooltip>
      </div>
      <div className="flex">
        <div className="w-1/2 p-2.5">
          <div className="card">
            <div className="card_title">
              <h2><b>Perfil:</b></h2>
            </div>
            <div className="divider"></div>
            {
              !edicion
              && <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <b>Nombre:</b>
                  <span>Carlos Parra</span>
                </div>
                <div className="flex gap-2">
                  <b>Email:</b>
                  <span>test@test.com</span>
                </div>
                <div className="flex gap-2">
                  <b>Congregación:</b>
                  <span>Del bosque</span>
                </div>
              </div>
            }
          </div>
        </div>
        <div className="w-1/2 p-2.5">
          <div className="card">
            <div className="card_title">
              <h2><b>Congregación:</b></h2>
            </div>
            <div className="divider"></div>
            {
              edicion
              && <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <b>Nombre:</b>
                  <span>Del Bosque</span>
                </div>
                <div className="flex gap-2">
                  <b>Ciudad:</b>
                  <span>Xalapa</span>
                </div>
                <div className="flex gap-2">
                  <b>País:</b>
                  <span>México</span>
                </div>
                <div className="flex gap-2">
                  <b>Código de congregación:</b>
                  <span>acbcasasasdasdas1231d</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </>
  )
}
