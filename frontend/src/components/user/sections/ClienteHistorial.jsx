import React from "react";
import { Link } from "react-router";
import { ChevronLeft, History } from "lucide-react";
import HistorialOrdenes from "../HistorialOrdenes";
import { useClienteData } from "../../../hooks/useClienteData";

function ClienteHistorial() {
  const { cliente, loading, error } = useClienteData();

  if (loading) {
    return (
      <div className="cliente-section-page">
        <Link to="/cliente" className="cliente-section-page__back">
          <ChevronLeft /> Volver
        </Link>
        <div className="cliente-section-page__loading">Cargando historial...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cliente-section-page">
        <Link to="/cliente" className="cliente-section-page__back">
          <ChevronLeft /> Volver
        </Link>
        <p className="cliente-section-page__error">{error}</p>
      </div>
    );
  }

  return (
    <div className="cliente-section-page">
      <div className="cliente-section-page__topbar">
        <Link to="/cliente" className="cliente-section-page__back">
          <ChevronLeft /> Volver
        </Link>
        <div className="cliente-section-page__title-wrap">
          <div className="cliente-section-page__title-icon"><History /></div>
          <h2 className="cliente-section-page__title">Historial de Trabajos</h2>
        </div>
      </div>

      <div className="cliente-section-page__content">
        <HistorialOrdenes clientId={cliente?.gdtaller_id || cliente?.id} />
      </div>
    </div>
  );
}

export default ClienteHistorial;
