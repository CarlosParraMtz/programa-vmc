import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const pasos = [
  { numero: '01', icono: 'fa-cog', titulo: 'Configura la congregación', texto: 'Empieza en Configuración. Completa el nombre y la ubicación de la congregación, el superintendente de circuito, el país, el día habitual de la reunión y el número de salas. Estos datos dan contexto al programa y permiten que las asignaciones se organicen correctamente.', ruta: '/dashboard/config', accion: 'Ir a configuración', tipo: 'form' },
  { numero: '02', icono: 'fa-address-book', titulo: 'Registra a las personas', texto: 'En Personas agrega primero a los hermanos nombrados y después a los matriculados. Indica qué responsabilidades o tipos de asignación puede atender cada persona. Mantener esta lista completa hace que, al asignar, solo aparezcan candidatos adecuados para cada participación.', ruta: '/dashboard/personas', accion: 'Administrar personas', tipo: 'people' },
  { numero: '03', icono: 'fa-calendar-alt', titulo: 'Crea un periodo', texto: 'Ve a Programas y pulsa el botón + de la tarjeta Periodos. Escribe un nombre claro, por ejemplo “Julio 2026”. Un periodo agrupa varias reuniones y te permite revisar su avance, detectar pendientes e imprimir el programa completo.', ruta: '/dashboard/programas', accion: 'Crear un periodo', tipo: 'period' },
  { numero: '04', icono: 'fa-chalkboard-teacher', titulo: 'Agrega las reuniones', texto: 'En Reuniones añade cada semana al periodo correspondiente. Selecciona la fecha y captura la información de la reunión. Una vez guardada, selecciónala en la lista para consultar el tablero, editarla, imprimirla o compartirla.', ruta: '/dashboard/reuniones', accion: 'Administrar reuniones', tipo: 'meeting' },
  { numero: '05', icono: 'fa-user-check', titulo: 'Asigna a cada participante', texto: 'Abre una reunión y entra en edición con el lápiz. En cada parte selecciona al encargado, estudiante o ayudante y la sala cuando corresponda. Guarda al terminar y revisa que el periodo marque la reunión como completa, sin advertencias pendientes.', ruta: '/dashboard/reuniones', accion: 'Comenzar a asignar', tipo: 'assign' },
]

const reveal = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: .55, ease: 'easeOut' } } }

function Ilustracion({ tipo }) {
  if (tipo === 'form') return <div className="guide-mock"><div className="guide-mock__bar"><b>Congregación</b><i className="fas fa-edit" /></div><label>Nombre</label><div className="guide-input">Central</div><div className="guide-mock__row"><div><label>Día de reunión</label><div className="guide-input">Miércoles</div></div><div><label>Salas</label><div className="guide-input">A y B</div></div></div><span className="guide-button">Guardar</span></div>
  if (tipo === 'people') return <div className="guide-mock"><div className="guide-mock__bar"><b>Personas</b><span className="guide-round"><i className="fas fa-plus" /></span></div>{['Ana Martínez · Estudiante', 'Daniel López · Anciano', 'Sofía García · Estudiante'].map((x, i) => <div className="guide-person" key={x}><span className={`guide-avatar guide-avatar--${i}`}>{x[0]}</span><span>{x}</span><i className="fas fa-chevron-right" /></div>)}</div>
  if (tipo === 'period') return <div className="guide-mock"><div className="guide-mock__bar"><b>Periodos</b><span className="guide-round"><i className="fas fa-plus" /></span></div><div className="guide-period active"><span>Julio 2026</span><i className="fas fa-check-circle" /></div><div className="guide-period"><span>Agosto 2026</span><small>4 reuniones</small></div><div className="guide-status"><span><b>4</b> Reuniones</span><span><b>3</b> Completas</span><span><b>1</b> Pendiente</span></div></div>
  if (tipo === 'meeting') return <div className="guide-mock"><div className="guide-mock__bar"><b>Reuniones</b><span className="guide-round"><i className="fas fa-plus" /></span></div><div className="guide-week"><div><small>SEMANA</small><b>6–12 de julio</b><span>Periodo: Julio 2026</span></div><span className="guide-pill">Lista</span></div><div className="guide-mini-board"><i className="fas fa-gem" /><div><b>Tesoros de la Biblia</b><span>3 asignaciones</span></div></div><div className="guide-mini-board pink"><i className="fas fa-book-open" /><div><b>Seamos mejores maestros</b><span>3 asignaciones</span></div></div></div>
  return <div className="guide-mock"><div className="guide-mock__bar"><b>Editar asignaciones</b><span className="guide-round solid"><i className="fas fa-save" /></span></div>{[['Presidente', 'Daniel López'], ['Lectura de la Biblia', 'Mateo Hernández'], ['Primera conversación', 'Ana Martínez']].map(([a, b], i) => <div className="guide-assignment" key={a}><span className="guide-assignment__number">{i + 1}</span><div><small>{a}</small><b>{b}</b></div><span className="guide-room">Sala A</span></div>)}</div>
}

