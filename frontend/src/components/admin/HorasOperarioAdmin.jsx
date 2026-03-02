import React, { useEffect, useState } from "react";
import { ClockIcon, TrayIcon, UserIcon, CaretDownIcon, CaretUpIcon, CurrencyEurIcon } from "@phosphor-icons/react";
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

function formatEur(n) {
  return Number(n || 0).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

// Vista detalle: líneas del operario en el mes
function VistaDetalle({ operarioId, year, month, mostrarImporte = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getOperarioLineas(operarioId, year, month)
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [operarioId, year, month]); // eslint-disable-line

  const lineas = data?.lineas || [];
  const totalHoras = data?.total_horas ?? 0;
  const totalImporte = data?.total_importe ?? 0;

  if (loading) return <div className="trabajos-admin__loading">Cargando...</div>;
  if (error) return <div className="trabajos-admin__empty"><TrayIcon size={40} /><p>Error: {error}</p></div>;

  return (
    <>
      {data && (
        <div className="horas-operario-admin__total-horas">
          <ClockIcon size={22} weight="fill" />
          <span className="horas-operario-admin__total-horas-num">{totalHoras.toFixed(2)}</span>
          <span className="horas-operario-admin__total-horas-label">horas en {MESES[month - 1]} {year}</span>
          {mostrarImporte && totalImporte > 0 && (
            <>
              <span style={{ margin: "0 0.5rem", color: "var(--ohlins-gray-600, #4b5563)" }}>·</span>
              <CurrencyEurIcon size={18} weight="fill" />
              <span className="horas-operario-admin__total-horas-num" style={{ fontSize: "1.4rem" }}>{formatEur(totalImporte)}</span>
            </>
          )}
        </div>
      )}

      {lineas.length === 0 ? (
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
                <th style={{ textAlign: "right" }}>Horas</th>
                {mostrarImporte && <th style={{ textAlign: "right" }}>Importe</th>}
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
                  {mostrarImporte && <td className="horas-operario-admin__horas" style={{ color: "#d1d5db" }}>{formatEur(l.importe)}</td>}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="horas-operario-admin__total-row">
                <td colSpan={mostrarImporte ? 6 : 6}>Total</td>
                <td className="horas-operario-admin__horas">{totalHoras.toFixed(2)}</td>
                {mostrarImporte && <td className="horas-operario-admin__horas" style={{ color: "#facc15" }}>{formatEur(totalImporte)}</td>}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}

// Fila de operario expandible (para Ernesto)
function FilaOperario({ operario, year, month }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="horas-operario-admin__acord">
      <button
        className="horas-operario-admin__acord-header"
        onClick={() => setAbierto((v) => !v)}
      >
        <span className="horas-operario-admin__acord-nombre">
          <UserIcon size={14} weight="fill" />
          {operario.operario}
        </span>
        <span className="horas-operario-admin__acord-stats">
          <span className="horas-operario-admin__acord-stat">
            <ClockIcon size={13} />
            {operario.totalHoras.toFixed(2)} h
          </span>
          {operario.totalImporte > 0 && (
            <span className="horas-operario-admin__acord-stat horas-operario-admin__acord-stat--eur">
              {formatEur(operario.totalImporte)}
            </span>
          )}
          <span className="horas-operario-admin__acord-stat horas-operario-admin__acord-stat--meta">
            {operario.ordenes} órd · {operario.lineas} lín
          </span>
        </span>
        {abierto ? <CaretUpIcon size={16} /> : <CaretDownIcon size={16} />}
      </button>

      {abierto && (
        <div className="horas-operario-admin__acord-body">
          <VistaDetalle operarioId={operario.operarioID} year={year} month={month} mostrarImporte={true} />
        </div>
      )}
    </div>
  );
}

// Vista resumen: todos los operarios con acordeón (para Ernesto)
function VistaResumen({ year, month }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getHorasOperario(year, month)
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [year, month]); // eslint-disable-line

  const operarios = data?.operarios || [];
  const totalHoras = operarios.reduce((s, o) => s + o.totalHoras, 0);
  const totalImporte = operarios.reduce((s, o) => s + (o.totalImporte || 0), 0);

  if (loading) return <div className="trabajos-admin__loading">Cargando...</div>;
  if (error) return <div className="trabajos-admin__empty"><TrayIcon size={40} /><p>Error: {error}</p></div>;

  return (
    <>
      {data && (
        <div className="horas-operario-admin__total-horas">
          <ClockIcon size={22} weight="fill" />
          <span className="horas-operario-admin__total-horas-num">{totalHoras.toFixed(2)}</span>
          <span className="horas-operario-admin__total-horas-label">horas totales · {MESES[month - 1]} {year}</span>
          {totalImporte > 0 && (
            <>
              <span style={{ margin: "0 0.5rem", color: "#4b5563" }}>·</span>
              <CurrencyEurIcon size={18} weight="fill" />
              <span className="horas-operario-admin__total-horas-num" style={{ fontSize: "1.4rem" }}>{formatEur(totalImporte)}</span>
            </>
          )}
        </div>
      )}

      {operarios.length === 0 ? (
        <div className="trabajos-admin__empty">
          <TrayIcon size={40} />
          <p>Sin datos en {MESES[month - 1]} {year}</p>
        </div>
      ) : (
        <div className="horas-operario-admin__acord-list">
          {operarios.map((o) => (
            <FilaOperario key={o.operarioID} operario={o} year={year} month={month} />
          ))}
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
