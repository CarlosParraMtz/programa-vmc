import formatearRangoSemanal from "../../functions/formatearRangoSemanal";

export default function Tablero({ programa }) {
    const date = new Date(programa.fecha)
    function getItems(section, bg = "", cancion1 = null, cancion2 = null, cancion3 = null, presidente = false) {
        return <div className={`flex flex-col px-5 py-2 ${bg}  divide-slate-700`} >
            <div className="flex justify-between items-center">
                {(cancion2 || cancion1) &&
                    <p className="font-bold text-xs pb-1" >
                        Canción {cancion1} {cancion2} {cancion1 && "y oración"}
                    </p>
                }
                {
                    presidente && <div className="flex flex-col" >
                        <p className="text-xs"><strong className="mr-5" >Presidente:</strong>
                            {(!programa.presidente || (programa.presidente && programa.presidente === ""))
                                ? "No asignado"
                                : programa.presidente
                            }
                        </p>
                    </div>
                }
            </div>
            {
                programa && programa.asignaciones
                    .map((i, index) => {
                        if (i.seccion != section) return null;
                        return (
                            <div key={index} className="
                                flex w-full justify-between py-1 
                            " >
                                <div className="flex-1 mr-5">

                                    <p className="text-sm ">
                                        <strong> {index + 1}. {i.titulo} </strong> ({i.duracion} mins.)
                                        {i.video && <i className="fas fa-video ml-5 text-purple-700" ></i>}
                                    </p>
                                    {
                                        i.descripcion && <p className="text-xs">{i.descripcion} </p>
                                    }
                                </div>
                                <p className="text-right text-xs" >
                                    {(i.nombre && i.nombre != "") ? i.nombre : "No asignado"}
                                </p>
                            </div>
                        )
                    })
            }
            {cancion3 &&
                <p className="font-bold text-md pb-1" > Canción {cancion3} {cancion3 && "y oración"} </p>
            }
        </div>
    }


    return (
        <div className="w-full flex flex-col" >
            <h3 className="text-xl" >Semana del {formatearRangoSemanal(date)}</h3>
            <span className="bg-program-treasures w-full text-white px-5 py-2 rounded-t-lg font-thin text-md " >
                Tesoros de la Biblia
            </span>
            {getItems(1, "bg-[#3c7f8b22]", programa.canciones[0], null, null, true)}
            <span className="bg-program-teachers w-full text-white px-5 py-2 font-thin text-md " >
                Seamos mejores maestros
            </span>
            {getItems(2, "bg-[#d68f0022]")}
            <span className="bg-program-life w-full text-white px-5 py-2 font-thin text-md " >
                Nuestra vida cristiana
            </span>
            {getItems(3, "bg-[#bf2f1322]", null, programa.canciones[1], programa.canciones[2])}
        </div>
    )
}
