import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Wrench, CheckCircle, Bell } from "lucide-react";
import InputSearchCustom from "../admin/forms/InputSearchCustom";
import UleachCustom from "../Page.Custom/UleachCustom";
import api from "../../../services/Api";

function ListCustom({
  listCustom,
  Custom,
  handleInputFilter,
  filters,
  listBikes,
  loading = false,
}) {

  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [avisosCount, setAvisosCount] = useState(0);

  useEffect(() => {
    api.getPendingServicios()
      .then((res) => setPendingCount((res.data || []).length))
      .catch(() => {});
    api.getCompletedServicios()
      .then((res) => setCompletedCount((res.data || []).length))
      .catch(() => {});
    api.pushNotifLog()
      .then((res) => {
        const hoy = new Date().toISOString().split("T")[0];
        const deHoy = (res.data || []).filter((a) => a.fecha === hoy);
        setAvisosCount(deHoy.length);
      })
      .catch(() => {});
  }, []);

  // --- PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 10;

  const dataToUse =
    Custom && Array.isArray(Custom) && Custom.length > 0
      ? Custom
      : Array.isArray(listCustom) ? listCustom : [];

  // Calcular los índices para paginación
  const indiceUltimoCliente = paginaActual * clientesPorPagina;
  const indicePrimerCliente = indiceUltimoCliente - clientesPorPagina;
  const clientesActuales = dataToUse.slice(
    indicePrimerCliente,
    indiceUltimoCliente
  );

  const totalPaginas = Math.ceil(dataToUse.length / clientesPorPagina);

  const cambiarPagina = (numero) => {
    setPaginaActual(numero);
  };

  // Función para generar números de página visibles
  const generarNumerosPagina = () => {
    const delta = 2; // Número de páginas a mostrar a cada lado de la actual
    const range = [];
    const rangeWithDots = [];

    // Calcular el rango de páginas a mostrar
    for (
      let i = Math.max(2, paginaActual - delta);
      i <= Math.min(totalPaginas - 1, paginaActual + delta);
      i++
    ) {
      range.push(i);
    }

    // Siempre mostrar la primera página
    if (paginaActual - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    // Agregar el rango calculado (evitar duplicar la página 1)
    range.forEach((i) => {
      if (i !== 1) {
        rangeWithDots.push(i);
      }
    });

    // Siempre mostrar la última página
    if (paginaActual + delta < totalPaginas - 1) {
      rangeWithDots.push("...", totalPaginas);
    } else if (totalPaginas > 1 && !rangeWithDots.includes(totalPaginas)) {
      rangeWithDots.push(totalPaginas);
    }

    return rangeWithDots;
  };

  return (
    <>
      <div>
        <div>
          <h2>LISTA DE CLIENTES</h2>
        </div>

        {/* ── ACCESOS TRABAJOS ── */}
        <div className="admin-trabajos-accesos">
          <Link to="/admin/trabajos-pendientes" className="admin-trabajo-acceso admin-trabajo-acceso--pendientes">
            <div className="admin-trabajo-acceso__icon">
              <Wrench size={20} />
            </div>
            <div className="admin-trabajo-acceso__text">
              <span className="admin-trabajo-acceso__title">Pendientes</span>
              <span className="admin-trabajo-acceso__sub">Sin datos técnicos</span>
            </div>
            <span className={`admin-trabajo-acceso__badge${pendingCount > 0 ? " admin-trabajo-acceso__badge--alert" : ""}`}>
              {pendingCount}
            </span>
          </Link>

          <Link to="/admin/trabajos-finalizados" className="admin-trabajo-acceso admin-trabajo-acceso--finalizados">
            <div className="admin-trabajo-acceso__icon">
              <CheckCircle size={20} />
            </div>
            <div className="admin-trabajo-acceso__text">
              <span className="admin-trabajo-acceso__title">Finalizados</span>
              <span className="admin-trabajo-acceso__sub">Datos técnicos guardados</span>
            </div>
            <span className="admin-trabajo-acceso__badge">
              {completedCount}
            </span>
          </Link>

          <Link to="/admin/avisos" className="admin-trabajo-acceso admin-trabajo-acceso--avisos">
            <div className="admin-trabajo-acceso__icon">
              <Bell size={20} />
            </div>
            <div className="admin-trabajo-acceso__text">
              <span className="admin-trabajo-acceso__title">Avisos</span>
              <span className="admin-trabajo-acceso__sub">Notificaciones enviadas</span>
            </div>
            {avisosCount > 0 && (
              <span className="admin-trabajo-acceso__badge admin-trabajo-acceso__badge--alert">
                {avisosCount} hoy
              </span>
            )}
          </Link>
        </div>

        <InputSearchCustom
          handleInputFilter={handleInputFilter}
          filters={filters}
        />

        <div>
          {clientesActuales && clientesActuales.length > 0 ? (
            clientesActuales.map((eachCustom, index) => {
              if (
                !eachCustom ||
                typeof eachCustom !== "object" ||
                (!eachCustom.nombre && !eachCustom.apellidos && !eachCustom.nombre_completo)
              ) {
                return null;
              }

              return (
                <UleachCustom
                  key={eachCustom.id || index}
                  eachCustom={eachCustom}
                  listBikes={listBikes}
                />
              );
            })
          ) : (
            <div>
              <p>{loading ? "Cargando clientes..." : "No hay datos disponibles para mostrar."}</p>
            </div>
          )}
        </div>

        {/* Controles de paginación mejorados */}
        {totalPaginas > 1 && (
          <div className="pagination-container">
            <div className="pagination-controls">
              {/* Botón Primera página */}
              <button
                onClick={() => cambiarPagina(1)}
                disabled={paginaActual === 1}
                className="paginationButton"
                title="Primera página"
              >
                &#171;
              </button>

              {/* Botón Anterior */}
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="paginationButton"
                title="Página anterior"
              >
                &#8249;
              </button>

              {/* Números de página */}
              {generarNumerosPagina().map((numero, index) => (
                <React.Fragment key={index}>
                  {numero === "..." ? (
                    <span className="pagination-dots">...</span>
                  ) : (
                    <button
                      onClick={() => cambiarPagina(numero)}
                      disabled={paginaActual === numero}
                      className={`paginationButton ${
                        paginaActual === numero ? "active" : ""
                      }`}
                    >
                      {numero}
                    </button>
                  )}
                </React.Fragment>
              ))}

              {/* Botón Siguiente */}
              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="paginationButton"
                title="Página siguiente"
              >
                &#8250;
              </button>

              {/* Botón Última página */}
              <button
                onClick={() => cambiarPagina(totalPaginas)}
                disabled={paginaActual === totalPaginas}
                className="paginationButton"
                title="Última página"
              >
                &#187;
              </button>
            </div>

            {/* Información adicional */}
            <div className="pagination-info">
              <span>
                Página {paginaActual} de {totalPaginas}
              </span>
              <span>
                Mostrando {indicePrimerCliente + 1} -{" "}
                {Math.min(indiceUltimoCliente, dataToUse.length)} de{" "}
                {dataToUse.length} clientes
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ListCustom;
