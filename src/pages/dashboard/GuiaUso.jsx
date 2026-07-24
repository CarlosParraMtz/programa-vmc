import { Link } from 'react-router-dom'

const pasos = [
  {
    numero: 1,
    icono: 'fa-sliders',
    titulo: 'Configura la congregación',
    texto: 'En Configuración registra los datos generales, el día habitual de la reunión y el número de salas.',
    detalle: 'Esta información define las fechas y opciones que utilizará el programa.',
    ruta: '/dashboard/config',
    accion: 'Abrir Configuración',
  },
  {
    numero: 2,
    icono: 'fa-users',
    titulo: 'Registra a las personas',
    texto: 'Agrega a los nombrados y matriculados. Indica qué asignaciones puede atender cada persona y quiénes pueden hacer la oración final.',
    detalle: 'Mantén estas listas actualizadas para recibir sugerencias correctas al asignar.',
    ruta: '/dashboard/personas',
    accion: 'Abrir Personas',
  },
  {
    numero: 3,
    icono: 'fa-calendar',
    titulo: 'Crea un periodo',
    texto: 'En Programas crea un periodo, por ejemplo “Julio 2026”. Después selecciónalo para trabajar con sus reuniones.',
    detalle: 'El periodo agrupa las semanas que se administrarán e imprimirán juntas.',
    ruta: '/dashboard/programas',
    accion: 'Abrir Programas',
  },
  {
    numero: 4,
    icono: 'fa-calendar-plus',
    titulo: 'Agrega las reuniones al periodo',
    texto: 'En Reuniones selecciona un rango de semanas o una fecha individual y agrégalas al periodo activo.',
    detalle: 'Si ya existe información de las reuniones en las semanas seleccionadas, se cargará automáticamente. No tendrás que capturar nuevamente las partes, los títulos ni los tiempos.',
    destacado: true,
    ruta: '/dashboard/reuniones',
    accion: 'Abrir Reuniones',
  },
  {
    numero: 5,
    icono: 'fa-user-check',
    titulo: 'Asigna y guarda',
    texto: 'Abre una reunión, pulsa el lápiz y selecciona a cada participante. Revisa las advertencias y guarda al terminar.',
    detalle: 'Las listas se ordenan por la participación más antigua para mostrar primero a quien corresponde.',
    ruta: '/dashboard/reuniones',
    accion: 'Administrar asignaciones',
  },
]

export default function GuiaUso() {
  return (
    <main className="usage-guide">
      <header className="usage-guide__header">
        <div className="usage-guide__header-icon" aria-hidden="true">
          <i className="fas fa-book-open"></i>
        </div>
        <div>
          <p>Ayuda</p>
          <h1>Guía de uso</h1>
          <span>Completa estos pasos en orden para preparar el programa.</span>
        </div>
      </header>

      <section className="usage-guide__install" aria-labelledby="instalar-aplicacion">
        <div className="usage-guide__install-heading">
          <span aria-hidden="true">
            <i className="fas fa-mobile-screen-button"></i>
          </span>
          <div>
            <p>Acceso desde el celular</p>
            <h2 id="instalar-aplicacion">Instalar Programa VMC</h2>
            <small>
              Al abrir la aplicación instalada entrarás directamente al login o al dashboard si tu sesión sigue activa.
            </small>
          </div>
        </div>
        <div className="usage-guide__install-options">
          <div>
            <i className="fab fa-android" aria-hidden="true"></i>
            <span>
              <strong>Android</strong>
              <small>
                Pulsa “Instalar aplicación” en el menú de Programa VMC. También puedes elegir “Instalar app” en el menú de Chrome.
              </small>
            </span>
          </div>
          <div>
            <i className="fab fa-apple" aria-hidden="true"></i>
            <span>
              <strong>iPhone o iPad</strong>
              <small>
                Abre Programa VMC en Safari, pulsa Compartir y selecciona “Agregar a pantalla de inicio”.
              </small>
            </span>
          </div>
        </div>
      </section>

      <nav className="usage-guide__index" aria-label="Pasos de la guía">
        {pasos.map((paso) => (
          <a key={paso.numero} href={`#paso-${paso.numero}`}>
            <b>{paso.numero}</b>
            <span>{paso.titulo}</span>
          </a>
        ))}
      </nav>

      <section className="usage-guide__content" aria-label="Instrucciones">
        <ol className="guide-steps">
          {pasos.map((paso) => (
            <li id={`paso-${paso.numero}`} className="guide-step" key={paso.numero}>
              <div className="guide-step__marker">
                <span>{paso.numero}</span>
              </div>

              <article>
                <div className="guide-step__heading">
                  <i className={`fas ${paso.icono}`} aria-hidden="true"></i>
                  <h2>{paso.titulo}</h2>
                </div>
                <p>{paso.texto}</p>
                <div className={paso.destacado ? 'guide-step__note guide-step__note--important' : 'guide-step__note'}>
                  {paso.destacado && <i className="fas fa-rotate" aria-hidden="true"></i>}
                  <span>{paso.detalle}</span>
                </div>
                <Link to={paso.ruta}>
                  {paso.accion}
                  <i className="fas fa-arrow-right" aria-hidden="true"></i>
                </Link>
              </article>
            </li>
          ))}
        </ol>

        <aside className="guide-after">
          <div className="guide-after__heading">
            <i className="fas fa-check" aria-hidden="true"></i>
            <div>
              <h2>Después de guardar</h2>
              <p>Selecciona la reunión para consultar el programa terminado.</p>
            </div>
          </div>
          <div className="guide-after__actions">
            <div>
              <i className="fas fa-paper-plane" aria-hidden="true"></i>
              <span>
                <strong>Compartir programa</strong>
                <small>Genera el enlace público desde el tablero.</small>
              </span>
            </div>
            <div>
              <i className="fas fa-id-badge" aria-hidden="true"></i>
              <span>
                <strong>Descargar asignaciones</strong>
                <small>Obtén las tarjetas individuales en un archivo ZIP.</small>
              </span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
