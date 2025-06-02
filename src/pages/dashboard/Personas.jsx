
export default function Personas() {
  return (
    <>
      <div className="p-2.5">
        <h1 className="text-2xl" >Personas</h1>
      </div>

      <div className="flex matriculados">
        <div className="w-1/3 p-2.5">
          <div className="card">
            <h2 className="text-lg">Nombrados</h2>
          </div>
        </div>
        <div className="w-1/3 p-2.5">
          <div className="card">
            <h2 className="text-lg">Matriculados</h2>
          </div>
        </div>
      </div>
    </>
  )
}
