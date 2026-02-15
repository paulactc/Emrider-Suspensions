// UleachBike.js
import MotoDataDisplay from "../user/MotoDataDisplay";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  Tag,
  Bike,
  Calendar,
  Hash,
  Settings,
  AlertTriangle,
  BookAlert,
  ArrowLeft,
} from "lucide-react";
import Caducidad from "../user/Caducidad";

function UleachBike({ listBikes, listTechnical }) {
  const navigate = useNavigate();
  const [mantenimientoCaducado, setMantenimientoCaducado] = useState({});

  const handleFichaCaducada = (bikeId, caducado) => {
    setMantenimientoCaducado((prev) => ({ ...prev, [bikeId]: caducado }));
  };

  const handleCancelar = () => {
    navigate(-1);
  };

  if (!Array.isArray(listBikes) || listBikes.length === 0) {
    return (
      <div className="uleach-bikes-container">
        <div className="uleach-bikes-container__header">
          <h2>Mis Motocicletas</h2>
          <button onClick={handleCancelar} className="Newcustom">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
            <span>Volver</span>
          </button>
        </div>
        <div className="uleach-bikes-container__empty">
          <p>No hay motocicletas disponibles</p>
        </div>
      </div>
    );
  }

  const clientBikes = listBikes;

  return (
    <div className="uleach-bikes-container">
      <div className="uleach-bikes-container__header">
        <h2>Mis Motocicletas</h2>
        <button onClick={handleCancelar} className="Newcustom">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
          <span>Volver</span>
        </button>

        <p className="uleach-bikes-container__subheader">
          Consulta tus {clientBikes.length} motocicleta
          {clientBikes.length !== 1 ? "s" : ""} registrada
          {clientBikes.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ul className="uleach-bikes-list">
        {clientBikes.map((bike) => {
          const caducado = mantenimientoCaducado[bike.id] === true;

          return (
            <li
              key={bike.id}
              className={`listMotocicle ${
                caducado ? "mantenimiento-caducado" : ""
              }`}
            >
              <div className="listMotocicle__bike-visual">
                <div className="listMotocicle__bike-icon">🏍️</div>

                {caducado && (
                  <div className="mantenimiento-alerta">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-semibold">
                      Mantenimiento de
                      <br /> suspensiones caducado
                    </span>
                  </div>
                )}

                <div className="listMotocicle__badge">{bike.marca}</div>
              </div>

              <div className="listMotocicle__content">
                <div className="listMotocicle__specs">
                  <div className="listMotocicle__spec-item">
                    <Tag className="listMotocicle__spec-item-icon" />
                    <span className="listMotocicle__spec-item-label">
                      Marca:
                    </span>
                    <span className="listMotocicle__spec-item-value">
                      {bike.marca}
                    </span>
                  </div>

                  <div className="listMotocicle__spec-item">
                    <Bike className="listMotocicle__spec-item-icon" />
                    <span className="listMotocicle__spec-item-label">
                      Modelo:
                    </span>
                    <span className="listMotocicle__spec-item-value">
                      {bike.modelo}
                    </span>
                  </div>

                  <div className="listMotocicle__spec-item">
                    <Calendar className="listMotocicle__spec-item-icon" />
                    <span className="listMotocicle__spec-item-label">Año:</span>
                    <span className="listMotocicle__spec-item-value">
                      {bike.anio}
                    </span>
                  </div>

                  <div className="listMotocicle__spec-item">
                    <Hash className="listMotocicle__spec-item-icon" />
                    <span className="listMotocicle__spec-item-label">
                      Matrícula:
                    </span>
                    <span className="listMotocicle__spec-item-value">
                      {bike.matricula}
                    </span>
                  </div>

                  <div className="listMotocicle__spec-item">
                    <BookAlert className="listMotocicle__spec-item-icon" />
                    <span className="listMotocicle__spec-item-label">
                      Bastidor:
                    </span>
                    <span className="listMotocicle__spec-item-value">
                      {bike.bastidor}
                    </span>
                  </div>
                </div>

                {/* Datos del cuestionario de configuración de suspensión */}
                <MotoDataDisplay moto={bike} />

                <NavLink
                  className="Newcustombike "
                  to={`/custom/datos-tecnicos/${bike.id}`}
                  state={{ listTechnical }}
                >
                  <Settings /> Servicios realizados
                </NavLink>

                <Caducidad
                  datetechnicalArray={listTechnical?.datostecnicos || []}
                  motoId={bike.id}
                  onFichaCaducada={(caducado) =>
                    handleFichaCaducada(bike.id, caducado)
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default UleachBike;
