import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Bike, ChevronLeft, ChevronDown, ChevronUp,
  Wrench, Calendar, Hash, FileUser, Gauge, AlertTriangle,
  Droplets, Flame, Wind,
} from "lucide-react";
import { useClienteData } from "../../../hooks/useClienteData";
import api from "../../../../services/Api";

const normMat = (m) => (m || "").replace(/\s+/g, "").toUpperCase();

function ClienteGarage() {
  const { cliente, loading, error } = useClienteData();
  const [motos, setMotos] = useState([]);
  const [serviciosPorMoto, setServiciosPorMoto] = useState({});
  const [alertasMotor, setAlertasMotor] = useState({});
  const [motoExpandida, setMotoExpandida] = useState(null);
  const [loadingMotos, setLoadingMotos] = useState(false);

  useEffect(() => {
    if (!cliente?.cif) return;
    setLoadingMotos(true);

    const clienteId = cliente.gdtaller_id || cliente.id;

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

    // Cargar alertas de mantenimiento de motor (aceite, frenos, refrigerante)
    if (clienteId) {
      api.getMaintenanceAlerts(clienteId)
        .then((res) => setAlertasMotor(res.data || {}))
        .catch(() => {});
    }
  }, [cliente?.cif, cliente?.gdtaller_id, cliente?.id]);

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

    // Usar fecha_proximo_mantenimiento explícita si existe, o calcular 1 año desde el servicio
    const conFecha = servicios.filter((s) => s.fecha_proximo_mantenimiento);
    let prox;
    if (conFecha.length > 0) {
      prox = conFecha.sort(
        (a, b) => new Date(b.fecha_servicio || 0) - new Date(a.fecha_servicio || 0)
      )[0].fecha_proximo_mantenimiento;
    } else if (reciente?.fecha_servicio) {
      const d = new Date(reciente.fecha_servicio);
      d.setFullYear(d.getFullYear() + 1);
      prox = d.toISOString().split("T")[0];
    } else {
      return { status: "sin-datos", texto: "Sin servicio de suspensiones registrado" };
    }

    const diffDias = Math.ceil((new Date(prox) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDias < 0)
      return { status: "caducado", texto: `Mantenimiento de suspensiones caducado (${formatDate(prox)})` };
    if (diffDias <= 30)
      return { status: "proximo", texto: `Mantenimiento próximo (${formatDate(prox)})` };
    return { status: "ok", texto: `Próximo mantenimiento: ${formatDate(prox)}` };
  };

  // True si CUALQUIER aviso de mantenimiento está caducado
  const tieneCualquierAlerta = (moto) => {
    const mant = getMantenimientoStatus(moto);
    if (mant.status === "caducado") return true;
    const alertas = alertasMotor[normMat(moto.matricula)];
    if (!alertas) return false;
    return !!(alertas.aceite?.alerta || alertas.frenos?.alerta || alertas.refrigerante?.alerta);
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
            const hayAlerta = tieneCualquierAlerta(moto);
            const isOpen = motoExpandida === motoKey;
            return (
              <div
                key={moto.id || moto.matricula}
                className={`moto-card${isOpen ? " moto-card--open" : ""}${hayAlerta ? " moto-card--alert" : ""}`}
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
                    {hayAlerta && (
                      <AlertTriangle className="moto-card__alert-icon" />
                    )}
                    <div className={`moto-card__status-dot moto-card__status-dot--${hayAlerta ? "caducado" : mantenimiento.status}`} />
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

                    {/* ── AVISOS ── */}
                    {(() => {
                      const alertasMat = alertasMotor[normMat(moto.matricula)] || {};
                      const a = alertasMat.aceite;
                      const af = alertasMat.frenos;
                      const ar = alertasMat.refrigerante;

                      const stSusp = mantenimiento;
                      const stAceite = !a
                        ? { status: "sin-datos", texto: "Sin registro de cambio de aceite" }
                        : a.alerta
                        ? { status: "caducado", texto: `Sustitución recomendada · último cambio hace ${a.mesesDesde} meses (${formatDate(a.ultimaFecha)})` }
                        : { status: "ok", texto: `Último cambio: ${formatDate(a.ultimaFecha)} · hace ${a.mesesDesde} meses` };
                      const stFreno = !af
                        ? { status: "sin-datos", texto: "Sin registro de cambio de líquido de frenos" }
                        : af.alerta
                        ? { status: "caducado", texto: `Sustitución recomendada · hace ${af.mesesDesde} meses (${formatDate(af.ultimaFecha)})` }
                        : { status: "ok", texto: `Último cambio: ${formatDate(af.ultimaFecha)} · hace ${af.mesesDesde} meses` };
                      const stRefri = !ar
                        ? { status: "sin-datos", texto: "Sin registro de cambio de refrigerante" }
                        : ar.alerta
                        ? { status: "caducado", texto: `Sustitución recomendada · hace ${ar.mesesDesde} meses (${formatDate(ar.ultimaFecha)})` }
                        : { status: "ok", texto: `Último cambio: ${formatDate(ar.ultimaFecha)} · hace ${ar.mesesDesde} meses` };

                      const hayAviso =
                        stSusp.status === "caducado" ||
                        stAceite.status === "caducado" ||
                        stFreno.status === "caducado" ||
                        stRefri.status === "caducado";

                      return (
                        <div className="moto-avisos">
                          <div className="moto-avisos__header">
                            <h4 className="moto-avisos__title">Avisos</h4>
                            {hayAviso && (
                              <span className="moto-avisos__badge">
                                <AlertTriangle size={13} /> Revisión pendiente
                              </span>
                            )}
                          </div>

                          {/* Suspensiones */}
                          <div className="moto-avisos__item">
                            <span className="moto-avisos__item-label"><Wrench size={13} /> Suspensiones</span>
                            <div className={`moto-card__mantenimiento moto-card__mantenimiento--${stSusp.status}`}>
                              <Wrench className="moto-card__mantenimiento-icon" />
                              <span>{stSusp.texto}</span>
                            </div>
                          </div>

                          {/* Aceite de motor */}
                          <div className="moto-avisos__item">
                            <span className="moto-avisos__item-label"><Droplets size={13} /> Aceite de motor</span>
                            <div className={`moto-card__mantenimiento moto-card__mantenimiento--${stAceite.status}`}>
                              <Droplets className="moto-card__mantenimiento-icon" />
                              <span>{stAceite.texto}</span>
                            </div>
                          </div>

                          {/* Líquido de frenos */}
                          <div className="moto-avisos__item">
                            <span className="moto-avisos__item-label"><Wind size={13} /> Líquido de frenos</span>
                            <div className={`moto-card__mantenimiento moto-card__mantenimiento--${stFreno.status}`}>
                              <Wind className="moto-card__mantenimiento-icon" />
                              <span>{stFreno.texto}</span>
                            </div>
                          </div>

                          {/* Refrigerante */}
                          <div className="moto-avisos__item">
                            <span className="moto-avisos__item-label"><Flame size={13} /> Refrigerante</span>
                            <div className={`moto-card__mantenimiento moto-card__mantenimiento--${stRefri.status}`}>
                              <Flame className="moto-card__mantenimiento-icon" />
                              <span>{stRefri.texto}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

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
