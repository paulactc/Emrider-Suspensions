import ClienteDataDisplay from "./ClienteDataDisplay";
import HistorialOrdenes from "./HistorialOrdenes";
import { NavLink } from "react-router";
import React, { useEffect, useState, useMemo } from "react";
import {
  Phone,
  FileUser,
  MapPin,
  Bike,
  Star,
  Zap,
  Crown,
  ChevronDown,
  ChevronUp,
  Wrench,
  Truck,
  ClipboardCheck,
  MessageCircle,
  TrendingUp,
  Shield,
  HeartHandshake,
  Award,
  Calendar,
  Gauge,
  Hash,
} from "lucide-react";
import api from "../../../services/Api";

// Definicion de niveles EmRider basados en facturacion anual
const NIVELES_EMRIDER = [
  {
    id: 1,
    nombre: "EmRider Baby",
    facturacion: { min: 1, max: 600 },
    imagen: "/images/mono-level1.png",
    alt: "EmRider Baby",
    color: "rookie",
    beneficios: [
      { icon: ClipboardCheck, texto: "Revision tecnica gratuita del estado general de la moto (con cita previa)" },
      { icon: MessageCircle, texto: "Asesoramiento personalizado por WhatsApp con nuestro tecnico" },
      { icon: TrendingUp, texto: "Informe anual del estado de tus suspensiones" },
    ],
    rango: "1 - 600 BananaPoints \uD83C\uDF4C",
  },
  {
    id: 2,
    nombre: "EmRider Adolescent",
    facturacion: { min: 601, max: 1200 },
    imagen: "/images/mono-level2.png",
    alt: "EmRider Adolescent",
    color: "pro",
    beneficios: [
      { icon: Wrench, texto: "Medicion y ajuste de SAG gratuito" },
      { icon: ClipboardCheck, texto: "Revision tecnica gratuita (con cita previa)" },
      { icon: Star, texto: "Prioridad en citas de taller" },
      { icon: MessageCircle, texto: "Linea directa WhatsApp con el tecnico" },
      { icon: Shield, texto: "Garantia extendida en mano de obra: 6 meses" },
    ],
    rango: "601 - 1.200 BananaPoints \uD83C\uDF4C",
  },
  {
    id: 3,
    nombre: "EmRider Legend",
    facturacion: { min: 1201, max: null },
    imagen: "/images/Logomonoemrider.jpeg",
    alt: "EmRider Legend",
    color: "legend",
    beneficios: [
      { icon: Truck, texto: "Recogida y entrega del vehiculo a domicilio gratis" },
      { icon: Wrench, texto: "Medicion y ajuste de SAG gratuito" },
      { icon: ClipboardCheck, texto: "Revision tecnica gratuita (con cita previa)" },
      { icon: Star, texto: "Maxima prioridad en agenda de taller" },
      { icon: MessageCircle, texto: "Acceso directo al ingeniero de suspensiones" },
      { icon: Shield, texto: "Garantia extendida en mano de obra: 12 meses" },
    ],
    rango: "+1.200 BananaPoints \uD83C\uDF4C",
  },
];

function calcularNivel(facturacionAnual) {
  for (let i = NIVELES_EMRIDER.length - 1; i >= 0; i--) {
    if (facturacionAnual >= NIVELES_EMRIDER[i].facturacion.min) {
      return NIVELES_EMRIDER[i];
    }
  }
  return NIVELES_EMRIDER[0];
}

