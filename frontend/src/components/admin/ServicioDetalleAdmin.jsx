import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeftIcon, FileTextIcon, WrenchIcon, CheckCircleIcon,
  HashIcon, CalendarIcon, GaugeIcon, MotorcycleIcon, UserIcon,
} from "@phosphor-icons/react";
import api from "../../../services/Api";
import DatosTecnicosServicio from "../user/DatosTecnicosServicio";
import "../../styles/FormTechnicalDataWithClientData.scss";

const SERVICIO_LABEL = {
  "mantenimiento-basico": "Mantenimiento básico",
  "mantenimiento-basico-retener": "Mantenimiento básico + cambio de retener original",
  "modificacion-hidraulico": "Modificación hidráulica",
  "mantenimiento-completo": "Mantenimiento completo",
  "reparacion": "Reparación",
  "revision": "Revisión",
};

const TIPO_LABEL = {
  FF: "Horquilla delantera (FF)",
  RR: "Amortiguador trasero (RR)",
};

function formatDate(d) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function InfoRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="servicio-detalle__row">
      <span className="servicio-detalle__row-label">{label}</span>
      <span className="servicio-detalle__row-value">{value}</span>
    </div>
  );
}

function ServicioDetalleAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("ID de servicio no válido");
      setLoading(false);
      return;
    }
    api.getServicioInfo(id)
      .then((res) => {
        if (res.success && res.data) {
          setServicio(res.data);
        } else {
          setError("Servicio no encontrado");
        }
      })
      .catch(() => setError("Error al cargar el servicio"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="app-containerform">
        <div className="form-technical__loading-container">
          <div className="form-technical__loading-spinner" />
          <h3>Cargando servicio...</h3>
          <p>Preparando datos</p>
        </div>
      </div>
    );
  }

  if (error || !servicio) {
    return (
      <div className="app-containerform">
        <div className="error-container">
          <p>{error || "Servicio no encontrado"}</p>
          <button onClick={() => navigate(-1)} className="btn-retry">Volver</button>
        </div>
      </div>
    );
  }

  const tipo = servicio.tipo_suspension || "FF";
  const motoNombre = [servicio.marca, servicio.modelo].filter(Boolean).join(" ");

  return (
    <div className="app-containerform">
      {/* ── Header ── */}
      <div className="form-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeftIcon size={18} /> Volver
        </button>
        <div className="header-title">
          <h1>Trabajo finalizado</h1>
          {servicio.matricula_moto && (
            <p>
              {motoNombre || "Moto"} · {servicio.matricula_moto}
            </p>
          )}
        </div>
        <span className="suspension-type-badge">{TIPO_LABEL[tipo] || tipo}</span>
      </div>

      <div className="servicio-detalle">

        {/* ── Información del servicio ── */}
        <div className="servicio-detalle__section">
          <div className="section-header">
            <FileTextIcon size={20} />
            <h2>Información del servicio</h2>
            <span className="status-saved">
              <CheckCircleIcon size={13} /> Finalizado
            </span>
          </div>

          <div className="servicio-detalle__grid">
            <InfoRow label="Número de orden" value={servicio.numero_orden} />
            <InfoRow label="Fecha del servicio" value={formatDate(servicio.fecha_servicio)} />
            <InfoRow
              label="Kilómetros"
              value={servicio.km_moto ? `${Number(servicio.km_moto).toLocaleString("es-ES")} km` : null}
            />
            <InfoRow
              label="Próximo mantenimiento"
              value={formatDate(servicio.fecha_proximo_mantenimiento)}
            />
            <InfoRow
              label="Tipo de servicio"
              value={SERVICIO_LABEL[servicio.servicio_suspension] || servicio.servicio_suspension}
            />
            <InfoRow label="Marca suspensión" value={servicio.marca} />
            <InfoRow label="Modelo" value={servicio.modelo} />
            <InfoRow label="Año" value={servicio.año} />
            <InfoRow label="Referencia" value={servicio.referencia} />
            <InfoRow
              label="Peso del piloto"
              value={servicio.peso_piloto ? `${servicio.peso_piloto} kg` : null}
            />
            <InfoRow label="Disciplina" value={servicio.disciplina} />
            <InfoRow label="CIF cliente" value={servicio.cif_cliente} />
          </div>

          {servicio.observaciones_servicio && (
            <div className="servicio-detalle__obs">
              <span className="servicio-detalle__obs-label">Observaciones</span>
              <p className="servicio-detalle__obs-text">{servicio.observaciones_servicio}</p>
            </div>
          )}
          {servicio.observaciones && (
            <div className="servicio-detalle__obs">
              <span className="servicio-detalle__obs-label">Observaciones generales</span>
              <p className="servicio-detalle__obs-text">{servicio.observaciones}</p>
            </div>
          )}
        </div>

        {/* ── Datos técnicos ── */}
        <div className="servicio-detalle__section">
          <div className="section-header">
            <WrenchIcon size={20} />
            <h2>
              Datos técnicos —{" "}
              {tipo === "FF" ? "Horquilla delantera" : "Amortiguador trasero"}
            </h2>
          </div>
          <DatosTecnicosServicio servicios={[servicio]} />
        </div>

      </div>
    </div>
  );
}

export default ServicioDetalleAdmin;
