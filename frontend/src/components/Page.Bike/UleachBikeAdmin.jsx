import { NavLink } from "react-router";
import { useState } from "react";
import {
  Tag,
  Bike,
  Calendar,
  Hash,
  Settings,
  AlertTriangle,
  BookAlert,
  Plus,
  Wrench,
  X,
} from "lucide-react";

// Modal para seleccionar tipo de suspensión
const SuspensionTypeModal = ({ isOpen, onClose, onSelect, motoData }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Crear Datos Técnicos</h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p>Selecciona el tipo de suspensión para configurar:</p>
          <p className="moto-info">
            <strong>
              {motoData?.marca} {motoData?.modelo}
            </strong>
            {motoData?.matricula && ` - ${motoData.matricula}`}
          </p>

          {/* 🔍 DEBUG INFO */}
          <div
            style={{
              background: "#f0f0f0",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            <strong>🔍 DEBUG:</strong>
            <br />
            ID de moto: {motoData?.id || "undefined"}
            <br />
            Tipo de ID: {typeof motoData?.id}
            <br />
            Moto completa: {JSON.stringify(motoData, null, 2)}
          </div>

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
    console.log("🚀 PASO 1 - Crear datos técnicos para moto:", moto);
    console.log("🔍 ID de la moto:", moto?.id);
    console.log("🔍 Tipo de ID:", typeof moto?.id);
    console.log("🔍 Moto completa:", JSON.stringify(moto, null, 2));

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

    // Usar navigate o window.location según tu preferencia
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

        {/* 🔍 DEBUG: Mostrar datos de las motos */}
        <div
          style={{
            background: "#e8f5e8",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          <strong>🔍 DEBUG - Lista de motos:</strong>
          <br />
          {clientBikes.map((bike, index) => (
            <div key={index}>
              Moto {index + 1}: ID={bike.id}, Marca={bike.marca}, Modelo=
              {bike.modelo}
            </div>
          ))}
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
                    <span className="listMotocicle__spec-item-label">
                      Marca:
                    </span>
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

                <div className="admin-actions">
                  <NavLink
                    className="Newcustombike"
                    to={`/admin/datos-tecnicos-admin/${bike.id}`}
                    state={{ listTechnical }}
                  >
                    <Settings /> Ver datos técnicos
                  </NavLink>

                  <button
                    onClick={() => handleCreateTechnicalData(bike)}
                    className="Newcustombike create-technical-btn"
                  >
                    <Plus /> Crear datos técnicos
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

      {/* Estilos para el modal */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          margin: 0;
          color: #111827;
          font-size: 1.5rem;
        }

        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .modal-close:hover {
          background: #f3f4f6;
        }

        .modal-body p {
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .moto-info {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          color: #374151 !important;
        }

        .suspension-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .suspension-option {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .suspension-option:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .suspension-option--ff:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .suspension-option--rr:hover {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .option-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .option-details h4 {
          margin: 0 0 0.5rem 0;
          color: #111827;
          font-size: 1rem;
        }

        .option-details p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        @media (max-width: 640px) {
          .suspension-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export default UleachBikeAdmin;
