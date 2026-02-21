import React from "react";
import { Link } from "react-router";
import { ChevronLeft, Sliders } from "lucide-react";
import DatosTecnicosServicio from "../DatosTecnicosServicio";
import { useClienteData } from "../../../hooks/useClienteData";

function ClienteSettings() {
  const { cliente, loading, error } = useClienteData();

  if (loading) {
    return (
      <div className="cliente-section-page">
        <Link to="/cliente" className="cliente-section-page__back">
          <ChevronLeft /> Volver
        </Link>
        <div className="cliente-section-page__loading">Cargando datos técnicos...</div>
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
          <div className="cliente-section-page__title-icon"><Sliders /></div>
          <h2 className="cliente-section-page__title">Suspensiones</h2>
        </div>
      </div>

      <div className="cliente-section-page__content">
        <DatosTecnicosServicio cif={cliente?.cif} groupByMoto={true} />
      </div>
    </div>
  );
}

export default ClienteSettings;
