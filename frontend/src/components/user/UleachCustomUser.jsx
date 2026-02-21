import ClienteDataDisplay from "./ClienteDataDisplay";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Phone, FileUser, MapPin, Bike,
  Crown, ChevronDown, ChevronUp,
  ClipboardCheck, HeartHandshake, History,
  MessageSquarePlus, Send,
} from "lucide-react";
import NotificationModal from "../common/NotificationModal";
import api from "../../../services/Api";

// Niveles simplificados (solo para el badge del header)
const NIVELES_EMRIDER = [
  { id: 1, nombre: "EmRider Baby",       facturacion: { min: 1 },    color: "rookie" },
  { id: 2, nombre: "EmRider Adolescent", facturacion: { min: 601 },  color: "pro"    },
  { id: 3, nombre: "EmRider Legend",     facturacion: { min: 1201 }, color: "legend" },
];

function SpringIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="4.5" />
      <polyline points="7,4.5 17,7 7,9.5 17,12 7,14.5 17,17" />
      <line x1="7" y1="17" x2="17" y2="17" />
      <line x1="12" y1="17" x2="12" y2="22" />
    </svg>
  );
}

function calcularNivel(facturacionAnual) {
  for (let i = NIVELES_EMRIDER.length - 1; i >= 0; i--) {
    if (facturacionAnual >= NIVELES_EMRIDER[i].facturacion.min) return NIVELES_EMRIDER[i];
  }
  return NIVELES_EMRIDER[0];
}

