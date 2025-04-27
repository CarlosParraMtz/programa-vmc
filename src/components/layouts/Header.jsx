import { useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import atoms from "../../recoil/atoms"
import Modal from "../common/Modal"
import IconButton from "../common/IconButton"
import { Link } from "react-router-dom"
export default function Header({ setOpen }) {
    const congregacion = useRecoilValue(atoms.congregacion)
    const user = useRecoilValue(atoms.user)
    const programas = useRecoilValue(atoms.programas)
    const [periodo, setPeriodo] = useRecoilState(atoms.periodo)

    const [modalSetPeriodo, setModalSetPeriodo] = useState(false)
    const abrirModalPeriodo = () => setModalSetPeriodo(true)
    const cerrarModalPeriodo = () => setModalSetPeriodo(false)
    const seleccionarPeriodo = (periodo) => {
        setPeriodo(periodo)
        cerrarModalPeriodo()
    }

    const NoHayProgramas = () => (
        <div className="w-full p-5 flex flex-col items-center gap-5" >
            <p>No hay periodos agregados.</p>
            <Link to="/dashboard/programas" >
                <button className="btn main">Administrar programas</button>
            </Link>
        </div>
    )

    return (<>
        <div className='header' >
            <div className="card">
                <button
                    onClick={() => setOpen(true)}
                    className='hover:bg-gray-200 md:hidden rounded-full flex items-center justify-center h-10 w-10'
                >
                    <i className="fas fa-bars"></i>
                </button>
                <div className="flex gap-10">
                    {
                        congregacion &&
                        <h3><b>Cong. {congregacion.nombre}</b></h3>
                    }
                    {
                        user && <span>{user.perfil.nombre}</span>
                    }
                </div>

                <div className="flex items-center gap-3">
                    <h3 className="font-semibold ">Período:</h3>
                    {
                        periodo
                            ? <p>{periodo.periodo}</p>
                            : <p>Ninguno</p>
                    }
                    <IconButton onClick={abrirModalPeriodo} >
                        <i className="fas fa-repeat"></i>
                    </IconButton>
                </div>
            </div>
        </div>
        <Modal id="seleccionar-periodo-header"
            open={modalSetPeriodo}
            onClose={cerrarModalPeriodo}
            title="Seleccionar periodo"
        >
            {
                !programas
                    ? <NoHayProgramas />

                    : (programas && programas.length === 0)
                        ? <NoHayProgramas />
                        : <ul className="flex flex-col gap-2 mb-5" >
                            {programas.map(programa =>
                                <li key={programa.id}
                                    onClick={() => seleccionarPeriodo(programa)}
                                    className={`bg-gray-100 hover:bg-gray-200 p-3 rounded cursor-pointer
                                        ${periodo && periodo.id === programa.id ? "bg-purple-200 hover:bg-purple-100" : ""}
                                    `}
                                >
                                    {programa.periodo}
                                </li>)}
                        </ul>
            }


            <div className="flex justify-end gap-3" >
                <button className="btn error" onClick={cerrarModalPeriodo}>Cancelar</button>
                <Link to="/dashboard/programas" >
                    <button onClick={cerrarModalPeriodo} className="btn main">Administrar programas</button>
                </Link>
            </div>
        </Modal>
    </>
    )
}
