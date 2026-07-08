import { Link } from "react-router-dom"

const features = [
  {
    icon: "fas fa-calendar-check",
    title: "Programas por periodo",
    text: "Organiza las reuniones de entre semana por mes o periodo y consulta rapidamente que semanas ya estan completas.",
  },
  {
    icon: "fas fa-users",
    title: "Asignaciones claras",
    text: "Administra nombrados, matriculados y participantes para mantener cada parte asignada a la persona correcta.",
  },
  {
    icon: "fas fa-triangle-exclamation",
    title: "Revision de pendientes",
    text: "Detecta espacios sin asignar antes de imprimir o compartir un programa con la congregacion.",
  },
  {
    icon: "fas fa-print",
    title: "Listo para compartir",
    text: "Genera vistas publicas, imprime programas y prepara tarjetas de asignacion estudiantil cuando las necesites.",
  },
]

const steps = [
  "Crea un periodo",
  "Carga las reuniones",
  "Asigna participantes",
  "Imprime o comparte",
]

export default function Home() {
  return (
    <main className="landing">
      <header className="landing__header">
        <Link to="/" className="landing__brand" aria-label="Programa VMC">
          <span className="landing__brand-mark">VMC</span>
          <span>Programa VMC</span>
        </Link>

        <nav className="landing__nav" aria-label="Navegacion principal">
          <a href="#funciones">Funciones</a>
          <a href="#flujo">Flujo</a>
          <Link to="/dashboard" className="landing__nav-action">
            Dashboard
          </Link>
        </nav>
      </header>

      <section className="landing__hero">
        <div className="landing__hero-content">
          <p className="landing__eyebrow">Organizacion sencilla para la reunion de entre semana</p>
          <h1>Prepara, asigna y comparte programas sin perder el hilo.</h1>
          <p className="landing__intro">
            Programa VMC ayuda a llevar el control de periodos, reuniones,
            participantes y asignaciones desde un solo panel, con alertas para
            detectar pendientes antes de publicar o imprimir.
          </p>

          <div className="landing__actions">
            <Link to="/dashboard" className="landing__primary">
              Ir al dashboard
            </Link>
            <a href="#funciones" className="landing__secondary">
              Ver funciones
            </a>
          </div>
        </div>

        <div className="landing__preview" aria-label="Resumen de funcionalidades">
          <div className="landing__preview-header">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="landing__preview-body">
            <div>
              <p>Semana actual</p>
              <strong>Programa completo</strong>
            </div>
            <span className="landing__status">Listo</span>
          </div>
          <div className="landing__program-card landing__program-card--active">
            <i className="fas fa-book-open"></i>
            <div>
              <strong>Tesoros de la Biblia</strong>
              <p>Asignaciones confirmadas</p>
            </div>
          </div>
          <div className="landing__program-card">
            <i className="fas fa-comments"></i>
            <div>
              <strong>Seamos mejores maestros</strong>
              <p>Tarjetas listas para descargar</p>
            </div>
          </div>
          <div className="landing__program-card">
            <i className="fas fa-people-group"></i>
            <div>
              <strong>Nuestra vida cristiana</strong>
              <p>Presidente y oracion asignados</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__section" id="funciones">
        <div className="landing__section-heading">
          <p className="landing__eyebrow">Funciones principales</p>
          <h2>Todo lo necesario para preparar el programa semanal.</h2>
        </div>

        <div className="landing__feature-grid">
          {features.map((feature) => (
            <article className="landing__feature" key={feature.title}>
              <i className={feature.icon}></i>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing__flow" id="flujo">
        <div className="landing__flow-copy">
          <p className="landing__eyebrow">Flujo de trabajo</p>
          <h2>Del periodo nuevo al programa publicado en pocos pasos.</h2>
          <p>
            La aplicacion centraliza la informacion de reuniones, personas y
            asignaciones para que el tablero semanal siempre muestre lo que
            falta y lo que ya esta preparado.
          </p>
        </div>

        <ol className="landing__steps">
          {steps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