function UleachCustomUser({ Custom, onOpenQuestionnaire, questionnaireClienteFilled }) {
  const [showDetails, setShowDetails] = useState(false);
  const [facturacionAnual, setFacturacionAnual] = useState(0);
  const [loadingNivel, setLoadingNivel] = useState(true);
  const [showSugerencia, setShowSugerencia] = useState(false);
  const [mensajeSugerencia, setMensajeSugerencia] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [notif, setNotif] = useState({ open: false, type: "success", message: "" });
  const showNotif = (type, message) => setNotif({ open: true, type, message });

  useEffect(() => {
    const clientId = Custom?.gdtaller_id || Custom?.id;
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
  }, [Custom?.gdtaller_id, Custom?.id]);

  const nivelActual = useMemo(() => calcularNivel(facturacionAnual), [facturacionAnual]);
  const safeDisplay = (value) => value || "—";

  const nombreCompleto =
    Custom.nombre_completo ||
    `${Custom.nombre || ""} ${Custom.apellidos || ""}`.trim() ||
    "Cliente";
  const ubicacion = `${Custom.direccion || ""} ${Custom.poblacion || ""}`
    .replace(/\s+/g, " ")
    .trim();

  const NAV_ITEMS = [
    {
      to: "/cliente/garage",
      icon: <Bike />,
      label: "Mi Garage",
      sub: "Mis motocicletas",
      color: "blue",
    },
    {
      to: "/cliente/settings",
      icon: <SpringIcon />,
      label: "Suspensiones",
      sub: "Datos técnicos",
      color: "purple",
    },
    {
      to: "/cliente/historial",
      icon: <History />,
      label: "Historial",
      sub: "Órdenes de trabajo",
      color: "green",
    },
    {
      to: "/cliente/tribu",
      icon: <HeartHandshake />,
      label: "Mi Tribu",
      sub: !loadingNivel ? nivelActual.nombre : "Cargando...",
      color: "yellow",
    },
  ];

  return (
    <div className="uleach-customer-compact">

      {/* ── CABECERA ── */}
      <div className="client-summary">
        <div className="client-summary__center">
          <div className="client-summary__avatar">
            <img src="/images/Logomonoemrider.jpeg" alt="EmRider" className="client-summary__avatar-img" />
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
        <button className="client-summary__toggle" onClick={() => setShowDetails(!showDetails)}>
          <span>Mis datos</span>
          {showDetails ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {/* ── MIS DATOS (colapsable) ── */}
      {showDetails && (
        <div className="client-details">
          <div className="client-details__grid">
            <div className="client-details__item">
              <Phone className="client-details__icon" />
              <div>
                <span className="client-details__label">Teléfono</span>
                <span className="client-details__value">{safeDisplay(Custom.telefono)}</span>
              </div>
            </div>
            <div className="client-details__item">
              <FileUser className="client-details__icon" />
              <div>
                <span className="client-details__label">CIF / DNI</span>
                <span className="client-details__value">{safeDisplay(Custom.cif)}</span>
              </div>
            </div>
            {ubicacion && (
              <div className="client-details__item">
                <MapPin className="client-details__icon" />
                <div>
                  <span className="client-details__label">Ubicación</span>
                  <span className="client-details__value">{ubicacion}</span>
                </div>
              </div>
            )}
          </div>
          <ClienteDataDisplay cliente={Custom} />

          {onOpenQuestionnaire && (
            <div className="client-questionnaire-access">
              <div className="client-questionnaire-access__info">
                <ClipboardCheck size={16} className="client-questionnaire-access__icon" />
                <span className="client-questionnaire-access__label">Cuestionario de pilotaje</span>
                <span className={`client-questionnaire-access__badge ${questionnaireClienteFilled ? "done" : "pending"}`}>
                  {questionnaireClienteFilled ? "Realizado" : "Pendiente"}
                </span>
              </div>
              <button className="client-questionnaire-access__btn" onClick={() => onOpenQuestionnaire("cliente")}>
                {questionnaireClienteFilled ? "Actualizar datos" : "Completar ahora"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── NAVEGACIÓN EN CÍRCULOS ── */}
      <nav className="client-circle-nav">
        {NAV_ITEMS.map((item) => (
          <Link key={item.to} to={item.to} className={`circle-nav-item circle-nav-item--${item.color}`}>
            <div className="circle-nav-item__circle">
              {item.icon}
            </div>
            <span className="circle-nav-item__label">{item.label}</span>
            <span className="circle-nav-item__sub">{item.sub}</span>
          </Link>
        ))}
      </nav>

      {/* ── SUGERENCIAS E INCIDENCIAS ── */}
      <div className="sugerencia-card">
        <button
          className="sugerencia-card__header"
          onClick={() => setShowSugerencia(!showSugerencia)}
        >
          <div className="sugerencia-card__icon-wrap">
            <MessageSquarePlus />
          </div>
          <div className="sugerencia-card__text">
            <span className="sugerencia-card__title">Ayudanos a mejorar</span>
            <span className="sugerencia-card__sub">¿Tienes algo que decirnos? Escríbenos.</span>
          </div>
          <ChevronDown className={`client-section__chevron${showSugerencia ? " client-section__chevron--open" : ""}`} />
        </button>

        {showSugerencia && (
          <div className="sugerencia-card__body">
            <textarea
              className="sugerencia-card__textarea"
              rows={4}
              placeholder="Escribe tu sugerencia o incidencia aquí..."
              value={mensajeSugerencia}
              onChange={(e) => setMensajeSugerencia(e.target.value)}
              maxLength={1000}
            />
            <div className="sugerencia-card__footer">
              <span className="sugerencia-card__counter">
                {mensajeSugerencia.length}/1000
              </span>
              <button
                className="sugerencia-card__btn"
                disabled={!mensajeSugerencia.trim() || enviando}
                onClick={async () => {
                  setEnviando(true);
                  try {
                    await api.enviarSugerencia(
                      mensajeSugerencia,
                      Custom.cif,
                      nombreCompleto
                    );
                    setMensajeSugerencia("");
                    setShowSugerencia(false);
                    showNotif("success", "¡Mensaje enviado! Nos pondremos en contacto contigo.");
                  } catch {
                    showNotif("error", "Error al enviar. Inténtalo de nuevo.");
                  } finally {
                    setEnviando(false);
                  }
                }}
              >
                <Send size={15} />
                {enviando ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        )}
      </div>

      <NotificationModal
        isOpen={notif.open}
        type={notif.type}
        message={notif.message}
        onClose={() => setNotif((prev) => ({ ...prev, open: false }))}
      />

    </div>
  );
}

export default UleachCustomUser;