function UleachCustomUser({ Custom }) {
  const [motos, setMotos] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showMotos, setShowMotos] = useState(false);
  const [facturacionAnual, setFacturacionAnual] = useState(0);
  const [loadingNivel, setLoadingNivel] = useState(true);

  const [serviciosPorMoto, setServiciosPorMoto] = useState({});
  const [motoExpandida, setMotoExpandida] = useState(null);

  useEffect(() => {
    if (!Custom) return;

    if (Custom.cif) {
      api
        .getMotosByCif(Custom.cif)
        .then((motosData) => {
          setMotos(motosData || []);
          // Cargar servicios para cada moto
          (motosData || []).forEach((moto) => {
            const motoKey = moto.matricula || moto.id;
            if (motoKey) {
              api.getServiciosByMoto(motoKey)
                .then((res) => {
                  setServiciosPorMoto((prev) => ({
                    ...prev,
                    [motoKey]: res.data || [],
                  }));
                })
                .catch(() => {});
            }
          });
        })
        .catch((err) => console.error("Error cargando motos por CIF:", err));
    }
  }, [Custom?.cif]);

  // Calcular facturacion anual desde las ordenes de trabajo
  useEffect(() => {
    const clientId = Custom?.gdtaller_id || Custom?.id;
    if (!clientId) {
      setLoadingNivel(false);
      return;
    }

    api
      .getOrderLinesByClient(clientId)
      .then((res) => {
        const ordenes = res.data || [];
        const ahora = new Date();
        const inicioAno = new Date(ahora.getFullYear(), 0, 1);

        // Sumar importes de ordenes del ano en curso
        let total = 0;
        for (const orden of ordenes) {
          const fechaOrden = orden.fecha ? new Date(orden.fecha) : null;
          if (fechaOrden && fechaOrden >= inicioAno) {
            total += parseFloat(orden.totalImporte) || 0;
          }
        }
        setFacturacionAnual(total);
      })
      .catch((err) => {
        console.warn("No se pudo calcular facturacion anual:", err.message);
        setFacturacionAnual(0);
      })
      .finally(() => setLoadingNivel(false));
  }, [Custom?.gdtaller_id, Custom?.id]);

  const tieneMotos = motos.length > 0;
  const safeDisplay = (value) => value || "\u2014";

  // Helper: comprobar estado de mantenimiento de suspensiones
  const getMantenimientoStatus = (moto) => {
    const motoKey = moto.matricula || moto.id;
    const servicios = serviciosPorMoto[motoKey] || [];

    // Si no hay ningun servicio de suspensiones registrado por EmRider
    if (servicios.length === 0) {
      return { status: "sin-datos", texto: "Sin servicio de suspensiones registrado" };
    }

    // Buscar el servicio mas reciente (para mostrar fecha de registro)
    const servicioReciente = [...servicios].sort(
      (a, b) => new Date(b.fecha_servicio || 0) - new Date(a.fecha_servicio || 0)
    )[0];
    const fechaRegistro = servicioReciente?.fecha_servicio;

    // Buscar la fecha de proximo mantenimiento mas reciente
    const conFecha = servicios.filter((s) => s.fecha_proximo_mantenimiento);
    if (conFecha.length === 0) {
      return { status: "sin-datos", texto: `Servicio realizado el ${formatDate(fechaRegistro)}` };
    }

    const fechaProximo = conFecha.sort(
      (a, b) => new Date(b.fecha_servicio || 0) - new Date(a.fecha_servicio || 0)
    )[0].fecha_proximo_mantenimiento;

    const ahora = new Date();
    const fecha = new Date(fechaProximo);
    const diffDias = Math.ceil((fecha - ahora) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) {
      return { status: "caducado", texto: `Servicio realizado - Mantenimiento de suspensiones caducado (${formatDate(fechaProximo)})` };
    }
    if (diffDias <= 30) {
      return { status: "proximo", texto: `Servicio realizado - Mantenimiento de suspensiones proximo (${formatDate(fechaProximo)})` };
    }
    return { status: "ok", texto: `Servicio realizado - Proximo mantenimiento de suspensiones: ${formatDate(fechaProximo)}` };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const nivelActual = useMemo(() => calcularNivel(facturacionAnual), [facturacionAnual]);

  const siguienteNivel = NIVELES_EMRIDER.find((n) => n.id === nivelActual.id + 1);

  const faltaParaSiguiente = siguienteNivel
    ? siguienteNivel.facturacion.min - facturacionAnual
    : 0;

  const porcentajeProgreso = useMemo(() => {
    if (!siguienteNivel) return 100;
    const rangoActual = siguienteNivel.facturacion.min - nivelActual.facturacion.min;
    const progreso = facturacionAnual - nivelActual.facturacion.min;
    return Math.min(100, Math.max(0, (progreso / rangoActual) * 100));
  }, [facturacionAnual, nivelActual, siguienteNivel]);

  const nombreCompleto =
    `${Custom.nombre || ""} ${Custom.apellidos || ""}`.trim() || "Cliente";
  const ubicacion = `${Custom.direccion || ""} ${Custom.poblacion || ""}`
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className="uleach-customer-compact">
      {/* Cabecera centrada con nombre protagonista */}
      <div className="client-summary">
        <div className="client-summary__center">
          <div className="client-summary__avatar">
            <img
              src="/images/Logomonoemrider.jpeg"
              alt="EmRider"
              className="client-summary__avatar-img"
            />
          </div>
          <h2 className="client-summary__nombre">{safeDisplay(nombreCompleto)}</h2>
          <div className="client-summary__badges">
            {!loadingNivel && (
              <span className={`badge badge--${nivelActual.color}`}>
                <Crown className="badge__icon" />
                {nivelActual.nombre}
              </span>
            )}
            <span className="badge badge--facturacion">
              🍌 {Math.round(facturacionAnual).toLocaleString("es-ES")} BananaPoints
            </span>
          </div>
        </div>

        <button
          className="client-summary__toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span>Mis datos</span>
          {showDetails ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {/* Panel de datos colapsable */}
      {showDetails && (
        <div className="client-details">
          <div className="client-details__grid">
            <div className="client-details__item">
              <Phone className="client-details__icon" />
              <div>
                <span className="client-details__label">Telefono</span>
                <span className="client-details__value">
                  {safeDisplay(Custom.telefono)}
                </span>
              </div>
            </div>
            <div className="client-details__item">
              <FileUser className="client-details__icon" />
              <div>
                <span className="client-details__label">CIF / DNI</span>
                <span className="client-details__value">
                  {safeDisplay(Custom.cif)}
                </span>
              </div>
            </div>
            {ubicacion && (
              <div className="client-details__item">
                <MapPin className="client-details__icon" />
                <div>
                  <span className="client-details__label">Ubicacion</span>
                  <span className="client-details__value">{ubicacion}</span>
                </div>
              </div>
            )}
          </div>
          <ClienteDataDisplay cliente={Custom} />

        </div>
      )}

      {/* Motocicletas del cliente - con desplegable */}
      {Custom.id && (
        <div className="client-motos-section">
          <button
            className="client-motos-section__toggle"
            onClick={() => setShowMotos(!showMotos)}
          >
            <div className="client-motos-section__toggle-left">
              <Bike />
              <span>Mis Motocicletas ({motos.length})</span>
            </div>
            {showMotos ? <ChevronUp /> : <ChevronDown />}
          </button>

          {showMotos && (
            <div className="client-motos-section__list">
              {tieneMotos ? (
                motos.map((moto) => {
                  const motoKey = moto.matricula || moto.id;
                  const mantenimiento = getMantenimientoStatus(moto);
                  const isOpen = motoExpandida === motoKey;

                  return (
                    <div key={moto.id || moto.matricula} className={`moto-card ${isOpen ? "moto-card--open" : ""}`}>
                      {/* Cabecera clickable */}
                      <button
                        className="moto-card__toggle"
                        onClick={() => setMotoExpandida(isOpen ? null : motoKey)}
                      >
                        <div className="moto-card__toggle-left">
                          <div className="moto-card__icon">
                            <Bike />
                          </div>
                          <div className="moto-card__info">
                            <span className="moto-card__nombre">
                              {moto.marca} {moto.modelo}
                            </span>
                            <span className="moto-card__matricula">
                              {moto.matricula || "Sin matricula"}
                            </span>
                          </div>
                        </div>
                        <div className="moto-card__toggle-right">
                          <div className={`moto-card__status-dot moto-card__status-dot--${mantenimiento.status}`} />
                          {isOpen ? <ChevronUp /> : <ChevronDown />}
                        </div>
                      </button>

                      {/* Panel expandible */}
                      {isOpen && (
                        <div className="moto-card__detail">
                          {/* Ficha de la moto */}
                          <div className="moto-card__ficha">
                            <h4 className="moto-card__section-title">Ficha del vehiculo</h4>
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
                                  <span className="moto-card__ficha-label">Matricula</span>
                                  <span className="moto-card__ficha-value">{moto.matricula || "—"}</span>
                                </div>
                              </div>
                              <div className="moto-card__ficha-item">
                                <Calendar className="moto-card__ficha-icon" />
                                <div>
                                  <span className="moto-card__ficha-label">Ano</span>
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
                                    <span className="moto-card__ficha-label">Kilometros</span>
                                    <span className="moto-card__ficha-value">{Number(moto.km).toLocaleString("es-ES")} km</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Estado de mantenimiento de suspensiones */}
                          <div className="moto-card__section">
                            <h4 className="moto-card__section-title">Mantenimiento de suspensiones</h4>
                            <div className={`moto-card__mantenimiento moto-card__mantenimiento--${mantenimiento.status}`}>
                              <Wrench className="moto-card__mantenimiento-icon" />
                              <span>{mantenimiento.texto}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="moto-card moto-card--empty">
                  <Bike />
                  <p>No se encontraron motocicletas registradas.</p>
                  <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                    Si tienes motos en EmRider, contacta con nosotros para que las asociemos a tu cuenta.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PROTAGONISTA: Historial de ordenes de trabajo */}
      <HistorialOrdenes clientId={Custom.gdtaller_id || Custom.id} />

      {/* Sistema de Niveles EmRider */}
      <div className="emrider-tribu">
        <div className="emrider-tribu__welcome">
          <div className="emrider-tribu__welcome-icon">
            <HeartHandshake />
          </div>
          <div>
            <h3 className="emrider-tribu__welcome-title">
              Bienvenido a la Tribu, {Custom.nombre || Custom.apellidos || "rider"}
            </h3>
            <p className="emrider-tribu__welcome-text">
              Cada kilometro que compartes con nosotros cuenta. Gracias por confiar en EmRider.
            </p>
          </div>
        </div>

        <div className="emrider-niveles">
        <div className="emrider-niveles__header">
          <div className="emrider-niveles__header-icon-wrap">
            <Award className="emrider-niveles__header-icon" />
          </div>
          <div>
            <h3>Tu nivel y recompensas</h3>
            <p>Cuanto mas ruedas con nosotros, mas recompensas desbloqueas</p>
          </div>
        </div>

        {/* Estado actual */}
        {!loadingNivel && (
          <div className="emrider-niveles__estado">
            <div className="emrider-niveles__estado-actual">
              <img
                src={nivelActual.imagen}
                alt={nivelActual.alt}
                className="emrider-niveles__estado-img"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="emrider-niveles__estado-info">
                <span className="emrider-niveles__estado-label">Tu nivel actual</span>
                <h4>{nivelActual.nombre}</h4>
                <span className="emrider-niveles__estado-facturacion">
                  🍌 {Math.round(facturacionAnual).toLocaleString("es-ES")} BananaPoints en {new Date().getFullYear()}
                </span>
              </div>
            </div>

            {siguienteNivel && (
              <div className="emrider-niveles__progreso">
                <div className="emrider-niveles__progreso-info">
                  <span>Siguiente: {siguienteNivel.nombre}</span>
                  <span>Faltan 🍌 {Math.round(faltaParaSiguiente).toLocaleString("es-ES")}</span>
                </div>
                <div className="emrider-niveles__progreso-bar">
                  <div
                    className="emrider-niveles__progreso-fill"
                    style={{ width: porcentajeProgreso + "%" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grid de niveles */}
        <div className="emrider-niveles__grid">
          {NIVELES_EMRIDER.map((nivel) => {
            const isCurrentLevel = nivel.id === nivelActual.id;
            const isUnlocked = facturacionAnual >= nivel.facturacion.min;

            return (
              <div
                key={nivel.id}
                className={`nivel-card nivel-card--${nivel.color} ${
                  isCurrentLevel ? "nivel-card--current" : ""
                } ${isUnlocked ? "nivel-card--unlocked" : "nivel-card--locked"}`}
              >
                <div className="nivel-card__header">
                  <div className="nivel-card__icon">
                    <img
                      src={nivel.imagen}
                      alt={nivel.alt}
                      className="nivel-card__img"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="nivel-card__img-fallback" style={{ display: "none" }}>
                      {nivel.id === 1 ? "🏍️" : nivel.id === 2 ? "🏁" : "🏆"}
                    </div>
                    {isCurrentLevel && (
                      <div className="nivel-card__current-badge">
                        <Zap />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4>{nivel.nombre}</h4>
                    <span className="nivel-card__rango">{nivel.rango}</span>
                  </div>
                </div>

                <ul className="nivel-card__beneficios">
                  {nivel.beneficios.map((b, idx) => {
                    const IconComp = b.icon;
                    return (
                      <li key={idx}>
                        <IconComp className="nivel-card__beneficio-icon" />
                        <span>{b.texto}</span>
                      </li>
                    );
                  })}
                </ul>

                {!isUnlocked && (
                  <div className="nivel-card__overlay">
                    <Shield className="nivel-card__overlay-icon" />
                    <span>Nivel bloqueado</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}

export default UleachCustomUser;
