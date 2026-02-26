import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Loader, Bike } from "lucide-react";
import api from "../../../services/Api";

function HistorialOrdenes({ clientId }) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [motoAbierta, setMotoAbierta] = useState(null);
  const [ordenAbierta, setOrdenAbierta] = useState(null);

  useEffect(() => {
    if (!clientId) { setLoading(false); return; }
    setLoading(true);
    api.getOrderLinesByClient(clientId)
      .then((res) => { setOrdenes(res.data || []); setError(null); })
      .catch(() => setError("Error cargando el historial de trabajos"))
      .finally(() => setLoading(false));
  }, [clientId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "—";
    return num.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  };

  // Agrupar órdenes por moto
  const grupos = ordenes.reduce((acc, orden) => {
    const clave = orden.matricula || `${orden.marca || ""}_${orden.modelo || ""}` || "sin-moto";
    if (!acc[clave]) {
      acc[clave] = {
        key: clave,
        marca: orden.marca || null,
        modelo: orden.modelo || null,
        matricula: orden.matricula || null,
        ordenes: [],
      };
    }
    acc[clave].ordenes.push(orden);
    return acc;
  }, {});

  const gruposList = Object.values(grupos);

  const toggleMoto = (key) => {
    setMotoAbierta(motoAbierta === key ? null : key);
    setOrdenAbierta(null);
  };

  const toggleOrden = (orNum) => {
    setOrdenAbierta(ordenAbierta === orNum ? null : orNum);
  };

  if (loading) return (
    <div className="historial-ordenes">
      <div className="historial-ordenes__loading">
        <Loader className="spinner" />
        <span>Cargando historial...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="historial-ordenes">
      <p className="no-results-message">{error}</p>
    </div>
  );

  if (ordenes.length === 0) return (
    <div className="historial-ordenes">
      <p className="no-results-message">No hay trabajos registrados</p>
    </div>
  );

  return (
    <div className="historial-ordenes">
      <div className="historial-ordenes__motos">
        {gruposList.map((grupo) => {
          const isOpen = motoAbierta === grupo.key;
          const nombreMoto = [grupo.marca, grupo.modelo].filter(Boolean).join(" ") || grupo.matricula || "Moto";

          return (
            <div key={grupo.key} className={`historial-moto ${isOpen ? "historial-moto--open" : ""}`}>

              {/* Cabecera de moto — clic para desplegar */}
              <button className="historial-moto__header" onClick={() => toggleMoto(grupo.key)}>
                <div className="historial-moto__icon-wrap">
                  <Bike size={20} />
                </div>
                <div className="historial-moto__info">
                  <span className="historial-moto__nombre">{nombreMoto}</span>
                  {grupo.matricula && (
                    <span className="historial-moto__matricula">{grupo.matricula}</span>
                  )}
                </div>
                <span className="historial-moto__count">
                  {grupo.ordenes.length} {grupo.ordenes.length === 1 ? "trabajo" : "trabajos"}
                </span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {/* Listado de órdenes */}
              {isOpen && (
                <div className="historial-moto__body">
                  {grupo.ordenes.map((orden) => {
                    const isExpanded = ordenAbierta === orden.orNum;
                    return (
                      <div key={orden.orNum} className={`historial-ordenes__card ${isExpanded ? "historial-ordenes__card--expanded" : ""}`}>
                        <button className="historial-ordenes__card-header" onClick={() => toggleOrden(orden.orNum)}>
                          <div className="historial-ordenes__card-info">
                            <span className="historial-ordenes__fecha">{formatDate(orden.fecha)}</span>
                          </div>
                          <div className="historial-ordenes__card-total">
                            <span className="historial-ordenes__importe">{formatCurrency(orden.totalImporte)}</span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="historial-ordenes__card-body">
                            <table className="historial-ordenes__table">
                              <thead>
                                <tr>
                                  <th>Descripción</th>
                                  <th>Cant.</th>
                                  <th>Precio</th>
                                  <th>Importe</th>
                                </tr>
                              </thead>
                              <tbody>
                                {orden.lineas.map((linea, idx) => (
                                  <React.Fragment key={linea.lineaID || idx}>
                                    <tr>
                                      <td>{linea.desc || linea.ref || "—"}</td>
                                      <td>{linea.cant}</td>
                                      <td>{formatCurrency(linea.precio)}</td>
                                      <td>{formatCurrency(linea.importe)}</td>
                                    </tr>
                                    {linea.obs && linea.obs.trim() && (
                                      <tr className="historial-ordenes__obs-row">
                                        <td colSpan="4">
                                          <span className="historial-ordenes__obs">{linea.obs}</span>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan="3">Total</td>
                                  <td>{formatCurrency(orden.totalImporte)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HistorialOrdenes;
