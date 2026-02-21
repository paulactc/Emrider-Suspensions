import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Bike, ChevronLeft, ChevronDown, ChevronUp,
  Wrench, Calendar, Hash, FileUser, Gauge,
} from "lucide-react";
import { useClienteData } from "../../../hooks/useClienteData";
import api from "../../../../services/Api";

function ClienteGarage() {
  const { cliente, loading, error } = useClienteData();
  const [motos, setMotos] = useState([]);
  const [serviciosPorMoto, setServiciosPorMoto] = useState({});
  const [motoExpandida, setMotoExpandida] = useState(null);
  const [loadingMotos, setLoadingMotos] = useState(false);

  useEffect(() => {
    if (!cliente?.cif) return;
    setLoadingMotos(true);
    api
      .getMotosByCif(cliente.cif)
      .then((motosData) => {
        const lista = motosData || [];
        setMotos(lista);
        lista.forEach((moto) => {
          const key = moto.matricula || moto.id;
          if (key) {
            api
              .getServiciosByMoto(key)
              .then((res) =>
                setServiciosPorMoto((prev) => ({ ...prev, [key]: res.data || [] }))
              )
              .catch(() => {});
          }
        });
      })
      .catch(() => setMotos([]))
      .finally(() => setLoadingMotos(false));
  }, [cliente?.cif]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const getMantenimientoStatus = (moto) => {
    const key = moto.matricula || moto.id;
    const servicios = serviciosPorMoto[key] || [];
    if (servicios.length === 0)
      return { status: "sin-datos", texto: "Sin servicio de suspensiones registrado" };

    const reciente = [...servicios].sort(
      (a, b) => new Date(b.fecha_servicio || 0) - new Date(a.fecha_servicio || 0)
    )[0];
    const conFecha = servicios.filter((s) => s.fecha_proximo_mantenimiento);
    if (conFecha.length === 0)
      return { status: "sin-datos", texto: `Servicio realizado el ${formatDate(reciente?.fecha_servicio)}` };

    const prox = conFecha.sort(
      (a, b) => new Date(b.fecha_servicio || 0) - new Date(a.fecha_servicio || 0)
    )[0].fecha_proximo_mantenimiento;
    const diffDias = Math.ceil((new Date(prox) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDias < 0)
      return { status: "caducado", texto: `Mantenimiento de suspensiones caducado (${formatDate(prox)})` };
    if (diffDias <= 30)
      return { status: "proximo", texto: `Mantenimiento próximo (${formatDate(prox)})` };
    return { status: "ok", texto: `Próximo mantenimiento: ${formatDate(prox)}` };
  };

  if (loading || loadingMotos) {
    return (
      <div className="cliente-section-page">
        <Link to="/cliente" className="cliente-section-page__back">
          <ChevronLeft /> Volver
        </Link>
        <div className="cliente-section-page__loading">Cargando garage...</div>
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
          <div className="cliente-section-page__title-icon"><Bike /></div>
          <h2 className="cliente-section-page__title">Mi Garage</h2>
        </div>
      </div>

      {motos.length === 0 ? (
        <div className="moto-card moto-card--empty">
          <Bike />
          <p>No se encontraron motocicletas registradas.</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
            Contacta con nosotros para asociar tus motos a tu cuenta.
          </p>
        </div>
      ) : (
        <div className="client-motos-list">
          {motos.map((moto) => {
            const motoKey = moto.matricula || moto.id;
            const mantenimiento = getMantenimientoStatus(moto);
            const isOpen = motoExpandida === motoKey;
            return (
              <div
                key={moto.id || moto.matricula}
                className={`moto-card${isOpen ? " moto-card--open" : ""}`}
              >
                <button
                  className="moto-card__toggle"
                  onClick={() => setMotoExpandida(isOpen ? null : motoKey)}
                >
                  <div className="moto-card__toggle-left">
                    <div className="moto-card__icon"><Bike /></div>
                    <div className="moto-card__info">
                      <span className="moto-card__nombre">{moto.marca} {moto.modelo}</span>
                      <span className="moto-card__matricula">{moto.matricula || "Sin matrícula"}</span>
                    </div>
                  </div>
                  <div className="moto-card__toggle-right">
                    <div className={`moto-card__status-dot moto-card__status-dot--${mantenimiento.status}`} />
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </button>

                {isOpen && (
                  <div className="moto-card__detail">
                    <div className="moto-card__ficha">
                      <h4 className="moto-card__section-title">Ficha del vehículo</h4>
                      <div className="moto-card__ficha-grid">
                        <div className="moto-card__ficha-item">
                          <Bike className="moto-card__ficha-icon" />
                          <div>
                            <span className="moto-card__ficha-label">Marca / Modelo</span>
                            <span className="moto-card__ficha-value">{moto.marca || "—"} {moto.modelo || "—"}</span>
                          </div>
                        </div>
                        <div className="moto-card__ficha-item">
                          <Hash className="moto-card__ficha-icon" />
                          <div>
                            <span className="moto-card__ficha-label">Matrícula</span>
                            <span className="moto-card__ficha-value">{moto.matricula || "—"}</span>
                          </div>
                        </div>
                        <div className="moto-card__ficha-item">
                          <Calendar className="moto-card__ficha-icon" />
                          <div>
                            <span className="moto-card__ficha-label">Año</span>
                            <span className="moto-card__ficha-value">{moto.anio || "—"}</span>
                          </div>
                        </div>
                        {moto.bastidor && (
                          <div className="moto-card__ficha-item">
                            <FileUser className="moto-card__ficha-icon" />
                            <div>
                              <span className="moto-card__ficha-label">Bastidor</span>
                              <span className="moto-card__ficha-value">{moto.bastidor}</span>
                            </div>
                          </div>
                        )}
                        {moto.km && (
                          <div className="moto-card__ficha-item">
                            <Gauge className="moto-card__ficha-icon" />
                            <div>
                              <span className="moto-card__ficha-label">Kilómetros</span>
                              <span className="moto-card__ficha-value">
                                {Number(moto.km).toLocaleString("es-ES")} km
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="moto-card__section">
                      <h4 className="moto-card__section-title">Mantenimiento de suspensiones</h4>
                      <div className={`moto-card__mantenimiento moto-card__mantenimiento--${mantenimiento.status}`}>
                        <Wrench className="moto-card__mantenimiento-icon" />
                        <span>{mantenimiento.texto}</span>
                      </div>
                    </div>

                    {moto.especialidad && (
                      <div className="moto-card__section">
                        <h4 className="moto-card__section-title">Preferencias de suspensión</h4>
                        <div className="moto-card__questionnaire-row">
                          <div className="moto-card__questionnaire-left">
                            <span className="moto-card__questionnaire-badge done">Realizado</span>
                            <span className="moto-card__questionnaire-status">
                              {moto.especialidad} · {moto.tipoConduccion} · {moto.preferenciaRigidez}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
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

export default ClienteGarage;
