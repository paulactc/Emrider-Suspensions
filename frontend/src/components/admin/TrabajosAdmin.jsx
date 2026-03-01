import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  WrenchIcon, CaretLeftIcon, CalendarIcon, HashIcon, MotorcycleIcon,
  ArrowRightIcon, ArrowClockwiseIcon, CheckCircleIcon, EyeIcon, UserIcon,
} from "@phosphor-icons/react";
import api from "../../../services/Api";

const TIPO_LABEL = { FF: "Horquilla delantera", RR: "Amortiguador trasero" };
const SERVICIO_LABEL = {
  "mantenimiento-basico": "Mantenimiento básico",
  "mantenimiento-basico-retener": "Mantenimiento básico + retener",
  "modificacion-hidraulico": "Modificación hidráulica",
  "mantenimiento-completo": "Mantenimiento completo",
  "reparacion": "Reparación",
  "revision": "Revisión",
};

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function TrabajoCard({ t, finalizado = false, onContinuar, onVer }) {
  const motoNombre = (
    [t.moto_marca_gdtaller, t.moto_modelo_gdtaller].filter(Boolean).join(" ") ||
    "Moto sin datos"
  ).toUpperCase();

  return (
    <div className={`trabajo-card${finalizado ? " trabajo-card--finalizado" : ""}`}>
      <div className="trabajo-card__header">
        <span className={`trabajo-card__tipo trabajo-card__tipo--${(t.tipo_suspension || "ff").toLowerCase()}`}>
          {TIPO_LABEL[t.tipo_suspension] || t.tipo_suspension}
        </span>
        <span className="trabajo-card__or">
          <HashIcon size={12} /> {t.numero_orden}
        </span>
        {finalizado && (
          <span className="trabajo-card__badge-finalizado">
            <CheckCircleIcon size={12} /> Finalizado
          </span>
        )}
      </div>

      <div className="trabajo-card__body">
        <div className="trabajo-card__cliente">
          <UserIcon size={13} />
          <span>{t.nombre_cliente || t.cif_cliente || "Cliente desconocido"}</span>
        </div>
        <div className="trabajo-card__moto">
          <MotorcycleIcon size={15} />
          <span>
            {motoNombre}
            {t.matricula_moto && <em> · {t.matricula_moto}</em>}
          </span>
        </div>
        {t.servicio_suspension && (
          <div className="trabajo-card__servicio">
            <WrenchIcon size={13} />
            {SERVICIO_LABEL[t.servicio_suspension] || t.servicio_suspension}
          </div>
        )}
        <div className="trabajo-card__fecha">
          <CalendarIcon size={13} />
          {formatDate(t.fecha_servicio)}
        </div>
      </div>

      {finalizado ? (
        <button className="trabajo-card__btn trabajo-card__btn--ver" onClick={() => onVer(t)}>
          <EyeIcon size={14} /> Ver datos técnicos
        </button>
      ) : (
        <button className="trabajo-card__btn" onClick={() => onContinuar(t)}>
          Continuar datos técnicos <ArrowRightIcon size={14} />
        </button>
      )}
    </div>
  );
}

function TrabajosAdmin({ modo = "pendientes" }) {
  const esPendientes = modo === "pendientes";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargar = () => {
    setLoading(true);
    const peticion = esPendientes
      ? api.getPendingServicios().catch(() => ({ data: [] }))
      : api.getCompletedServicios().catch(() => ({ data: [] }));
    peticion
      .then((res) => setItems(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [modo]);

  const irAFormulario = (trabajo) => {
    const tipo = (trabajo.tipo_suspension || "FF").toUpperCase();
    const motoId = trabajo.moto_id || trabajo.matricula_moto || "0";
    const clientId = trabajo.cliente_id || "";
    const cifCliente = trabajo.cif_cliente || "";
    const params = new URLSearchParams();
    if (clientId) params.set("clientId", clientId);
    if (cifCliente) params.set("cifCliente", cifCliente);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const ruta =
      tipo === "RR"
        ? `/admin/form-technical-rr/${motoId}${qs}`
        : `/admin/form-technical-ff/${motoId}${qs}`;
    navigate(ruta);
  };

  const verFinalizado = (trabajo) => navigate(`/admin/servicio/${trabajo.id}`);

  const titulo = esPendientes ? "Trabajos pendientes" : "Trabajos finalizados";
  const IconoTitulo = esPendientes ? WrenchIcon : CheckCircleIcon;

  return (
    <div className={`trabajos-admin${esPendientes ? "" : " trabajos-admin--finalizados"}`}>
      <div className="trabajos-admin__topbar">
        <Link to="/admin/clientes" className="trabajos-admin__back">
          <CaretLeftIcon size={18} /> Volver
        </Link>
        <div className="trabajos-admin__title-wrap">
          <IconoTitulo className="trabajos-admin__title-icon" />
          <h2 className="trabajos-admin__title">{titulo}</h2>
        </div>
        <button className="trabajos-admin__refresh" onClick={cargar} title="Actualizar">
          <ArrowClockwiseIcon size={16} />
        </button>
      </div>

      {loading ? (
        <div className="trabajos-admin__loading">
          Cargando {esPendientes ? "trabajos pendientes" : "trabajos finalizados"}...
        </div>
      ) : items.length === 0 ? (
        <div className="trabajos-admin__empty">
          <IconoTitulo size={40} />
          <p>No hay {esPendientes ? "trabajos pendientes" : "trabajos finalizados"}</p>
        </div>
      ) : (
        <div className="trabajos-admin__seccion">
          <div className="trabajos-admin__seccion-header">
            <IconoTitulo
              size={16}
              className={`trabajos-admin__seccion-icon${esPendientes ? "" : " trabajos-admin__seccion-icon--check"}`}
            />
            <h3 className="trabajos-admin__seccion-title">{titulo}</h3>
            <span
              className={`trabajos-admin__seccion-count${
                esPendientes ? "" : " trabajos-admin__seccion-count--finalizados"
              }`}
            >
              {items.length}
            </span>
          </div>
          <div className="trabajos-admin__list">
            {items.map((t) =>
              esPendientes ? (
                <TrabajoCard key={t.id} t={t} onContinuar={irAFormulario} />
              ) : (
                <TrabajoCard key={t.id} t={t} finalizado onVer={verFinalizado} />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TrabajosAdmin;
