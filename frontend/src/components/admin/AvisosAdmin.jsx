import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Bell, ChevronLeft, RefreshCw, User, Phone, Calendar, AlertTriangle, Inbox } from "lucide-react";
import api from "../../../services/Api";

const TIPO_COLOR = {
  aceite: "#f59e0b",
  frenos: "#3b82f6",
  refrigerante: "#06b6d4",
  ff: "#8b5cf6",
  rr: "#ec4899",
};

const TIPO_ICON = {
  aceite: "🛢️",
  frenos: "🔧",
  refrigerante: "💧",
  ff: "🏍️",
  rr: "⚙️",
};

function formatFecha(fechaStr) {
  if (!fechaStr) return "—";
  return new Date(fechaStr).toLocaleDateString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function AvisoCard({ aviso }) {
  const color = TIPO_COLOR[aviso.tipo] || "#6b7280";
  const icon = TIPO_ICON[aviso.tipo] || "📣";

  return (
    <div className="aviso-card">
      <div className="aviso-card__tipo" style={{ borderColor: color, color }}>
        <span className="aviso-card__tipo-icon">{icon}</span>
        <span className="aviso-card__tipo-label">{aviso.tipoLabel}</span>
      </div>

      <div className="aviso-card__body">
        <div className="aviso-card__cliente">
          <User size={13} />
          <span>{aviso.cliente.nombre}</span>
        </div>

        {aviso.cliente.telefono && (
          <div className="aviso-card__dato">
            <Phone size={13} />
            <span>{aviso.cliente.telefono}</span>
          </div>
        )}

        <div className="aviso-card__dato">
          <Calendar size={13} />
          <span>Enviado el {formatFecha(aviso.fecha)}</span>
        </div>

        <div className="aviso-card__cif">
          CIF: <em>{aviso.cif}</em>
        </div>
      </div>
    </div>
  );
}

function AvisosAdmin() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const cargar = () => {
    setLoading(true);
    api.pushNotifLog()
      .then((res) => setAvisos(res.data || []))
      .catch(() => setAvisos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const tiposDisponibles = ["todos", ...new Set(avisos.map((a) => a.tipo))];

  const avisosFiltrados = filtroTipo === "todos"
    ? avisos
    : avisos.filter((a) => a.tipo === filtroTipo);

  // Agrupar por fecha para mejor lectura
  const porFecha = avisosFiltrados.reduce((acc, aviso) => {
    const fecha = aviso.fecha || "Sin fecha";
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(aviso);
    return acc;
  }, {});

  const TIPO_LABELS = {
    aceite: "Aceite",
    frenos: "Frenos",
    refrigerante: "Refrigerante",
    ff: "Horquilla FF",
    rr: "Amortiguador RR",
  };

  return (
    <div className="avisos-admin">
      {/* Topbar */}
      <div className="trabajos-admin__topbar">
        <Link to="/admin/clientes" className="trabajos-admin__back">
          <ChevronLeft size={18} /> Volver
        </Link>
        <div className="trabajos-admin__title-wrap">
          <Bell size={18} className="trabajos-admin__title-icon" />
          <h2 className="trabajos-admin__title">Avisos enviados</h2>
        </div>
        <button className="trabajos-admin__refresh" onClick={cargar} title="Actualizar">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filtros por tipo */}
      {!loading && avisos.length > 0 && (
        <div className="avisos-admin__filtros">
          {tiposDisponibles.map((tipo) => (
            <button
              key={tipo}
              className={`avisos-admin__filtro-btn${filtroTipo === tipo ? " avisos-admin__filtro-btn--activo" : ""}`}
              style={filtroTipo === tipo && tipo !== "todos"
                ? { borderColor: TIPO_COLOR[tipo], color: TIPO_COLOR[tipo] }
                : {}}
              onClick={() => setFiltroTipo(tipo)}
            >
              {tipo === "todos" ? `Todos (${avisos.length})` : `${TIPO_ICON[tipo] || ""} ${TIPO_LABELS[tipo] || tipo}`}
            </button>
          ))}
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="trabajos-admin__loading">Cargando avisos...</div>
      ) : avisosFiltrados.length === 0 ? (
        <div className="trabajos-admin__empty">
          <Inbox size={40} />
          <p>{avisos.length === 0 ? "Aún no se han enviado avisos" : "No hay avisos de este tipo"}</p>
        </div>
      ) : (
        Object.entries(porFecha).map(([fecha, items]) => (
          <div key={fecha} className="avisos-admin__grupo">
            <div className="avisos-admin__grupo-header">
              <AlertTriangle size={14} />
              <span>{formatFecha(fecha)}</span>
              <span className="avisos-admin__grupo-count">{items.length}</span>
            </div>
            <div className="avisos-admin__lista">
              {items.map((aviso, i) => (
                <AvisoCard key={`${aviso.cif}-${aviso.tipo}-${i}`} aviso={aviso} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AvisosAdmin;
