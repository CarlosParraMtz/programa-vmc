import { Outlet } from "react-router-dom";

export default function Auth() {
    return <div className="auth-layout flex w-full min-h-screen" >
        <div className="lg:w-2/3 hidden bg-violet-600 lg:flex min-h-screen "></div>
        <div className="lg:w-1/3 w-full flex items-center justify-center p-4 sm:p-5 ">
            <Outlet />
        </div>
    </div>

}
