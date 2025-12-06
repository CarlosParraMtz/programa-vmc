import Input from "../common/Input";
import Modal from '../common/Modal';
import { useState } from "react";
import { motion } from "framer-motion";
import atoms from "../../jotai/atoms";
import { useAtomValue } from "jotai";
import CrudNombrados from "./CrudNombrados";
import CrudMatriculados from "./CrudMatriculados";

export default function TableroEdicion({ useReunion }) {
  if (import.meta.env.NODE_ENV == 'uip') console.log(motion);
  const [reunion, setReunion] = useReunion;
  const [modalSelectCancion, setModalSelectCancion] = useState(null)
  const [modalPersonas, setModalPersonas] = useState(null)
  const [personasPage, setPersonasPage] = useState('NOMBRADOS')
  const nombrados = useAtomValue(atoms.nombrados)
  const matriculados = useAtomValue(atoms.matriculados)

  const abrirModalPersonas = (asignacion) => setModalPersonas(asignacion)
  const cerrarModalPersonas = () => setModalPersonas(null)

  const handleChange = (index, key, newValue) => {
    const asignacion = reunion.asignaciones[index];
    asignacion[key] = newValue;

    let asignaciones = [...reunion.asignaciones];
    asignaciones.splice(index, 1, asignacion);

    setReunion({
      ...reunion,
      asignaciones
    });
  }

  const bgs = {
    "1": "bg-[#3c7f8b22]",
    "2": "bg-[#d68f0022]",
    "3": "bg-[#bf2f1322]",
  }


  const seleccionarCancion = (cancion, seccion) => {
    const _canciones = [...reunion.canciones]
    _canciones.splice(seccion, 1, cancion)
    setReunion({ ...reunion, canciones: _canciones })
    setModalSelectCancion(null)
  }

  const agregarAsignacion = () => {
    const _asignaciones = [...reunion.asignaciones]
    _asignaciones.push({
      asignado: "",
      duracion: "",
      seccion: 3,
      titulo: "",
      video: false
    })
    setReunion({ ...reunion, asignaciones: _asignaciones })
  }

  const eliminarAsignacion = (index) => {
    const _asignaciones = [...reunion.asignaciones]
    _asignaciones.splice(index, 1)
    setReunion({ ...reunion, asignaciones: _asignaciones })
  }

  const checkVideo = (index) => {
    const _asignaciones = [...reunion.asignaciones]
    const _asignacion = { ...reunion.asignaciones[index] }
    _asignaciones.splice(index, 1, { ..._asignacion, video: !reunion.asignaciones[index].video })
    setReunion({ ...reunion, asignaciones: _asignaciones })
  }

  function getItems(seccion) {
    return reunion.asignaciones.map((asignacion, index) => {
      if (asignacion.seccion != seccion) return null;
      return (<div key={index}
        className={`
                flex flex-col items-center gap-0 w-full p-2 
              `}
      >
        <div className="flex flex-col w-full p-5 gap-2 bg-[#ffffff77] rounded-r-xl " >
          <div className="flex justify-between items-center" >
            <h3 className="text-xl font-bold">{index + 1}</h3>
            {asignacion.seccion === 3 &&
              <div className="" >
                <button onClick={() => eliminarAsignacion(index)}
                  className="w-8 h-8 bg-white text-gray-600 hover:text-purple-600 rounded-full"
                >
                  <i className="fas fa-trash" ></i>
                </button>
              </div>
            }
          </div>
          <Input
            label="Título"
            fullwidth
            name={`titulo-input-${index}`}
            value={reunion.asignaciones[index].titulo}
            onChange={e => handleChange(index, "titulo", e.target.value)}
          />
          <label htmlFor={`descripcion-input-${index}`} className="mb-0 text-sm font-medium text-gray-900">
            Fuente de información / Tipo
          </label>
          <textarea
            id={`descripcion-input-${index}`}
            value={reunion.asignaciones[index].descripcion || ""}
            onChange={e => handleChange(index, "descripcion", e.target.value)}
            placeholder="Descripción de la asignación"
            rows={5}
            className={`
              resize-none rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 
              text-sm focus:ring-purple-500 focus:outline-purple-500 caret-purple-300 
              w-full p-2.5 -mt-2
            `}
          ></textarea>
          <div className="flex items-center" >
            <div className="flex-1">
              <Input
                label="Duración"
                fullwidth
                name={`duracion-input-${index}`}
                value={reunion.asignaciones[index].duracion}
                onChange={e => handleChange(index, "duracion", e.target.value)}
              />
            </div>
            <span className="mt-5 ml-2">mins.</span>
          </div>
          <div className="flex flex-col gap-5" >
            {
              asignacion.seccion === 3 &&
              <div className="flex items-center justify-between lg:justify-start gap-5">
                <p>Video:</p>
                <div className="h-10 flex flex-col gap-5">

                  <label
                    htmlFor={`video-input-${index}`}
                    className={
                      `h-10 w-16 mb-2 rounded-full 
                      flex items-center p-1 cursor-pointer transition-colors 
                      ${reunion.asignaciones[index].video
                        ? "justify-end bg-gray-100 hover:bg-white"
                        : "justify-start bg-gray-400 hover:bg-gray-300"
                      }`}
                  >
                    <motion.div
                      layout="position"
                      layoutId={`checkbox-video-${index}`}
                      transition={{ type: "spring" }}
                      className={`
                          h-8 w-8 rounded-full transition-colors 
                          flex items-center justify-center overflow-hidden
                          ${reunion.asignaciones[index].video
                          ? "bg-purple-400 text-white"
                          : "bg-white text-gray-400 "
                        }
                          `}
                    >
                      <motion.i
                        animate={{
                          opacity: reunion.asignaciones[index].video ? 1 : 0.1,
                          x: reunion.asignaciones[index].video ? 1 : -30
                        }}
                        transition={{ type: "spring" }}
                        className="fas fa-play  " ></motion.i>
                    </motion.div>
                  </label>
                  <input
                    checked={reunion.asignaciones[index]}
                    onChange={() => checkVideo(index)}
                    type="checkbox"
                    className="hidden"
                    id={`video-input-${index}`}
                  />
                </div>
              </div>
            }

            <div className="w-full">
              <p>Asignado</p>
              <button onClick={() => abrirModalPersonas(index)}
                className="px-5 bg-gray-100 hover:bg-white py-2 rounded-full w-full"
              >
                No se ha seleccionado
              </button>
            </div>
            {asignacion.seccion === 2 &&
              <div>
                <p>Ayudante</p>
                <button onClick={() => abrirModalPersonas(index)}
                  className="px-5 bg-gray-100 hover:bg-white w-full py-2 rounded-full">
                  No se ha seleccionado
                </button>
              </div>
            }
          </div>
        </div>

      </div>)
    })
  }

  const agregarNombrado = (nombrado) => {
    console.log(nombrado)
  }

  return (
    <div className="w-full rounded-xl py-5">


      <div className="bg-program-treasures w-full text-white px-5 py-2 rounded-t-lg font-thin text-md " >
        Tesoros de la Biblia
      </div>
      <div className={`${bgs[1]}`}>
        <div className={`flex flex-col justify-between`}>

          <div className="flex flex-col gap-2 items-start px-5 my-2">
            <strong>Presidente:</strong>
            <button onClick={() => abrirModalPersonas('presidente')}
              className="px-5 py-2 bg-gray-100 hover:bg-white rounded-md w-full text-gray-500" >
              No se ha seleccionado
            </button>
          </div>

          <div className="flex flex-col gap-2 px-5">
            <strong>Presidente de la sala B:</strong>
            <button onClick={() => abrirModalPersonas('presidenteB')}
              className="px-5 py-2 bg-gray-100 w-full hover:bg-white rounded-md text-gray-500" >
              No se ha seleccionado
            </button>
          </div>

          <div className="block">
            <span className="flex gap-5 items-center justify-between p-5" >
              <strong>Canción</strong>
              <button
                className="px-10 py-2 bg-gray-50 border border-purple-400 rounded-md text-gray-500"
                onClick={() => setModalSelectCancion(0)}
              >
                {reunion.canciones[0]}
              </button>
            </span>
          </div>

        </div>

        {getItems(1)}
      </div>



      <div className="bg-program-teachers w-full text-white px-5 py-2 font-thin text-md " >
        Seamos mejores maestros
      </div>
      <div className={bgs[2]} >
        {getItems(2)}
      </div>



      <div className="bg-program-life w-full text-white px-5 py-2 font-thin text-md " >
        Nuestra vida cristiana
      </div>
      <div className={bgs[3]} >
        <div className="block">
          <span className="flex justify-between gap-5 items-center p-5" >
            <strong>Canción</strong>
            <button
              className="px-5 py-2 bg-gray-50 border border-purple-400 rounded-md text-gray-500"
              onClick={() => setModalSelectCancion(1)}
            >
              {reunion.canciones[1]}
            </button>
          </span>
        </div>
        {getItems(3)}
        <button
          className="btn error mx-auto mt-5"
          onClick={agregarAsignacion}
        >
          Agregar una asignación
        </button>
        <div className="block">
          <span className="flex justify-between gap-5 items-center px-5 mt-5" >
            <strong>Canción</strong>
            <button
              className="px-5 py-2 bg-gray-50 border border-purple-400 rounded-md text-gray-500"
              onClick={() => setModalSelectCancion(2)}
            >
              {reunion.canciones[2]}
            </button>
          </span>
        </div>
        <div className="flex flex-col gap-2 items-start px-5 pb-6">
          <strong>Oración final:</strong>
          <button onClick={() => abrirModalPersonas('presidente')}
            className="px-5 py-2 bg-gray-100 hover:bg-white rounded-md w-full text-gray-500" >
            No se ha seleccionado
          </button>
        </div>
      </div>


      {/* Modal para seleccionar canciones */}
      <Modal
        title={modalSelectCancion === 0
          ? "Selecciona una canción de inicio"
          : modalSelectCancion === 1
            ? "Selecciona una canción de intermedio"
            : modalSelectCancion === 2
              ? "Selecciona una canción final"
              : "Selecciona una canción"
        }
        size="md"
        open={modalSelectCancion != null}
        onClose={() => setModalSelectCancion(null)}
      >
        <div className="grid grid-cols-6 bg-gray-200 gap-2 max-h-[300px] overflow-auto p-3">
          {modalSelectCancion != null &&
            Array.from({ length: 161 }, (_, i) => i + 1)
              .map(cancion =>
                <button key={cancion}
                  onClick={() => seleccionarCancion(cancion, modalSelectCancion)}
                  className={`
                     shadow-md hover:bg-gray-100  p-3
                    ${reunion.canciones[modalSelectCancion] === cancion
                      ? "bg-purple-500 text-white"
                      : "bg-gray-50 text-gray-700"}
                    `}
                >
                  {cancion}
                </button>
              )
          }
        </div>
        <div className="flex justify-end mt-3">
          <button className="btn error" onClick={() => setModalSelectCancion(null)}>
            cerrar
          </button>
        </div>
      </Modal>

      {/* Modal para seleccionar asignado */}
      <Modal
        title="Selecciona una persona de la lista"
        open={modalPersonas != null}
        onClose={cerrarModalPersonas}
        size="xl4"
      >
        <div className="flex justify-start" >
          <button
            className={`btn tab ${personasPage === "NOMBRADOS" ? "active" : ""} relative`}
            onClick={() => setPersonasPage('NOMBRADOS')}
          >
            Nombrados
          </button>
          <button
            className={`btn tab ${personasPage === 'MATRICULADOS' ? "active" : ""}`}
            onClick={() => setPersonasPage('MATRICULADOS')}
          >
            Estudiantes
          </button>
        </div>
        {
          personasPage === 'NOMBRADOS' &&
          <div className="p-5 ">
            {(!nombrados || (nombrados && nombrados.length === 0)) &&
              <div className="p-5 rounded-lg border-dashed border-2 border-purple-300" >
                <p className="text-center text-gray-700">
                  No hay nombrados agregados. Ve a la sección de nombrados para administrar la lista.
                </p>
              </div>
            }
            {(nombrados && nombrados.length > 0) && <CrudNombrados agregarNombrado={agregarNombrado} />}

          </div>
        }
        {
          personasPage === 'MATRICULADOS' &&
          <div className="p-5">
            {(!matriculados || (matriculados && matriculados.length === 0)) &&
              <div className="p-5 rounded-lg border-dashed border-2 border-purple-300" >
                <p className="text-center text-gray-700">
                  No hay matriculados agregados. Ve a la sección de matriculados para administrar la lista.
                </p>
              </div>
            }
            {(matriculados && matriculados.length > 0) && <CrudMatriculados />}

          </div>
        }


      </Modal>
    </div>
  )
}
