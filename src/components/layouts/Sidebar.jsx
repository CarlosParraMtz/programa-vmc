import { NavLink } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import atoms from '../../recoil/atoms';

export default function Sidebar({ useOpen }) {

    const [open, setOpen] = useOpen;
    const user = useRecoilValue(atoms.user)

    return (
        <div className={`sidebar ${open ? "open" : ""}`}>
            <div className="card">
                <div>
                    <button onClick={() => setOpen(!open)} >
                        <i className="fas fa-bars"></i>
                    </button>

                    <div className="separator"></div>

                    {user.perfil != null &&
                        <nav className='sidebar_nav' >
                            <NavLink className='sidebar_link' to="/dashboard" end >
                                <div className="sidebar_link-icon">
                                    <i className="fas fa-users"></i>
                                </div>

                                <div className="sidebar_link-text">
                                    <span>Próxima reunión</span>
                                </div>
                            </NavLink>
                            <NavLink className='sidebar_link' to="/dashboard/programas" >
                                <div className="sidebar_link-icon">
                                    <i className="far fa-calendar-alt"></i>
                                </div>
                                <div className="sidebar_link-text">
                                    <span>Programas</span>
                                </div>
                            </NavLink>
                            <NavLink className='sidebar_link' to="/dashboard/reuniones" >
                                <div className="sidebar_link-icon">
                                    <i className="fas fa-chalkboard-teacher"></i>
                                </div>
                                <div className="sidebar_link-text">
                                    <span>Reuniones</span>
                                </div>
                            </NavLink>
                            <NavLink className='sidebar_link' to="/dashboard/estudiantiles" >
                                <div className="sidebar_link-icon">
                                    <i className="fas fa-user-graduate"></i>
                                </div>
                                <div className="sidebar_link-text">
                                    <span>Estudiantiles</span>
                                </div>
                            </NavLink>
                            <NavLink className='sidebar_link' to="/dashboard/matriculados" >
                                <div className="sidebar_link-icon">
                                    <i className="fas fa-address-book"></i>
                                </div>
                                <div className="sidebar_link-text">
                                    <span>Matriculados</span>
                                </div>
                            </NavLink>
                            <NavLink className='sidebar_link' to="/dashboard/nombrados" >
                                <div className="sidebar_link-icon">
                                    <i className="fas fa-book-reader"></i>
                                </div>
                                <div className="sidebar_link-text">
                                    <span>Nombrados</span>
                                </div>
                            </NavLink>
                        </nav>
                    }
                </div>

                <div>
                    <div className="separator"></div>
                    <NavLink className='sidebar_link' to="/dashboard/config" >
                        <div className="sidebar_link-icon">
                            <i className="fas fa-cog"></i>
                        </div>

                        <div className="sidebar_link-text">
                            <span>Configuración</span>
                        </div>
                    </NavLink>
                </div>
            </div>

        </div>
    )
}
