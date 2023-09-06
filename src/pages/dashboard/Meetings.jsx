import React from 'react'

export default function Meetings() {
  return (
    <>
      <div className="p-2.5">
        <h1 className="text-2xl" >Reuniones</h1>
      </div>
      <div className="flex meetings">
        <div className="w-1/3 p-2.5">
          <div className="card">
            <div className="card_title">
              <h2><b>Reuniones en este periodo:</b></h2>
              <button className="icon-button">
                <i className="fas fa-add"></i>
              </button>
            </div>
            <div className="divider"></div>
            <div className="p-16 flex flex-col items-center justify-center gap-5">
              <p>No hay reuniones agregadas a este periodo</p>
              <button className="main-button">Agregar una</button>
            </div>
          </div>
        </div>

        <div className="w-2/3 p-2.5">
          <div className="card">
            <div className="card_title">
              <h2><b>Detalles:</b></h2>
            </div>
            <div className="divider"></div>

            <div className="p-16">
              <p className="text-center" >
                Haz click en una reunión para ver y editar los detalles
              </p>
            </div>

          </div>
        </div>


      </div>
    </>
  )
}
