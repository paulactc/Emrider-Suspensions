import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import {
  ChevronLeft, HeartHandshake, Award, Crown, Zap, Shield,
  Wrench, Star, MessageCircle, TrendingUp, Truck, ClipboardCheck,
} from "lucide-react";
import { useClienteData } from "../../../hooks/useClienteData";
import api from "../../../../services/Api";

const NIVELES_EMRIDER = [
  {
    id: 1,
    nombre: "EmRider Baby",
    facturacion: { min: 1, max: 600 },
    imagen: "/images/mono-level1.png",
    alt: "EmRider Baby",
    color: "rookie",
    beneficios: [
      { icon: ClipboardCheck, texto: "Revisión técnica gratuita del estado general de la moto (con cita previa)" },
      { icon: MessageCircle, texto: "Asesoramiento personalizado por WhatsApp con nuestro técnico" },
      { icon: TrendingUp, texto: "Informe anual del estado de tus suspensiones" },
    ],
    rango: "1 - 600 BananaPoints 🍌",
  },
  {
    id: 2,
    nombre: "EmRider Adolescent",
    facturacion: { min: 601, max: 1200 },
    imagen: "/images/mono-level2.png",
    alt: "EmRider Adolescent",
    color: "pro",
    beneficios: [
      { icon: Wrench, texto: "Medición y ajuste de SAG gratuito" },
      { icon: ClipboardCheck, texto: "Revisión técnica gratuita (con cita previa)" },
      { icon: Star, texto: "Prioridad en citas de taller" },
      { icon: MessageCircle, texto: "Línea directa WhatsApp con el técnico" },
      { icon: Shield, texto: "Garantía extendida en mano de obra: 6 meses" },
    ],
    rango: "601 - 1.200 BananaPoints 🍌",
  },
  {
    id: 3,
    nombre: "EmRider Legend",
    facturacion: { min: 1201, max: null },
    imagen: "/images/Logomonoemrider.jpeg",
    alt: "EmRider Legend",
    color: "legend",
    beneficios: [
      { icon: Truck, texto: "Recogida y entrega del vehículo a domicilio gratis" },
      { icon: Wrench, texto: "Medición y ajuste de SAG gratuito" },
      { icon: ClipboardCheck, texto: "Revisión técnica gratuita (con cita previa)" },
      { icon: Star, texto: "Máxima prioridad en agenda de taller" },
      { icon: MessageCircle, texto: "Acceso directo al ingeniero de suspensiones" },
      { icon: Shield, texto: "Garantía extendida en mano de obra: 12 meses" },
    ],
    rango: "+1.200 BananaPoints 🍌",
  },
];

function calcularNivel(facturacionAnual) {
  for (let i = NIVELES_EMRIDER.length - 1; i >= 0; i--) {
    if (facturacionAnual >= NIVELES_EMRIDER[i].facturacion.min) return NIVELES_EMRIDER[i];
  }
  return NIVELES_EMRIDER[0];
}

function ClienteTribu() {
  const { cliente, loading, error } = useClienteData();
  const [facturacionAnual, setFacturacionAnual] = useState(0);
  const [loadingNivel, setLoadingNivel] = useState(true);

  useEffect(() => {
    if (!cliente) return;
    const clientId = cliente.gdtaller_id || cliente.id;
    if (!clientId) { setLoadingNivel(false); return; }

    api
      .getOrderLinesByClient(clientId)
      .then((res) => {
        const ordenes = res.data || [];
        const inicioAno = new Date(new Date().getFullYear(), 0, 1);
        let total = 0;
        for (const orden of ordenes) {
          const fecha = orden.fecha ? new Date(orden.fecha) : null;
          if (fecha && fecha >= inicioAno) total += parseFloat(orden.totalImporte) || 0;
        }
        setFacturacionAnual(total);
      })
      .catch(() => setFacturacionAnual(0))
      .finally(() => setLoadingNivel(false));
  }, [cliente?.gdtaller_id, cliente?.id]);

  const nivelActual = useMemo(() => calcularNivel(facturacionAnual), [facturacionAnual]);
  const siguienteNivel = NIVELES_EMRIDER.find((n) => n.id === nivelActual.id + 1);
  const faltaParaSiguiente = siguienteNivel ? siguienteNivel.facturacion.min - facturacionAnual : 0;
  const porcentajeProgreso = useMemo(() => {
    if (!siguienteNivel) return 100;
    const rango = siguienteNivel.facturacion.min - nivelActual.facturacion.min;
    return Math.min(100, Math.max(0, ((facturacionAnual - nivelActual.facturacion.min) / rango) * 100));
  }, [facturacionAnual, nivelActual, siguienteNivel]);

  if (loading) {
    return (
      <div className="cliente-section-page">
        <Link to="/cliente" className="cliente-section-page__back">
          <ChevronLeft /> Volver
        </Link>
        <div className="cliente-section-page__loading">Cargando...</div>
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

  const nombreCorto =
    cliente?.nombre ||
    (cliente?.nombre_completo || "").split(" ")[0] ||
    "rider";

  return (
    <div className="cliente-section-page">
      <div className="cliente-section-page__topbar">
        <Link to="/cliente" className="cliente-section-page__back">
          <ChevronLeft /> Volver
        </Link>
        <div className="cliente-section-page__title-wrap">
          <div className="cliente-section-page__title-icon"><HeartHandshake /></div>
          <h2 className="cliente-section-page__title">Mi Tribu</h2>
        </div>
      </div>

      <div className="cliente-section-page__content">
        <div className="emrider-tribu">
          <div className="emrider-tribu__welcome">
            <div className="emrider-tribu__welcome-icon"><HeartHandshake /></div>
            <div>
              <h3 className="emrider-tribu__welcome-title">
                Bienvenido a la Tribu, {nombreCorto}
              </h3>
              <p className="emrider-tribu__welcome-text">
                Cada kilómetro que compartes con nosotros cuenta. Gracias por confiar en EmRider.
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
                <p>Cuanto más ruedas con nosotros, más recompensas desbloqueas</p>
              </div>
            </div>

            {!loadingNivel && (
              <div className="emrider-niveles__estado">
                <div className="emrider-niveles__estado-actual">
                  <img
                    src={nivelActual.imagen}
                    alt={nivelActual.alt}
                    className="emrider-niveles__estado-img"
                    onError={(e) => { e.target.style.display = "none"; }}
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

            <div className="emrider-niveles__grid">
              {NIVELES_EMRIDER.map((nivel) => {
                const isCurrentLevel = nivel.id === nivelActual.id;
                const isUnlocked = facturacionAnual >= nivel.facturacion.min;
                return (
                  <div
                    key={nivel.id}
                    className={`nivel-card nivel-card--${nivel.color} ${isCurrentLevel ? "nivel-card--current" : ""} ${isUnlocked ? "nivel-card--unlocked" : "nivel-card--locked"}`}
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
                          <div className="nivel-card__current-badge"><Zap /></div>
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
    </div>
  );
}

export default ClienteTribu;
