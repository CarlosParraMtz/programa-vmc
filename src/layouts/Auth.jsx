import { Outlet } from "react-router-dom";

export default function Auth() {
    return <div className="flex w-full" >
        <div className="lg:w-2/3 hidden bg-violet-600 lg:flex h-screen "></div>
        <div className="lg:w-1/3 w-full flex items-center justify-center  p-5 ">
            <Outlet />
        </div>
    </div>

}