import { useRoutes, Link } from 'react-router-dom'
import Dashboard from '../layouts/Dashboard'
import Elders from '../pages/dashboard/Elders'
import Estudiantiles from '../pages/dashboard/Estudiantiles'
import Meetings from '../pages/dashboard/Meetings'
import Programs from '../pages/dashboard/Programs'
import Students from '../pages/dashboard/Students'
import ThisWeek from '../pages/dashboard/ThisWeek'
import Config from '../pages/dashboard/Config'
import NotFound from '../pages/NotFound'
import Auth from '../layouts/Auth'
import Login from '../pages/auth/Login'
import ConfigureCongregation from '../pages/ConfigureCongregation'

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
                        { path: "nombrados", element: <Elders /> },
                        { path: "reuniones", element: <Meetings /> },
                        { path: "programas", element: <Programs /> },
                        { path: "matriculados", element: <Students /> },
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
                { path:"configure-congregation", element: <ConfigureCongregation /> },
                { path: "*", element: <NotFound /> },
            ]
        }
    ])
}
