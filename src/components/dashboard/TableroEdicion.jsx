import Input from "../common/Input";
import Modal from '../common/Modal';
import { useState } from "react";
import { motion } from "framer-motion";
import atoms from "../../jotai/atoms";
import { useAtomValue } from "jotai";
import CrudNombrados from "./CrudNombrados";
import CrudMatriculados from "./CrudMatriculados";

export default function TableroEdicion({ useReunion }) {
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
                flex items-center gap-0 w-full p-2 
              `}
      >
        <div className=" border-r border-gray-500 w-12 self-stretch flex items-center justify-center" >
          <h3 className="text-xl font-bold">{index + 1}</h3>
        </div>
        <div className="flex flex-col w-full p-5 gap-2 bg-[#ffffff77] rounded-r-xl " >
          <Input
            label="Título"
            fullwidth
            name={`titulo-input-${index}`}
            value={reunion.asignaciones[index].titulo}
            onChange={e => handleChange(index, "titulo", e.target.value)}
          />
          <div className="flex gap-2" >
            <div className="flex w-1/4 items-center" >
              <div className="w-1/3">
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
            <div className="flex items-end w-3/4 gap-5" >
              {
                asignacion.seccion === 3 &&
                <div>
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

              <div>
                <p>Asignado</p>
                <button onClick={() => abrirModalPersonas(index)}
                  className="px-5 bg-gray-100 hover:bg-white w-fit py-2 rounded-full"
                >
                  No se ha seleccionado
                </button>
              </div>
              {asignacion.seccion === 2 &&
                <div>
                  <p>Ayudante</p>
                  <button onClick={() => abrirModalPersonas(index)}
                    className="px-5 bg-gray-100 hover:bg-white w-fit py-2 rounded-full">
                    No se ha seleccionado
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
        {asignacion.seccion === 3 &&
          <div className="h-full self-stretch " >
            <button onClick={() => eliminarAsignacion(index)}
              className="w-8 h-8 bg-white text-gray-600 hover:text-purple-600 rounded-full"
            >
              <i className="fas fa-trash" ></i>
            </button>
          </div>
        }
      </div>)
    })
  }



  return (
    <div className="w-full px-2 rounded-xl py-5">


      <div className="bg-program-treasures w-full text-white px-5 py-2 rounded-t-lg font-thin text-md " >
        Tesoros de la Biblia
      </div>
      <div className={`${bgs[1]}`}>
        <div className={`flex justify-between`}>
          <div className="block">
            <span className="flex gap-5 items-center p-5" >
              <strong>Canción</strong>
              <button
                className="px-5 py-2 bg-gray-50 border border-purple-400 rounded-md text-gray-500"
                onClick={() => setModalSelectCancion(0)}
              >
                {reunion.canciones[0]}
              </button>
              <strong>y oración</strong>
            </span>
          </div>

          <div className="flex gap-2 items-center p-5">
            <strong>Presidente:</strong>
            <button onClick={() => abrirModalPersonas('presidente')}
              className="px-5 py-2 bg-gray-100 hover:bg-white rounded-md text-gray-500" >
              No se ha seleccionado
            </button>
          </div>
        </div>
        <div className="flex justify-end pb-4 px-5" >
          <div className="flex gap-2 items-center">
            <strong>Presidente de la sala B:</strong>
            <button onClick={() => abrirModalPersonas('presidenteB')}
              className="px-5 py-2 bg-gray-100 hover:bg-white rounded-md text-gray-500" >
              No se ha seleccionado
            </button>
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
          <span className="flex gap-5 items-center p-5" >
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
          Agregar una asignación aquí
        </button>
        <div className="block">
          <span className="flex gap-5 items-center p-5" >
            <strong>Canción</strong>
            <button
              className="px-5 py-2 bg-gray-50 border border-purple-400 rounded-md text-gray-500"
              onClick={() => setModalSelectCancion(2)}
            >
              {reunion.canciones[2]}
            </button>
            <strong>y oración</strong>
          </span>
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
          {modalSelectCancion &&
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
            {(nombrados && nombrados.length > 0) && <CrudNombrados />}

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
