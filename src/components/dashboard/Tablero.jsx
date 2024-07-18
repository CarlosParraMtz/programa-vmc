export default function Tablero({programa, sala}) {


    function getItems(section, bg = "") {
        return <div className={`flex flex-col px-5 py-2 ${bg} divide-y divide-slate-400`} >
            {
                programa
                    .map((i, index) => {
                        if (i.section != section) return null;
                        return (
                            <div key={index} className="flex w-full items-center justify-between" >
                                <p> {index + 1}. {i.title} </p>
                                <p className="text-right" > {i.name} </p>
                            </div>
                        )
                    })
            }
        </div>
    }

    return (
        <div className="w-full flex flex-col" >
            <div className="bg-program-treasures w-full text-white px-5 rounded-t-lg font-thin text-xl " >
                Tesoros de la Biblia
            </div>
            {getItems(1, "bg-[#3c7f8b22]")}
            <div className="bg-program-teachers w-full text-white px-5 font-thin text-xl " >
                Seamos mejores maestros
            </div>
            {getItems(2, "bg-[#d68f0022]")}
            <div className="bg-program-life w-full text-white px-5 font-thin text-xl " >
                Nuestra vida cristiana
            </div>
            {getItems(3, "bg-[#bf2f1322]")}
        </div>
    )
}