export default function GuiaUso() {
  return <main className="usage-guide">
    <motion.section className="usage-guide__hero" initial="hidden" animate="visible" variants={reveal}>
      <div className="usage-guide__glow usage-guide__glow--one" /><div className="usage-guide__glow usage-guide__glow--two" />
      <div className="usage-guide__eyebrow"><i className="fas fa-compass" /> GUÍA DE USO</div>
      <h1>Del primer dato al <span>programa terminado.</span></h1>
      <p>Sigue este recorrido para preparar las reuniones, organizar a las personas y compartir cada asignación sin saltarte ningún paso.</p>
      <a className="usage-guide__start" href="#pasos">Comenzar recorrido <i className="fas fa-arrow-down" /></a>
      <div className="usage-guide__progress">{pasos.map((p, i) => <span key={p.numero}><b>{p.numero}</b><small>{p.titulo.replace('Configura la ', '').replace('Registra a las ', '')}</small>{i < pasos.length - 1 && <i />}</span>)}</div>
    </motion.section>

    <section id="pasos" className="usage-guide__steps">
      {pasos.map((paso, index) => <motion.article className={`guide-step ${index % 2 ? 'guide-step--reverse' : ''}`} key={paso.numero} variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }}>
        <div className="guide-step__copy"><span className="guide-step__number">{paso.numero}</span><div className="guide-step__icon"><i className={`fas ${paso.icono}`} /></div><p className="guide-step__kicker">PASO {paso.numero}</p><h2>{paso.titulo}</h2><p>{paso.texto}</p><Link to={paso.ruta}>{paso.accion} <i className="fas fa-arrow-right" /></Link></div>
        <motion.div className="guide-step__visual" whileHover={{ y: -6, rotate: index % 2 ? 1 : -1 }} transition={{ type: 'spring', stiffness: 220 }}><div className="guide-step__dots" /><Ilustracion tipo={paso.tipo} /><span className="guide-step__caption"><i className="fas fa-eye" /> Ejemplo ilustrativo</span></motion.div>
      </motion.article>)}
    </section>

    <motion.section className="guide-tools" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .25 }}>
      <p className="guide-step__kicker">HERRAMIENTAS CLAVE</p><h2>Comparte el resultado en segundos</h2><p className="guide-tools__intro">Después de completar una reunión, selecciónala. En la esquina superior del tablero encontrarás estas dos acciones.</p>
      <div className="guide-tools__grid">
        <div className="guide-tool"><span className="guide-tool__icon"><i className="fas fa-paper-plane" /></span><div><h3>Enlace del programa público</h3><p>El botón del avión genera y copia un enlace que puedes enviar por mensajería. Quien lo reciba podrá consultar el programa de esa reunión sin iniciar sesión ni entrar al panel de administración.</p><div className="guide-url"><i className="fas fa-link" /><span>programa.app/programa/congregación/reunión</span><i className="fas fa-copy" /></div></div></div>
        <div className="guide-tool"><span className="guide-tool__icon guide-tool__icon--pink"><i className="fas fa-id-badge" /></span><div><h3>Asignaciones individuales en ZIP</h3><p>El botón de la credencial genera, con un solo clic, una imagen PNG por cada asignación estudiantil. Todas se descargan juntas dentro de un archivo ZIP, listas para compartir individualmente.</p><div className="guide-download"><i className="fas fa-file-archive" /><span><b>s89-fecha.zip</b><small>Imágenes PNG incluidas</small></span><i className="fas fa-check-circle" /></div></div></div>
      </div>
    </motion.section>

    <motion.section className="guide-finish" initial={{ opacity: 0, scale: .96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}><span><i className="fas fa-check" /></span><div><p>YA CONOCES EL RECORRIDO</p><h2>Tu próximo programa puede empezar ahora.</h2></div><Link to="/dashboard/config">Ir al primer paso <i className="fas fa-arrow-right" /></Link></motion.section>
  </main>
}
