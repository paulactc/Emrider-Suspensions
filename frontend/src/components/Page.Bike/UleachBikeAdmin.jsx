import { NavLink } from "react-router";
import {
  Tag,
  Bike,
  Calendar,
  Hash,
  Settings,
  AlertTriangle,
  BookAlert,
} from "lucide-react";

function UleachBikeAdmin({ listBikes, clientId, listTechnical }) {
  if (!Array.isArray(listBikes) || listBikes.length === 0) {
    return (
      <div className="uleach-bikes-container">
        <div className="uleach-bikes-container__header">
          <h2>Motocicletas del Cliente</h2>
        </div>
        <div className="uleach-bikes-container__empty">
          <p>No hay motocicletas disponibles</p>
        </div>
      </div>
    );
  }

  // Ya no necesitamos filtrar por clienteId porque las motos vienen filtradas del backend por CIF
  const clientBikes = listBikes;

  return (
    <div className="uleach-bikes-container">
      <div className="uleach-bikes-container__header">
        <h2>Motocicletas del Cliente</h2>
        <p className="uleach-bikes-container__subheader">
          Se encontraron {clientBikes.length} motocicleta
          {clientBikes.length !== 1 ? "s" : ""} registrada
          {clientBikes.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ul className="uleach-bikes-list">
        {clientBikes.map((bike) => (
          <li key={bike.id} className="listMotocicle">
            <div className="listMotocicle__bike-visual">
              <div className="listMotocicle__bike-icon">🏍️</div>
              <div className="listMotocicle__badge">{bike.marca}</div>
            </div>

            <div className="listMotocicle__content">
              <div className="listMotocicle__specs">
                <div className="listMotocicle__spec-item">
                  <Tag className="listMotocicle__spec-item-icon" />
                  <span className="listMotocicle__spec-item-label">Marca:</span>
                  <span className="listMotocicle__spec-item-value">
                    {bike.marca || "No disponible"}
                  </span>
                </div>

                <div className="listMotocicle__spec-item">
                  <Bike className="listMotocicle__spec-item-icon" />
                  <span className="listMotocicle__spec-item-label">
                    Modelo:
                  </span>
                  <span className="listMotocicle__spec-item-value">
                    {bike.modelo || "No disponible"}
                  </span>
                </div>

                <div className="listMotocicle__spec-item">
                  <Calendar className="listMotocicle__spec-item-icon" />
                  <span className="listMotocicle__spec-item-label">Año:</span>
                  <span className="listMotocicle__spec-item-value">
                    {bike.anio || bike.anoFabricacion || "No disponible"}
                  </span>
                </div>

                <div className="listMotocicle__spec-item">
                  <Hash className="listMotocicle__spec-item-icon" />
                  <span className="listMotocicle__spec-item-label">
                    Matrícula:
                  </span>
                  <span className="listMotocicle__spec-item-value">
                    {bike.matricula || bike.Matricula || "No disponible"}
                  </span>
                </div>

                <div className="listMotocicle__spec-item">
                  <BookAlert className="listMotocicle__spec-item-icon" />
                  <span className="listMotocicle__spec-item-label">
                    Bastidor:
                  </span>
                  <span className="listMotocicle__spec-item-value">
                    {bike.bastidor || "No disponible"}
                  </span>
                </div>
              </div>

              <NavLink
                className="Newcustombike"
                to={`/admin/datos-tecnicos-admin/${bike.id}`}
                state={{ listTechnical }}
              >
                <Settings /> Ver datos técnicos
              </NavLink>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UleachBikeAdmin;
