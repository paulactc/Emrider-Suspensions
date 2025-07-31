// UleachBike.js
import { useState } from "react";
import { NavLink } from "react-router";
import {
  Tag,
  Bike,
  Calendar,
  Hash,
  Settings,
  AlertTriangle,
} from "lucide-react";
import Caducidad from "../user/Caducidad";

function UleachBike({ listBikes, clientId, listTechnical }) {
  if (!Array.isArray(listBikes) || listBikes.length === 0) {
    return (
      <div className="uleach-bikes-container">
        <div className="uleach-bikes-container__header">
          <h2>Mis Motocicletas</h2>
        </div>
        <div className="uleach-bikes-container__empty">
          <p>No hay motocicletas disponibles</p>
        </div>
      </div>
    );
  }

  const clientBikes = listBikes.filter(
    (bike) => bike.clienteId === parseInt(clientId)
  );

  const [mantenimientoCaducado, setMantenimientoCaducado] = useState({});

  const handleFichaCaducada = (bikeId, caducado) => {
    setMantenimientoCaducado((prev) => ({ ...prev, [bikeId]: caducado }));
  };

  return (
    <div className="uleach-bikes-container">
      <div className="uleach-bikes-container__header">
        <h2>Mis Motocicletas</h2>
        <p>
          Consulta tus {clientBikes.length} motocicleta
          {clientBikes.length !== 1 ? "s" : ""} registrada
          {clientBikes.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ul className="uleach-bikes-container__grid">
        {clientBikes.map((bike) => {
          const caducado = mantenimientoCaducado[bike.id] === true;

          return (
            <li
              key={bike.id}
              className={`listMotocicle ${
                caducado ? "mantenimiento-caducado" : ""
              }`}
            >
              <div className="listMotocicle__bike-visual relative">
                <div className="listMotocicle__bike-icon"></div>
                {caducado && (
                  <div className="absolute top-1 left-12 flex items-center gap-1 text-red-600 animate-pulse">
                    <AlertTriangle size={16} />
                    <span className="text-sm font-semibold">
                      Mantenimiento caducado
                    </span>
                  </div>
                )}
                <div className="listMotocicle__badge">{bike.marca}</div>
              </div>

              <div className="listMotocicle__content">
                {caducado && (
                  <div className="alerta-aviso mb-2 text-red-600 flex items-center">
                    <AlertTriangle size={16} className="mr-2" />
                    <span className="error-message">
                      Mantenimiento caducado
                    </span>
                  </div>
                )}

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
                      {bike.anoFabricacion}
                    </span>
                  </div>

                  <div className="listMotocicle__spec-item">
                    <Hash className="listMotocicle__spec-item-icon" />
                    <span className="listMotocicle__spec-item-label">
                      Matrícula:
                    </span>
                    <span className="listMotocicle__spec-item-value">
                      {bike.Matricula}
                    </span>
                  </div>
                </div>

                <NavLink
                  className="Newcustombike mt-4 inline-block"
                  to={`/custom/datos-tecnicos/${bike.id}`}
                  state={{ listTechnical }}
                >
                  <Settings /> Ver datos técnicos
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
