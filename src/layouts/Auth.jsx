import { Outlet } from "react-router-dom";

export default function Auth() {
  return (
    <div className="auth-layout flex w-full min-h-screen">
      <div className="auth-layout__brand-panel lg:w-2/3 hidden lg:flex min-h-screen">
        <div className="auth-layout__brand-content">
          <span className="auth-layout__brand-mark">VMC</span>
          <p className="auth-layout__eyebrow">Programa de Vida y Ministerio</p>
          <h1>Organiza cada reunion con claridad y calma.</h1>
          <p>
            Administra asignaciones, reuniones y programas semanales desde un
            espacio sencillo, ordenado y listo para colaborar.
          </p>
        </div>
        <div className="auth-layout__preview" aria-hidden="true">
          <div className="auth-layout__preview-header">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="auth-layout__preview-row main"></div>
          <div className="auth-layout__preview-row short"></div>
          <div className="auth-layout__preview-grid">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      <div className="auth-layout__form-panel lg:w-1/3 w-full flex items-center justify-center p-4 sm:p-5">
        <Outlet />
      </div>
    </div>
  );
}
