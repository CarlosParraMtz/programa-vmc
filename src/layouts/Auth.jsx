import { Outlet } from "react-router-dom";

export default function Auth() {
    return <div className="flex w-full" >
        <div className="w-2/3 bg-violet-600 d-none lg:d-flex h-screen "></div>
        <div className="lg:w-1/3 w-full flex items-center justify-center h-100 p-10 ">
            <Outlet />
        </div>
    </div>

}