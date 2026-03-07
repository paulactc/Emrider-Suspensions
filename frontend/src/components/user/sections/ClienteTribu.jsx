import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import {
  CaretLeftIcon, HandHeartIcon, TrophyIcon, CrownIcon, LightningIcon, ShieldIcon,
  WrenchIcon, StarIcon, ChatCircleIcon, TrendUpIcon, TruckIcon, ClipboardTextIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
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
      { icon: ClipboardTextIcon, texto: "Historial técnico digital de tu moto en la app" },
      { icon: TrendUpIcon, texto: "Recordatorios de mantenimiento preventivo personalizados" },
      { icon: FileTextIcon, texto: "Informe básico digital tras cada visita al taller" },
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
      { icon: ClipboardTextIcon, texto: "Historial técnico digital de tu moto en la app" },
      { icon: TrendUpIcon, texto: "Recordatorios de mantenimiento preventivo personalizados" },
      { icon: FileTextIcon, texto: "Informe técnico detallado tras cada servicio" },
      { icon: LightningIcon, texto: "Acceso anticipado a promociones y nuevos servicios" },
      { icon: ChatCircleIcon, texto: "Consulta técnica gratuita por la app (1 al mes)" },
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
      { icon: TruckIcon, texto: "Recogida o entrega del vehículo a domicilio — Zona 1" },
      { icon: WrenchIcon, texto: "Medición y ajuste de SAG gratuito" },
      { icon: ClipboardTextIcon, texto: "Revisión técnica gratuita" },
      { icon: StarIcon, texto: "Máxima prioridad en agenda de taller" },
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
    const clientId = cliente.cif || cliente.id;
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
  }, [cliente?.cif, cliente?.id]);

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
          <CaretLeftIcon /> Volver
        </Link>
        <div className="cliente-section-page__loading">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cliente-section-page">
        <Link to="/cliente" className="cliente-section-page__back">
          <CaretLeftIcon /> Volver
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
          <CaretLeftIcon /> Volver
        </Link>
        <div className="cliente-section-page__title-wrap">
          <div className="cliente-section-page__title-icon"><HandHeartIcon /></div>
          <h2 className="cliente-section-page__title">Mi Tribu</h2>
        </div>
      </div>

      <div className="cliente-section-page__content">
        <div className="emrider-tribu">
          <div className="emrider-tribu__welcome">
            <div className="emrider-tribu__welcome-icon"><HandHeartIcon /></div>
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
                <TrophyIcon className="emrider-niveles__header-icon" />
              </div>
              <div>
                <h3>Tu nivel y recompensas</h3>
                <p>Cuanto más ruedas con nosotros, más recompensas desbloqueas</p>
              </div>
            </div>

            {/* === NOTA BANANAPOINTS ANUALES === */}
            <div className="emrider-banana-info">
              <span className="emrider-banana-info__emoji">🍌</span>
              <p>Los <strong>BananaPoints</strong> se calculan con los servicios realizados en <strong>{new Date().getFullYear()}</strong> y se reinician cada 1 de enero.</p>
            </div>

            {!loadingNivel && (
              <>
                {/* === SIN BANANAPOINTS AÚN === */}
                {facturacionAnual === 0 ? (
                  <div className="emrider-sin-nivel">
                    <div className="emrider-sin-nivel__emoji">🍌</div>
                    <h3 className="emrider-sin-nivel__titulo">Aún no estás en ningún nivel</h3>
                    <p className="emrider-sin-nivel__texto">
                      Todavía no tienes BananaPoints este año. ¡Cada servicio que realizas en EmRider suma puntos y desbloquea recompensas exclusivas!
                    </p>
                    <p className="emrider-sin-nivel__cta">
                      Visítanos y empieza a subir en la Tribu 🏍️
                    </p>
                  </div>
                ) : (
                  /* === TU NIVEL ACTUAL === */
                  <div className="emrider-nivel-actual emrider-nivel-actual--animado">
                    <div className="emrider-nivel-actual__top">
                      <img
                        src={nivelActual.imagen}
                        alt={nivelActual.alt}
                        className="emrider-nivel-actual__img"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <div className="emrider-nivel-actual__info">
                        <span className="emrider-nivel-actual__label">Tu nivel actual</span>
                        <h3 className="emrider-nivel-actual__nombre">{nivelActual.nombre}</h3>
                        <span className="emrider-nivel-actual__points">
                          <span className="emrider-banana-bounce">🍌</span> {Math.round(facturacionAnual).toLocaleString("es-ES")} BananaPoints en {new Date().getFullYear()}
                        </span>
                      </div>
                    </div>

                    {siguienteNivel ? (
                      <div className="emrider-nivel-actual__progreso">
                        <div className="emrider-nivel-actual__progreso-info">
                          <span>Hacia {siguienteNivel.nombre}</span>
                          <span>Faltan 🍌 {Math.round(faltaParaSiguiente).toLocaleString("es-ES")}</span>
                        </div>
                        <div className="emrider-niveles__progreso-bar">
                          <div
                            className="emrider-niveles__progreso-fill"
                            style={{ width: porcentajeProgreso + "%" }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="emrider-nivel-actual__max">¡Nivel máximo alcanzado! Eres parte de la élite EmRider. 🏆</p>
                    )}

                    <div className="emrider-nivel-actual__beneficios-titulo">Tus beneficios</div>
                    <ul className="nivel-card__beneficios">
                      {nivelActual.beneficios.map((b, idx) => {
                        const IconComp = b.icon;
                        return (
                          <li key={idx}>
                            <IconComp className="nivel-card__beneficio-icon" />
                            <span>{b.texto}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* === SEPARADOR === */}
                <div className="emrider-niveles__divider">
                  <span>Todos los niveles de la Tribu</span>
                </div>

                {/* === TODOS LOS NIVELES === */}
                <div className="emrider-niveles__seccion">
                  <h4 className="emrider-niveles__seccion-titulo">
                    <TrophyIcon /> Niveles de la Tribu
                  </h4>
                  <div className="emrider-niveles__grid">
                    {NIVELES_EMRIDER.map((nivel) => {
                      const isCurrentLevel = nivel.id === nivelActual.id;
                      const isUnlocked = facturacionAnual >= nivel.facturacion.min;
                      const faltanParaEste = isUnlocked ? 0 : Math.round(nivel.facturacion.min - facturacionAnual);
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
                                <div className="nivel-card__current-badge"><LightningIcon /></div>
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
                            <div className="nivel-card__lock-footer">
                              <ShieldIcon className="nivel-card__lock-icon" />
                              <span>Nivel bloqueado</span>
                              <span className="nivel-card__lock-puntos">· Faltan 🍌 {faltanParaEste.toLocaleString("es-ES")}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClienteTribu;
