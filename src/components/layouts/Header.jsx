export default function Header({setOpen}) {
    return (
        <div className='header' >
            <div className="card">
                <button
                    onClick={() => setOpen(true)}
                    className='hover:bg-gray-200 md:hidden rounded-full flex items-center justify-center h-10 w-10'
                >
                    <i className="fas fa-bars"></i>
                </button>
                <h3><b>Cong. Del Bosque</b></h3>

                <div className="hidden">
                    <label htmlFor="periodo-select">Período:</label>
                    <select id="periodo-select">
                        <option value="id-periodo">Julio 2023</option>
                        <option value="id-periodo2">Agosto 2023</option>
                        <option value="id-periodo3">Septiembre 2023</option>
                    </select>

                </div>
            </div>
        </div>
    )
}
