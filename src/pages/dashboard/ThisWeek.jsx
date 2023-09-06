import React from 'react'

export default function ThisWeek() {
  return (
    <>
      <div className="p-2.5">
        <h1 className="text-2xl" >Esta semana</h1>
      </div>
      <div className='flex' >
        <div className="w-2/4 p-2.5">
          <div className="card">
            <div className="card_title">
              <h2>
                Programa para el 22 de julio de 2023
              </h2>
            </div>
            <div className="divider"></div>
            <div className="w-full flex justify-center">
              No hay datos todavía
            </div>
          </div>
        </div>
        <div className="w-1/4 p-2.5">
          <div className="card p-5">
            <h2>Matriculados asignados:</h2>
            <div className="separator"></div>
            Xxxxxxx Xxxxxx
          </div>
        </div>
        <div className="w-1/4 p-2.5">
          <div className="card p-5">
            <h2>Nombrados asignados:</h2>
            <div className="divider"></div>
          </div>
        </div>

      </div>
    </>
  )
}
