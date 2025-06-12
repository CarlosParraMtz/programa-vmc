import { useRecoilValue } from "recoil"
import atoms from "../../recoil/atoms"


export default function CrudNombrados() {
  const nombrados = useRecoilValue(atoms.nombrados)

  return (
    <div className="max-w-4xl overflow-auto">
      <table className="w-full">
        <thead className="relative">
          <tr className="
          sticky left-0
          [&>]:bg-gray-300
          [&>*:not(:first-child)]:min-w-[100px] 
          ">
            <td className="min-w-[200px]">Nombre</td>
            <td>Presidente</td>
            <td>Sala aux.</td>
            <td>Tesoros</td>
            <td>Perlas</td>
            <td>Análisis</td>
            <td>Estudio</td>
            <td>Necesidades</td>
            <td>Observaciones</td>
          </tr>
        </thead>
        <tbody
          className="
            [&>*]:nada
            
            [&>*:not(:last-child)]:border-gray-700
          ">
          {
            nombrados.map(nombrado => <tr key={nombrado.id}
              onClick={()=>alert("se ha clickado", nombrado.nombre)}
              className="
                [&>*]:py-2
                [&>*:not(:last-child)]:px-2
                [&>*]:text-xs
                odd:bg-gray-200
                even:bg-gray-50
                hover:bg-purple-200
                cursor-pointer
              "
            >
              <td>{nombrado.nombre}</td>
              <td>{nombrado.ultimasAsignacaiones?.presidente[0] || "Sin fecha"}</td>
              <td>{nombrado.ultimasAsignacaiones?.salaAux[0] || "Sin fecha"}</td>
              <td>{nombrado.ultimasAsignacaiones?.tesoros[0] || "Sin fecha"}</td>
              <td>{nombrado.ultimasAsignacaiones?.perlas[0] || "Sin fecha"}</td>
              <td>{nombrado.ultimasAsignacaiones?.analisis[0] || "Sin fecha"}</td>
              <td>{nombrado.ultimasAsignacaiones?.estudio[0] || "Sin fecha"}</td>
              <td>{nombrado.ultimasAsignacaiones?.necesidades[0] || "Sin fecha"}</td>
              <td className="text-ellipsis">{nombrado.detalles}</td>
            </tr>)
          }
        </tbody>
      </table>
    </div>
  )
}
