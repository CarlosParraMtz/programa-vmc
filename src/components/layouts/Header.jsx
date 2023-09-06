import React from 'react'

export default function Header() {
    return (
        <div className='header' >
            <div className="card">
                {/* <button>
                    <i class="fas fa-bars"></i>
                </button> */}
                <h3><b>Cong. Del Bosque</b></h3>

                <div className="header_periodo">
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
