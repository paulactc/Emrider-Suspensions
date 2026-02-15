import React, { useEffect, useState } from "react";
import { ClipboardList, ChevronDown, ChevronUp, Loader, Bike } from "lucide-react";
import api from "../../../services/Api";

function HistorialOrdenes({ clientId }) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .getOrderLinesByClient(clientId)
      .then((res) => {
        setOrdenes(res.data || []);
        setError(null);
      })
      .catch((err) => {
        console.error("Error cargando ordenes:", err);
        setError("Error cargando el historial de trabajos");
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  const toggleOrder = (orNum) => {
    setExpandedOrder(expandedOrder === orNum ? null : orNum);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "—";
    return num.toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
    });
  };

  if (loading) {
    return (
      <div className="historial-ordenes">
        <div className="historial-ordenes__header">
          <ClipboardList className="historial-ordenes__icon" />
          <h3>Historial de trabajos</h3>
        </div>
        <div className="historial-ordenes__loading">
          <Loader className="spinner" />
          <span>Cargando historial...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historial-ordenes">
        <div className="historial-ordenes__header">
          <ClipboardList className="historial-ordenes__icon" />
          <h3>Historial de trabajos</h3>
        </div>
        <p className="no-results-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="historial-ordenes">
      <div className="historial-ordenes__header">
        <ClipboardList className="historial-ordenes__icon" />
        <h3>Historial de trabajos</h3>
        {ordenes.length > 0 && (
          <span className="historial-ordenes__count">
            {ordenes.length} {ordenes.length === 1 ? "trabajo" : "trabajos"}
          </span>
        )}
      </div>

      {ordenes.length === 0 ? (
        <p className="no-results-message">
          No hay trabajos registrados
        </p>
      ) : (
        <div className="historial-ordenes__list">
          {ordenes.map((orden) => {
            const isExpanded = expandedOrder === orden.orNum;
            return (
              <div
                key={orden.orNum}
                className={`historial-ordenes__card ${
                  isExpanded ? "historial-ordenes__card--expanded" : ""
                }`}
              >
                <button
                  className="historial-ordenes__card-header"
                  onClick={() => toggleOrder(orden.orNum)}
                >
                  <div className="historial-ordenes__card-info">
                    <span className="historial-ordenes__fecha">
                      {formatDate(orden.fecha)}
                    </span>
                    {(orden.marca || orden.modelo || orden.matricula) && (
                      <span className="historial-ordenes__vehiculo">
                        <Bike className="historial-ordenes__vehiculo-icon" />
                        {[orden.marca, orden.modelo].filter(Boolean).join(" ") || orden.matricula}
                        {orden.matricula && orden.marca && (
                          <span className="historial-ordenes__matricula">
                            {orden.matricula}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="historial-ordenes__card-total">
                    <span className="historial-ordenes__importe">
                      {formatCurrency(orden.totalImporte)}
                    </span>
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="historial-ordenes__card-body">
                    <div className="historial-ordenes__meta">
                      {(orden.marca || orden.modelo) && (
                        <span className="historial-ordenes__meta-item">
                          <Bike className="historial-ordenes__meta-icon" />
                          {[orden.marca, orden.modelo].filter(Boolean).join(" ")}
                          {orden.matricula && ` (${orden.matricula})`}
                        </span>
                      )}
                      {orden.kms && orden.kms !== "0" && (
                        <span className="historial-ordenes__meta-item">
                          {orden.kms} km
                        </span>
                      )}
                    </div>
                    <table className="historial-ordenes__table">
                      <thead>
                        <tr>
                          <th>Descripcion</th>
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
                                  <span className="historial-ordenes__obs">
                                    {linea.obs}
                                  </span>
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
}

export default HistorialOrdenes;
