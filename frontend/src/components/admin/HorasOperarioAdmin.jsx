import React, { useEffect, useState } from "react";
import { ClockIcon, TrayIcon, UserIcon } from "@phosphor-icons/react";
import api from "../../../services/Api";

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

function formatFecha(f) {
  if (!f) return "—";
  const [y, m, d] = f.split("-");
  return `${d}/${m}/${y}`;
}

// Vista detalle: líneas del operario en el mes
function VistaDetalle({ operarioId, year, month }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = () => {
    setLoading(true);
    setError(null);
    api.getOperarioLineas(operarioId, year, month)
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [operarioId, year, month]); // eslint-disable-line

  const lineas = data?.lineas || [];
  const totalHoras = data?.total_horas ?? 0;

  return (
    <>
      {!loading && data && (
        <div className="horas-operario-admin__total-horas">
          <ClockIcon size={22} weight="fill" />
          <span className="horas-operario-admin__total-horas-num">{totalHoras.toFixed(2)}</span>
          <span className="horas-operario-admin__total-horas-label">horas en {MESES[month - 1]} {year}</span>
        </div>
      )}

      {loading ? (
        <div className="trabajos-admin__loading">Cargando...</div>
      ) : error ? (
        <div className="trabajos-admin__empty"><TrayIcon size={40} /><p>Error: {error}</p></div>
      ) : lineas.length === 0 ? (
        <div className="trabajos-admin__empty">
          <TrayIcon size={40} />
          <p>Sin trabajos en {MESES[month - 1]} {year}</p>
        </div>
      ) : (
        <div className="horas-operario-admin__tabla-wrap">
          <table className="horas-operario-admin__tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nº Orden</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Descripción</th>
                <th>Horas</th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((l, i) => (
                <tr key={i}>
                  <td>{formatFecha(l.orFecha)}</td>
                  <td><span className="horas-operario-admin__orden">{l.orNum}</span></td>
                  <td>{l.marca || <span className="horas-operario-admin__vacio">—</span>}</td>
                  <td>{l.modelo || <span className="horas-operario-admin__vacio">—</span>}</td>
                  <td>{l.anio || <span className="horas-operario-admin__vacio">—</span>}</td>
                  <td className="horas-operario-admin__desc">{l.desc}</td>
                  <td className="horas-operario-admin__horas">{l.cant.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="horas-operario-admin__total-row">
                <td colSpan={6}>Total</td>
                <td className="horas-operario-admin__horas">{totalHoras.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}

// Vista resumen: todos los operarios (para Ernesto)
function VistaResumen({ year, month }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = () => {
    setLoading(true);
    setError(null);
    api.getHorasOperario(year, month)
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [year, month]); // eslint-disable-line

  const operarios = data?.operarios || [];
  const totalHoras = operarios.reduce((s, o) => s + o.totalHoras, 0);

  return (
    <>
      {!loading && data && (
        <div className="horas-operario-admin__total-horas">
          <ClockIcon size={22} weight="fill" />
          <span className="horas-operario-admin__total-horas-num">{totalHoras.toFixed(2)}</span>
          <span className="horas-operario-admin__total-horas-label">horas totales en {MESES[month - 1]} {year}</span>
        </div>
      )}

      {loading ? (
        <div className="trabajos-admin__loading">Cargando...</div>
      ) : error ? (
        <div className="trabajos-admin__empty"><TrayIcon size={40} /><p>Error: {error}</p></div>
      ) : operarios.length === 0 ? (
        <div className="trabajos-admin__empty">
          <TrayIcon size={40} />
          <p>Sin datos en {MESES[month - 1]} {year}</p>
        </div>
      ) : (
        <div className="horas-operario-admin__tabla-wrap">
          <table className="horas-operario-admin__tabla">
            <thead>
              <tr>
                <th>Operario</th>
                <th>Órdenes</th>
                <th>Líneas</th>
                <th>Horas</th>
              </tr>
            </thead>
            <tbody>
              {operarios.map((o) => (
                <tr key={o.operarioID}>
                  <td>
                    <span className="horas-operario-admin__nombre">
                      <UserIcon size={13} /> {o.operario}
                    </span>
                  </td>
                  <td>{o.ordenes}</td>
                  <td>{o.lineas}</td>
                  <td className="horas-operario-admin__horas">{o.totalHoras.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="horas-operario-admin__total-row">
                <td colSpan={3}>Total</td>
                <td className="horas-operario-admin__horas">{totalHoras.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}

function HorasOperarioAdmin() {
  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth() + 1);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const miOperarioId = currentUser.operario_id ?? null;
  const esResumen = miOperarioId === 0 || miOperarioId === null;

  const years = [];
  for (let y = hoy.getFullYear(); y >= 2021; y--) years.push(y);

  return (
    <div className="horas-operario-admin">
      {/* Topbar sin botón volver */}
      <div className="trabajos-admin__topbar">
        <div style={{ width: 60 }} />
        <div className="trabajos-admin__title-wrap">
          <ClockIcon size={18} className="trabajos-admin__title-icon" />
          <h2 className="trabajos-admin__title">
            {esResumen ? "Horas por operario" : (currentUser.nombre || "Mis horas")}
          </h2>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Filtros mes / año */}
      <div className="horas-operario-admin__filtros">
        <label className="horas-operario-admin__filtro-label">
          Mes
          <select
            className="horas-operario-admin__date-input"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MESES.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </label>
        <label className="horas-operario-admin__filtro-label">
          Año
          <select
            className="horas-operario-admin__date-input"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
      </div>

      {esResumen
        ? <VistaResumen year={year} month={month} />
        : <VistaDetalle operarioId={miOperarioId} year={year} month={month} />
      }
    </div>
  );
}

export default HorasOperarioAdmin;
