import React, { useState } from "react";
import InputSearchCustom from "../admin/forms/InputSearchCustom";
import UleachCustom from "../Page.Custom/UleachCustom";

function ListCustom({
  listCustom,
  Custom,
  handleInputFilter,
  filters,
  listBikes,
}) {
  // --- PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 10;

  const dataToUse =
    Custom && Array.isArray(Custom) && Custom.length > 0 ? Custom : listCustom;

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

  return (
    <>
      <div className="list-custom-container">
        <InputSearchCustom
          handleInputFilter={handleInputFilter}
          filters={filters}
        />
      </div>

      <h3 className="list-title">LISTA DE CLIENTES</h3>

      <ul className="custom-list">
        {clientesActuales && clientesActuales.length > 0 ? (
          clientesActuales.map((eachCustom, index) => {
            if (
              !eachCustom ||
              typeof eachCustom !== "object" ||
              !eachCustom.Cliente
            ) {
              return null;
            }
            return (
              <UleachCustom
                eachCustom={eachCustom}
                key={eachCustom.Cliente || `custom-${index}`}
                listBikes={listBikes}
              />
            );
          })
        ) : (
          <li className="no-results-message">
            <p>No hay datos disponibles para mostrar.</p>
          </li>
        )}
      </ul>

      {/* Controles de paginación */}
      <div className="pagination-controls">
        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => cambiarPagina(i + 1)}
            disabled={paginaActual === i + 1}
            // Aplica la clase del botón y la clase 'active' condicionalmente
            className={`paginationButton ${
              paginaActual === i + 1 ? "active" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
        <div className="total-clientes">
          <em>Número de clientes: {dataToUse.length}</em>
        </div>
      </div>
    </>
  );
}

export default ListCustom;
