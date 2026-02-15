import React, { useState } from "react";
import InputSearchCustom from "../admin/forms/InputSearchCustom";
import UleachCustom from "../Page.Custom/UleachCustom";

function ListCustom({
  listCustom,
  Custom,
  handleInputFilter,
  filters,
  listBikes,
  loading = false,
}) {

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
