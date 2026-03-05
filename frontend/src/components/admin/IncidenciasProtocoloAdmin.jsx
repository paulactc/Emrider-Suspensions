import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { WarningIcon, CaretLeftIcon, TrayIcon, TrashIcon, PlusIcon } from "@phosphor-icons/react";
import api from "../../../services/Api";

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const TIPOS_INCIDENCIA = [
  "Imágenes no comunicadas",
  "Checkin incompleto",
  "Otro",
];

function formatFecha(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function IncidenciasProtocoloAdmin() {
  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth() + 1);

  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [operarios, setOperarios] = useState([]);

  // Form state
  const [form, setForm] = useState({
    operario_nombre: "",
    or_numero: "",
    moto_marca_modelo: "",
    tipo_incidencia: TIPOS_INCIDENCIA[0],
    notas: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);

  const years = [];
  for (let y = hoy.getFullYear(); y >= 2021; y--) years.push(y);

  // Cargar lista de operarios
  useEffect(() => {
    const hoyLocal = new Date();
    api.getHorasOperario(hoyLocal.getFullYear(), hoyLocal.getMonth() + 1)
      .then((res) => {
        const FIJOS = ["Samuele Zanuso", "Rene Orran Beyer"];
        const deGdtaller = (res.operarios || []).map((o) => o.operario).filter(Boolean);
        const todos = [...new Set([...FIJOS, ...deGdtaller])];
        setOperarios(todos);
        if (!form.operario_nombre) {
          setForm((f) => ({ ...f, operario_nombre: todos[0] }));
        }
      })
      .catch(() => {
        setOperarios(["Samuele Zanuso", "Rene Orran Beyer"]);
        setForm((f) => ({ ...f, operario_nombre: "Samuele Zanuso" }));
      });
  }, []); // eslint-disable-line

  // Cargar incidencias del mes
  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getIncidenciasProtocolo(month, year)
      .then((res) => setIncidencias(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [month, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.operario_nombre || !form.or_numero || !form.moto_marca_modelo) return;
    setGuardando(true);
    try {
      await api.crearIncidenciaProtocolo({ ...form, mes: month, anio: year });
      setGuardadoOk(true);
      setForm((f) => ({ ...f, or_numero: "", moto_marca_modelo: "", notas: "" }));
      // Recargar listado
      const res = await api.getIncidenciasProtocolo(month, year);
      setIncidencias(res.data || []);
      setTimeout(() => setGuardadoOk(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta incidencia?")) return;
    try {
      await api.eliminarIncidenciaProtocolo(id);
      setIncidencias((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  return (
    <div className="horas-operario-admin">
      {/* Topbar */}
      <div className="trabajos-admin__topbar">
        <Link to="/admin/clientes" className="trabajos-admin__back">
          <CaretLeftIcon size={18} />
        </Link>
        <div className="trabajos-admin__title-wrap">
          <WarningIcon size={18} className="trabajos-admin__title-icon" />
          <h2 className="trabajos-admin__title">Incidencias de protocolo</h2>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Filtro mes/año */}
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

      {/* Formulario */}
      <form className="incidencias-form" onSubmit={handleSubmit}>
        <h3 className="incidencias-form__titulo">Registrar incidencia</h3>

        <div className="incidencias-form__campos">
          <label className="incidencias-form__campo">
            <span>Operario</span>
            <select
              value={form.operario_nombre}
              onChange={(e) => setForm((f) => ({ ...f, operario_nombre: e.target.value }))}
              required
            >
              {operarios.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="incidencias-form__campo">
            <span>Nº OR</span>
            <input
              type="text"
              value={form.or_numero}
              onChange={(e) => setForm((f) => ({ ...f, or_numero: e.target.value }))}
              placeholder="Ej: 12345"
              required
            />
          </label>

          <label className="incidencias-form__campo">
            <span>Moto (marca / modelo)</span>
            <input
              type="text"
              value={form.moto_marca_modelo}
              onChange={(e) => setForm((f) => ({ ...f, moto_marca_modelo: e.target.value }))}
              placeholder="Ej: Honda CBR 600"
              required
            />
          </label>

          <label className="incidencias-form__campo">
            <span>Tipo de incidencia</span>
            <select
              value={form.tipo_incidencia}
              onChange={(e) => setForm((f) => ({ ...f, tipo_incidencia: e.target.value }))}
            >
              {TIPOS_INCIDENCIA.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>

        <label className="incidencias-form__campo incidencias-form__campo--full">
          <span>Notas (opcional)</span>
          <textarea
            value={form.notas}
            onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
            placeholder="Descripción adicional..."
            rows={2}
          />
        </label>

        <button
          type="submit"
          className="incidencias-form__btn"
          disabled={guardando}
        >
          <PlusIcon size={16} />
          {guardando ? "Guardando..." : "Registrar incidencia"}
        </button>
        {guardadoOk && <p className="incidencias-form__ok">Incidencia registrada correctamente</p>}
      </form>

      {/* Listado */}
      <div className="incidencias-lista">
        <h3 className="incidencias-lista__titulo">
          Incidencias de {MESES[month - 1]} {year}
        </h3>

        {loading && <div className="trabajos-admin__loading">Cargando...</div>}
        {error && <div className="trabajos-admin__empty"><p>Error: {error}</p></div>}

        {!loading && !error && incidencias.length === 0 && (
          <div className="trabajos-admin__empty">
            <TrayIcon size={40} />
            <p>Sin incidencias en {MESES[month - 1]} {year}</p>
          </div>
        )}

        {!loading && incidencias.length > 0 && (
          <div className="horas-operario-admin__tabla-wrap">
            <table className="horas-operario-admin__tabla">
              <thead>
                <tr>
                  <th>Operario</th>
                  <th>Nº OR</th>
                  <th>Moto</th>
                  <th>Tipo</th>
                  <th>Notas</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {incidencias.map((inc) => (
                  <tr key={inc.id}>
                    <td>{inc.operario_nombre}</td>
                    <td><span className="horas-operario-admin__orden">{inc.or_numero}</span></td>
                    <td>{inc.moto_marca_modelo}</td>
                    <td>{inc.tipo_incidencia}</td>
                    <td className="horas-operario-admin__desc">{inc.notas || <span className="horas-operario-admin__vacio">—</span>}</td>
                    <td>{formatFecha(inc.created_at)}</td>
                    <td>
                      <button
                        className="incidencias-lista__btn-eliminar"
                        onClick={() => handleEliminar(inc.id)}
                        title="Eliminar"
                      >
                        <TrashIcon size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default IncidenciasProtocoloAdmin;
