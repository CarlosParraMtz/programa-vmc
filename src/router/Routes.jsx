import { useRoutes, Link } from 'react-router-dom'
import Dashboard from '../layouts/Dashboard'
import Estudiantiles from '../pages/dashboard/Estudiantiles'
import Meetings from '../pages/dashboard/Meetings'
import Programs from '../pages/dashboard/Programs'
import Personas from '../pages/dashboard/Personas'
import ThisWeek from '../pages/dashboard/ThisWeek'
import Config from '../pages/dashboard/Config'
import NotFound from '../pages/NotFound'
import Auth from '../layouts/Auth'
import Login from '../pages/auth/Login'
import CargaReuniones from '../pages/CargaReuniones'

export default function Router() {
    return useRoutes([
        {
            path: "",
            children: [
                { 
                    path: "/",
                    element: <p>nada por aquí. <Link to="/dashboard">Ir al dashboard</Link> </p> 
                },
                {
                    path: "dashboard",
                    element: <Dashboard />,
                    children: [
                        { path: "", element: <ThisWeek /> },
                        { path: "estudiantiles", element: <Estudiantiles /> },
                        { path: "reuniones", element: <Meetings /> },
                        { path: "programas", element: <Programs /> },
                        { path: "personas", element: <Personas /> },
                        { path: "config", element: <Config /> },
                    ]
                },
                {
                    path: "",
                    element: <Auth/>,
                    children: [
                        { path: "login", element: <Login /> },
                        { path: "signup", element: <></> }
                    ]
                },
                { path:"cargareuniones", element: <CargaReuniones /> },
                { path: "*", element: <NotFound /> },
            ]
        }
    ])
}
