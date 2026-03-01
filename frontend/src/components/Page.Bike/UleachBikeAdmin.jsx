import { NavLink } from "react-router"; // ✅ CORREGIDO: react-router-dom en lugar de react-router
import { useState } from "react";
import {
  TagIcon,
  MotorcycleIcon,
  CalendarIcon,
  HashIcon,
  GearIcon,
  WarningIcon,
  IdentificationCardIcon,
  PlusIcon,
  WrenchIcon,
  XIcon,
} from "@phosphor-icons/react";

// Modal para seleccionar tipo de suspensión
const SuspensionTypeModal = ({ isOpen, onClose, onSelect, motoData }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Crear Datos Técnicos</h3>
          <button onClick={onClose} className="modal-close">
            <XIcon size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p>Selecciona el tipo de suspensión para configurar:</p>
          {(motoData?.marca || motoData?.modelo || motoData?.matricula) && (
            <p className="moto-info">
              <strong>
                {motoData?.marca} {motoData?.modelo}
              </strong>
              {motoData?.matricula && ` - ${motoData.matricula}`}
            </p>
          )}

          <div className="suspension-options">
            <button
              onClick={() => onSelect("FF")}
              className="suspension-option suspension-option--ff"
            >
              <div className="option-icon">🔧</div>
              <div className="option-details">
                <h4>FF - Front Fork</h4>
                <p>Horquilla delantera</p>
              </div>
            </button>

            <button
              onClick={() => onSelect("RR")}
              className="suspension-option suspension-option--rr"
            >
              <div className="option-icon">⚙️</div>
              <div className="option-details">
                <h4>RR - Rear Shock</h4>
                <p>Amortiguador trasero</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function UleachBikeAdmin({ listBikes, clientId, listTechnical }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedMoto, setSelectedMoto] = useState(null);

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

  const clientBikes = listBikes;

  const handleCreateTechnicalData = (moto) => {
    setSelectedMoto(moto);
    setShowModal(true);

    console.log("✅ Modal debería estar abierto ahora");
  };

  const handleSuspensionSelect = (type) => {
    console.log("🚀 PASO 2 - Suspension seleccionada:", type);
    console.log("🔍 selectedMoto en handleSuspensionSelect:", selectedMoto);
    console.log("🔍 selectedMoto.id:", selectedMoto?.id);

    setShowModal(false);

    // Verificación exhaustiva
    if (!selectedMoto) {
      console.error("❌ ERROR: selectedMoto es null/undefined");
      alert("❌ Error: No hay moto seleccionada");
      return;
    }

    if (!selectedMoto.id) {
      console.error("❌ ERROR: selectedMoto.id es undefined");
      console.error("❌ selectedMoto completo:", selectedMoto);
      alert("❌ Error: La moto no tiene ID válido");
      return;
    }

    // Redirigir al formulario correspondiente con los datos necesarios
    const path =
      type === "FF"
        ? `/admin/form-technical-ff/${selectedMoto.id}`
        : `/admin/form-technical-rr/${selectedMoto.id}`;

    console.log("🎯 PASO 3 - URL construida:", path);
    console.log("🌐 URL completa:", window.location.origin + path);

    // Agregar clientId como query parameter
    const fullUrl = path + `?clientId=${clientId}`;
    console.log("🌐 URL final con clientId:", fullUrl);

    // Usar window.location para navegar
    console.log("🚀 PASO 4 - Navegando...");
    window.location.href = fullUrl;
  };

  return (
    <>
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
                    <TagIcon className="listMotocicle__spec-item-icon" />
                    <span className="listMotocicle__spec-item-label">
                      Marca:
                    </span>
                    <span className="listMotocicle__spec-item-value">
                      {bike.marca || "No disponible"}
                    </span>
                  </div>

                  <div className="listMotocicle__spec-item">
                    <MotorcycleIcon className="listMotocicle__spec-item-icon" />
                    <span className="listMotocicle__spec-item-label">
                      Modelo:
                    </span>
                    <span className="listMotocicle__spec-item-value">
                      {bike.modelo || "No disponible"}
                    </span>
                  </div>

                  <div className="listMotocicle__spec-item">
                    <CalendarIcon className="listMotocicle__spec-item-icon" />
                    <span className="listMotocicle__spec-item-label">Año:</span>
                    <span className="listMotocicle__spec-item-value">
                      {bike.anio || bike.anoFabricacion || "No disponible"}
                    </span>
                  </div>

                  <div className="listMotocicle__spec-item">
                    <HashIcon className="listMotocicle__spec-item-icon" />
                    <span className="listMotocicle__spec-item-label">
                      Matrícula:
                    </span>
                    <span className="listMotocicle__spec-item-value">
                      {bike.matricula || bike.Matricula || "No disponible"}
                    </span>
                  </div>

                  <div className="listMotocicle__spec-item">
                    <IdentificationCardIcon className="listMotocicle__spec-item-icon" />
                    <span className="listMotocicle__spec-item-label">
                      Bastidor:
                    </span>
                    <span className="listMotocicle__spec-item-value">
                      {bike.bastidor || "No disponible"}
                    </span>
                  </div>
                </div>

                <div className="admin-actions">
                  <NavLink
                    className="Newcustombike"
                    to={`/admin/datos-tecnicos-admin/${bike.id}`}
                    state={{ listTechnical }}
                  >
                    <GearIcon /> Ver datos técnicos
                  </NavLink>

                  <button
                    onClick={() => handleCreateTechnicalData(bike)}
                    className="Newcustombike create-technical-btn"
                  >
                    <PlusIcon /> Crear datos técnicos
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <SuspensionTypeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleSuspensionSelect}
        motoData={selectedMoto}
      />
    </>
  );
}

export default UleachBikeAdmin;
