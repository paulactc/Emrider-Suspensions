import ClienteDataDisplay from "./ClienteDataDisplay";
import HistorialOrdenes from "./HistorialOrdenes";
import { NavLink } from "react-router";
import React, { useEffect, useState } from "react";
import {
  User,
  Phone,
  FileUser,
  MapPin,
  Code,
  Building,
  Edit3,
  Bike,
  Plus,
  Star,
  Gift,
  Zap,
  Crown,
  ArrowRight,
  Percent,
  Calendar,
  Award,
  Banana,
} from "lucide-react";
import api from "../../../services/Api";

function UleachCustomUser({ Custom }) {
  const [motos, setMotos] = useState([]);

  useEffect(() => {
    if (!Custom) return;

    if (Custom.cif) {
      api
        .getMotosByCif(Custom.cif)
        .then(setMotos)
        .catch((err) => console.error("Error cargando motos por CIF:", err));
    }
  }, [Custom?.cif]);

  const tieneMotos = motos.length > 0;
  const safeDisplay = (value) => value || "No disponible";

  // Sistema de niveles por BananaPoints 🍌 EmRider
  const clienteActual = {
    BananaPoints: 850, // Esto vendría de tu API
    nivel: 2, // Calculado basado en puntos
    facturaTotal: 2400, // Para cálculo de puntos
    visitasAno: 8, // Para cálculo de asiduidad
  };

  const nivelesEmRider = [
    {
      id: 1,
      nombre: "Emrider baby",
      BananaPoints: { min: 0, max: 499 },
      imagen: "/images/mono-level1.png",
      alt: "EmRider Baby - Nivel principiante", // Alt text para accesibilidad
      color: "rookie",
      beneficios: [
        "Medición y ajuste SAG gratuito",
        "15% descuento en material de suspensiones",
        "Asesoramiento técnico básico",
      ],
      requisitos: "0-499 BananaPoints 🍌 • Nivel de entrada",
    },
    {
      id: 2,
      nombre: "Emrider adolescent",
      BananaPoints: { min: 500, max: 1199 },
      imagen: "/images/mono-level2.png",
      alt: "EmRider Adolescent - Nivel intermedio", // Alt text para accesibilidad
      color: "pro",
      beneficios: [
        "30% descuento en materiales (15% adicional)",
        "Chequeo completo: 20 BananaPoints 🍌 de revisión",
        "Setup personalizado según pilotaje",
        "Prioridad en citas de taller",
      ],
      requisitos: "500-1199 BananaPoints 🍌 • Por facturación y asiduidad",
    },
    {
      id: 3,
      nombre: "Emrider Legend",
      BananaPoints: { min: 1200, max: null },
      imagen: "/images/Logomonoemrider.jpeg", // ✅ Ruta corregida desde components/user
      alt: "EmRider Legend - Nivel élite", // Alt text para accesibilidad
      color: "legend",
      beneficios: [
        "45% descuento en todos los materiales",
        "Servicio VIP: recogida y entrega a domicilio",
        "Acceso directo al ingeniero de suspensiones",
        "Merchandising exclusivo EmRider",
      ],
      requisitos: "1200+ BananaPoints 🍌 • Élite de clientes EmRider",
    },
  ];

  const nivelActual = nivelesEmRider.find(
    (nivel) =>
      clienteActual.BananaPoints >= nivel.BananaPoints.min &&
      (nivel.BananaPoints.max === null ||
        clienteActual.BananaPoints <= nivel.BananaPoints.max)
  );

  const siguienteNivel = nivelesEmRider.find(
    (nivel) => nivel.id === nivelActual.id + 1
  );

  const puntosParaSiguienteNivel = siguienteNivel
    ? siguienteNivel.BananaPoints.min - clienteActual.BananaPoints
    : 0;

  const porcentajeProgreso = siguienteNivel
    ? ((clienteActual.BananaPoints - nivelActual.BananaPoints.min) /
        (siguienteNivel.BananaPoints.min - nivelActual.BananaPoints.min)) *
      100
    : 100;

  const customerDataEssential = [
    { icon: Phone, label: "Teléfono", value: Custom.telefono },
    { icon: FileUser, label: "Cif", value: Custom.cif },
    {
      icon: MapPin,
      label: "Ubicación",
      value: `${Custom.direccion || ""} ${Custom.poblacion || ""}, `.replace(
        /^,\s*|,\s*$/,
        ""
      ),
    },
  ];
  const progresoEstilo = { width: porcentajeProgreso + "%" };

  return (
    <div className="uleach-customer-compact">
      {/* Header compacto con información esencial */}
      <div className="uleach-customer-compact__header">
        <div className="uleach-customer-compact__profile">
          <div className="uleach-customer-compact__avatar">
            <img
              src="/images/Logomonoemrider.jpeg"
              alt="EmRider"
              className="uleach-customer-compact__avatar-img"
            />
          </div>
          <div className="uleach-customer-compact__basic-info">
            <h2>
              {safeDisplay(
                `${Custom.nombre || ""} ${Custom.apellidos || ""}`.trim()
              )}
            </h2>
            <p>Cliente Emrider</p>
            <div className="uleach-customer-compact__status">
              <Star className="status-icon" />
              <span>Cliente Premium</span>
            </div>
          </div>
        </div>

        <div className="uleach-customer-compact__quick-actions">
        </div>
      </div>

      {/* Información esencial en formato compacto */}
      <div className="uleach-customer-compact__info">
        {customerDataEssential.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="info-item">
              <IconComponent className="info-icon" />
              <span className="info-text">{safeDisplay(item.value)}</span>
            </div>
          );
        })}
      </div>

      {/* Datos del cuestionario de pilotaje */}
      <ClienteDataDisplay cliente={Custom} />

      {/* ✅ MOTOCICLETAS - Solo cambios en la lógica, manteniendo clases existentes */}
      <div className="uleach-customer-compact__bikes">
        {Custom.id && (
          <>
            {tieneMotos ? (
              <NavLink
                to={`/admin/motos/${Custom.id}`}
                state={{ motos, cif: Custom.cif }}
                className="bike-link"
                title="Ver mis motocicletas"
              >
                <Bike />
                <span>Mis motocicletas ({motos.length})</span>
              </NavLink>
            ) : (
              <p className="no-results-message">
                No tiene motocicletas registradas
              </p>
            )}
          </>
        )}
      </div>

      {/* Historial de ordenes de trabajo de GDTaller */}
      <HistorialOrdenes clientId={Custom.gdtaller_id || Custom.id} />

      {/* NUEVA SECCIÓN: Sistema de Niveles EmRider */}
      <div className="emrider-exclusive">
        <div className="emrider-exclusive__header">
          <div className="exclusive-badge">
            <Crown className="crown-icon" />
            <span>EmRider BananaPoints </span>
          </div>
          <h3>Tribal Emrider</h3>
          <p>Avanza por la Ruta Emrider y desbloquea recompensas</p>
        </div>

        {/* Estado actual del cliente */}
        <div className="rider-status">
          <div className="rider-status__current">
            <div className="current-level">
              <div className="Nivel">TU NIVEL:</div>
              <div className="level-icon">
                <img
                  src={nivelActual.imagen}
                  alt={nivelActual.alt}
                  className="level-image"
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
                <div className="level-fallback" style={{ display: "none" }}>
                  🏍️
                </div>
              </div>
              <div className="level-info">
                <h4>{nivelActual.nombre}</h4>
                <div className="points-display">
                  <Banana className="points-icon" />
                  <span>
                    {clienteActual.BananaPoints.toLocaleString()} BananaPoints
                    🍌
                  </span>
                </div>
              </div>
            </div>

            {siguienteNivel && (
              <div className="level-progress">
                <div className="progress-info">
                  <span>Progreso hacia {siguienteNivel.nombre}</span>
                  <span>{puntosParaSiguienteNivel} BananaPoints restantes</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={progresoEstilo} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grid de todos los niveles */}
        <div className="rider-levels">
          {nivelesEmRider.map((nivel) => {
            const isCurrentLevel = nivel.id === nivelActual.id;
            const isUnlocked =
              clienteActual.BananaPoints >= nivel.BananaPoints.min;

            return (
              <div
                key={nivel.id}
                className={`level-card level-card--${nivel.color} ${
                  isCurrentLevel ? "level-card--current" : ""
                } ${
                  isUnlocked ? "level-card--unlocked" : "level-card--locked"
                }`}
              >
                <div className="level-card__header">
                  <div className="level-badge">
                    {isCurrentLevel && <Crown className="current-crown" />}
                    <div className="level-icon-large">
                      <img
                        src={nivel.imagen}
                        alt={nivel.alt}
                        className="level-image-large"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          display: "block",
                        }}
                        onError={(e) => {
                          console.log("Error cargando imagen:", nivel.imagen);
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <div
                        className="level-fallback-large"
                        style={{ display: "none" }}
                      >
                        {nivel.id === 1 ? "🏍️" : nivel.id === 2 ? "🏁" : "🏆"}
                      </div>
                    </div>
                  </div>
                  <div className="level-title">
                    <h4>{nivel.nombre}</h4>
                    <p>{nivel.requisitos}</p>
                  </div>
                </div>

                <div className="level-card__benefits">
                  <h5>Beneficios incluidos:</h5>
                  <ul>
                    {nivel.beneficios.map((beneficio, index) => (
                      <li key={index}>
                        <Award className="benefit-icon" />
                        <span>{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isCurrentLevel && (
                  <div className="level-card__active">
                    <div className="active-badge">
                      <Zap />
                      <span>NIVEL ACTUAL</span>
                    </div>
                  </div>
                )}

                {!isUnlocked && (
                  <div className="level-card__locked">
                    <div className="locked-overlay">
                      <span>🔒 Bloqueado</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cómo ganar BananaPoints 🍌 */}
        <div className="points-info">
          <h4>¿Cómo ganar BananaPoints🍌 Emrider?</h4>
          <div className="points-methods">
            <div className="method">
              <div className="method-icon">💰</div>
              <div className="method-details">
                <h5>Por Facturación</h5>
                <p>1 BananaPoints 🍌 por cada €1 gastado en servicios</p>
              </div>
            </div>
            <div className="method">
              <div className="method-icon">📅</div>
              <div className="method-details">
                <h5>Por Asiduidad</h5>
                <p>100 BananaPoints 🍌 bonus por cada 3 visitas anuales</p>
              </div>
            </div>
            <div className="method">
              <div className="method-icon">⭐</div>
              <div className="method-details">
                <h5>Acciones Especiales</h5>
                <p>Referencias, reseñas, eventos exclusivos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="emrider-exclusive__cta">
          <div className="exclusive-benefits">
            <Zap className="benefits-icon" />
            <div className="benefits-text">
              <h4>¡Maximiza tus beneficios!</h4>
              <p>
                Consulta tu historial de BananaPoints 🍌 y próximas recompensas
              </p>
            </div>
            <button className="benefits-btn">
              Ver historial
              <ArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UleachCustomUser;
