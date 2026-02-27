import ClienteDataDisplay from "./ClienteDataDisplay";
import { useEffect, useState, useMemo } from "react";
import PushBanner from "./PushBanner";
import { Link } from "react-router";
import {
  Phone, FileUser, MapPin, Bike,
  Crown, ChevronDown, ChevronUp,
  ClipboardCheck, HeartHandshake, History,
  MessageSquarePlus, Send, AlertTriangle,
  Truck, X, CalendarDays, LocateFixed, ClipboardList,
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
  const [garageAlerta, setGarageAlerta] = useState(false);
  const [showSugerencia, setShowSugerencia] = useState(false);
  const [mensajeSugerencia, setMensajeSugerencia] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [showRecogida, setShowRecogida] = useState(false);
  const [recogidaFecha, setRecogidaFecha] = useState("");
  const [recogidaLugar, setRecogidaLugar] = useState("");
  const [enviandoRecogida, setEnviandoRecogida] = useState(false);
  const [showCita, setShowCita] = useState(false);
  const [citaFecha, setCitaFecha] = useState("");
  const [citaMotivo, setCitaMotivo] = useState("");
  const [enviandoCita, setEnviandoCita] = useState(false);
  const [notif, setNotif] = useState({ open: false, type: "success", message: "" });
  const showNotif = (type, message) => setNotif({ open: true, type, message });

  useEffect(() => {
    if (!Custom?.cif) return;
    (async () => {
      try {
        const clientId = Custom.gdtaller_id || Custom.id;
        const [motos, alertasRes] = await Promise.all([
          api.getMotosByCif(Custom.cif),
          clientId ? api.getMaintenanceAlerts(clientId).catch(() => ({ data: {} })) : Promise.resolve({ data: {} }),
        ]);

        // Comprobar alertas de motor y suspensiones (aceite, frenos, refrigerante, FF, RR)
        const alertasMotor = alertasRes?.data || {};
        const hayAlertaMotor = Object.values(alertasMotor).some(
          (mat) =>
            mat &&
            (mat.aceite?.alerta ||
              mat.frenos?.alerta ||
              mat.refrigerante?.alerta ||
              mat.ff?.alerta ||
              mat.rr?.alerta)
        );
        if (hayAlertaMotor) { setGarageAlerta(true); return; }

        if (!motos || motos.length === 0) return;
        for (const moto of motos) {
          const key = moto.matricula || moto.id;
          if (!key) continue;
          try {
            const res = await api.getServiciosByMoto(key);
            const servicios = res.data || [];
            if (servicios.length === 0) continue;
            const conFecha = servicios.filter((s) => s.fecha_proximo_mantenimiento);
            if (conFecha.length === 0) continue;
            const prox = conFecha.sort(
              (a, b) => new Date(b.fecha_servicio || 0) - new Date(a.fecha_servicio || 0)
            )[0].fecha_proximo_mantenimiento;
            const diffDias = Math.ceil((new Date(prox) - new Date()) / (1000 * 60 * 60 * 24));
            if (diffDias < 0) { setGarageAlerta(true); return; }
          } catch {}
        }
      } catch {}
    })();
  }, [Custom?.cif, Custom?.gdtaller_id, Custom?.id]);

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
    `${Custom.nombre || ""} ${Custom.apellidos || ""}`.trim() ||
    Custom.nombre_completo ||
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
      alerta: garageAlerta,
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
        {/* Botones de acción en esquinas superiores */}
        <button className="summary-corner-btn summary-corner-btn--left" onClick={() => setShowCita(true)}>
          <span className="summary-corner-btn__circle"><ClipboardList size={20} /></span>
          <span className="summary-corner-btn__label">Cita previa</span>
        </button>
        <button className="summary-corner-btn summary-corner-btn--right" onClick={() => setShowRecogida(true)}>
          <span className="summary-corner-btn__circle"><Truck size={20} /></span>
          <span className="summary-corner-btn__label">Recogida</span>
        </button>

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
              🍌 {loadingNivel ? "Cargando BananaPoints..." : `${Math.round(facturacionAnual).toLocaleString("es-ES")} BananaPoints`}
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
                <span className="client-questionnaire-access__label">Perfil de piloto</span>
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

      {/* ── NOTIFICACIONES PUSH (siempre montado para registrar CIF) ── */}
      <PushBanner />

      {/* ── NAVEGACIÓN EN CÍRCULOS ── */}
      <nav className="client-circle-nav">
        {NAV_ITEMS.map((item) => (
          <Link key={item.to} to={item.to} className={`circle-nav-item circle-nav-item--${item.color}${item.alerta ? " circle-nav-item--alerta" : ""}`}>
            <div className="circle-nav-item__circle">
              {item.icon}
              {item.alerta && (
                <span className="circle-nav-item__alert-badge">
                  <AlertTriangle />
                </span>
              )}
            </div>
            <span className="circle-nav-item__label">{item.label}</span>
            <span className="circle-nav-item__sub">
              {item.alerta ? "¡Revisión pendiente!" : item.sub}
            </span>
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


      {/* ── MODAL CITA PREVIA ── */}
      {showCita && (
        <div className="recogida-overlay" onClick={() => setShowCita(false)}>
          <div className="recogida-modal" onClick={(e) => e.stopPropagation()}>
            <div className="recogida-modal__header">
              <div className="recogida-modal__header-left">
                <ClipboardList className="recogida-modal__icon" />
                <div>
                  <h3 className="recogida-modal__title">Cita previa</h3>
                  <p className="recogida-modal__sub">Reserva tu visita al taller</p>
                </div>
              </div>
              <button className="recogida-modal__close" onClick={() => setShowCita(false)}>
                <X />
              </button>
            </div>
            <div className="recogida-modal__body">
              <label className="recogida-modal__label">
                <CalendarDays size={15} />
                Día de la cita
              </label>
              <input
                className="recogida-modal__input"
                type="date"
                value={citaFecha}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCitaFecha(e.target.value)}
              />
              <label className="recogida-modal__label">
                <ClipboardList size={15} />
                Motivo de la visita
              </label>
              <textarea
                className="recogida-modal__input"
                rows={3}
                placeholder="Describe el motivo de tu visita..."
                value={citaMotivo}
                onChange={(e) => setCitaMotivo(e.target.value)}
                maxLength={500}
                style={{ resize: "none" }}
              />
            </div>
            <div className="recogida-modal__footer">
              <button className="recogida-modal__btn-cancel" onClick={() => setShowCita(false)}>
                Cancelar
              </button>
              <button
                className="recogida-modal__btn-send"
                disabled={!citaFecha || !citaMotivo.trim() || enviandoCita}
                onClick={async () => {
                  setEnviandoCita(true);
                  try {
                    await api.solicitarCita(Custom.cif, nombreCompleto, citaFecha, citaMotivo);
                    setShowCita(false);
                    setCitaFecha("");
                    setCitaMotivo("");
                    showNotif("success", "¡Cita solicitada! Nos pondremos en contacto contigo.");
                  } catch {
                    showNotif("error", "Error al enviar. Inténtalo de nuevo.");
                  } finally {
                    setEnviandoCita(false);
                  }
                }}
              >
                <Send size={14} />
                {enviandoCita ? "Enviando..." : "Solicitar cita"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── MODAL RECOGIDA ── */}
      {showRecogida && (
        <div className="recogida-overlay" onClick={() => setShowRecogida(false)}>
          <div className="recogida-modal" onClick={(e) => e.stopPropagation()}>
            <div className="recogida-modal__header">
              <div className="recogida-modal__header-left">
                <Truck className="recogida-modal__icon" />
                <div>
                  <h3 className="recogida-modal__title">¿Recogemos tu moto?</h3>
                  <p className="recogida-modal__sub">Dinos cuándo y dónde</p>
                </div>
              </div>
              <button className="recogida-modal__close" onClick={() => setShowRecogida(false)}>
                <X />
              </button>
            </div>
            <div className="recogida-modal__body">
              <label className="recogida-modal__label">
                <CalendarDays size={15} />
                Día de recogida
              </label>
              <input
                className="recogida-modal__input"
                type="date"
                value={recogidaFecha}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setRecogidaFecha(e.target.value)}
              />
              <label className="recogida-modal__label">
                <LocateFixed size={15} />
                Lugar de recogida
              </label>
              <input
                className="recogida-modal__input"
                type="text"
                placeholder="Dirección completa..."
                value={recogidaLugar}
                onChange={(e) => setRecogidaLugar(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="recogida-modal__footer">
              <button
                className="recogida-modal__btn-cancel"
                onClick={() => setShowRecogida(false)}
              >
                Cancelar
              </button>
              <button
                className="recogida-modal__btn-send"
                disabled={!recogidaFecha || !recogidaLugar.trim() || enviandoRecogida}
                onClick={async () => {
                  setEnviandoRecogida(true);
                  try {
                    await api.solicitarRecogida(
                      Custom.cif,
                      nombreCompleto,
                      recogidaFecha,
                      recogidaLugar
                    );
                    setShowRecogida(false);
                    setRecogidaFecha("");
                    setRecogidaLugar("");
                    showNotif("success", "¡Solicitud enviada! Nos pondremos en contacto contigo.");
                  } catch {
                    showNotif("error", "Error al enviar. Inténtalo de nuevo.");
                  } finally {
                    setEnviandoRecogida(false);
                  }
                }}
              >
                <Send size={14} />
                {enviandoRecogida ? "Enviando..." : "Solicitar recogida"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default UleachCustomUser;
