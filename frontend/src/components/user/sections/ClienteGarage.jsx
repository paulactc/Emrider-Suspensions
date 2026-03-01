import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  MotorcycleIcon, CaretLeftIcon, CaretDownIcon, CaretUpIcon,
  WrenchIcon, CalendarIcon, HashIcon, IdentificationCardIcon, GaugeIcon, WarningIcon,
  DropIcon, FlameIcon, WindIcon, GearIcon, PencilIcon, TrashIcon,
} from "@phosphor-icons/react";
import { useClienteData } from "../../../hooks/useClienteData";
import api from "../../../../services/Api";
import ClienteQuestionario from "../ClienteQuestionario";
import NotificationModal from "../../common/NotificationModal";

const normMat = (m) => (m || "").replace(/\s+/g, "").toUpperCase();

function ClienteGarage() {
  const { cliente, loading, error } = useClienteData();
  const [motos, setMotos] = useState([]);
  const [serviciosPorMoto, setServiciosPorMoto] = useState({});
  const [alertasMotor, setAlertasMotor] = useState({});
  const [motoExpandida, setMotoExpandida] = useState(null);
  const [loadingMotos, setLoadingMotos] = useState(false);
  const [motoEditando, setMotoEditando] = useState(null);
  const [motoABorrar, setMotoABorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);
  const [notif, setNotif] = useState({ open: false, type: "success", message: "" });

  useEffect(() => {
    if (!cliente?.cif) return;
    setLoadingMotos(true);

    const clienteId = cliente.gdtaller_id || cliente.id;

    api
      .getMotosByCif(cliente.cif)
      .then((motosData) => {
        const lista = motosData || [];
        setMotos(lista);
        lista.forEach((moto) => {
          const key = moto.matricula || moto.id;
          if (key) {
            api
              .getServiciosByMoto(key)
              .then((res) =>
                setServiciosPorMoto((prev) => ({ ...prev, [key]: res.data || [] }))
              )
              .catch(() => {});
          }
        });
      })
      .catch(() => setMotos([]))
      .finally(() => setLoadingMotos(false));

    // Cargar alertas de mantenimiento de motor (aceite, frenos, refrigerante)
    if (clienteId) {
      api.getMaintenanceAlerts(clienteId)
        .then((res) => setAlertasMotor(res.data || {}))
        .catch(() => {});
    }
  }, [cliente?.cif, cliente?.gdtaller_id, cliente?.id]);

  const handleConfirmarBorrar = async () => {
    if (!motoABorrar || !cliente?.cif) return;
    setBorrando(true);
    try {
      await api.ocultarMoto(motoABorrar.id || motoABorrar.matricula, cliente.cif);
      setMotos((prev) => prev.filter((m) => m.id !== motoABorrar.id));
      setMotoABorrar(null);
      setMotoExpandida(null);
      setNotif({ open: true, type: "success", message: "Moto eliminada de tu garage" });
    } catch (err) {
      setNotif({ open: true, type: "error", message: "Error al eliminar: " + err.message });
    } finally {
      setBorrando(false);
    }
  };

  const handleQuestionnaireComplete = async (formData) => {
    try {
      const result = await api.saveQuestionnaire(formData);
      if (!result?.success) throw new Error(result?.message || "Error al guardar");
      // Actualizar datos locales de la moto sin recargar
      setMotos((prev) =>
        prev.map((m) => {
          const updated = formData.motocicletas?.find((md) => String(md.id) === String(m.id));
          return updated ? { ...m, ...updated } : m;
        })
      );
      setMotoEditando(null);
      setNotif({ open: true, type: "success", message: "Configuración de suspensión guardada" });
    } catch (err) {
      setNotif({ open: true, type: "error", message: "Error al guardar: " + err.message });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const getMantenimientoStatus = (moto) => {
    const key = moto.matricula || moto.id;
    const servicios = serviciosPorMoto[key] || [];
    if (servicios.length === 0)
      return { status: "sin-datos", texto: "Sin servicio de suspensiones registrado" };

    const reciente = [...servicios].sort(
      (a, b) => new Date(b.fecha_servicio || 0) - new Date(a.fecha_servicio || 0)
    )[0];

    // Usar fecha_proximo_mantenimiento explícita si existe, o calcular 1 año desde el servicio
    const conFecha = servicios.filter((s) => s.fecha_proximo_mantenimiento);
    let prox;
    if (conFecha.length > 0) {
      prox = conFecha.sort(
        (a, b) => new Date(b.fecha_servicio || 0) - new Date(a.fecha_servicio || 0)
      )[0].fecha_proximo_mantenimiento;
    } else if (reciente?.fecha_servicio) {
      const d = new Date(reciente.fecha_servicio);
      d.setFullYear(d.getFullYear() + 1);
      prox = d.toISOString().split("T")[0];
    } else {
      return { status: "sin-datos", texto: "Sin servicio de suspensiones registrado" };
    }

    const diffDias = Math.ceil((new Date(prox) - new Date()) / (1000 * 60 * 60 * 24));
    if (diffDias < 0)
      return { status: "caducado", texto: `Mantenimiento de suspensiones caducado (${formatDate(prox)})` };
    if (diffDias <= 30)
      return { status: "proximo", texto: `Mantenimiento próximo (${formatDate(prox)})` };
    return { status: "ok", texto: `Próximo mantenimiento: ${formatDate(prox)}` };
  };

  // True si CUALQUIER aviso de mantenimiento está caducado
  const tieneCualquierAlerta = (moto) => {
    const mant = getMantenimientoStatus(moto);
    if (mant.status === "caducado") return true;
    const alertas = alertasMotor[normMat(moto.matricula)];
    if (!alertas) return false;
    return !!(
      alertas.aceite?.alerta ||
      alertas.frenos?.alerta ||
      alertas.refrigerante?.alerta ||
      alertas.ff?.alerta ||
      alertas.rr?.alerta
    );
  };

  // ── Diálogo confirmación borrar ──
  if (motoABorrar) {
    return (
      <div className="cliente-section-page">
        <div className="moto-delete-confirm">
          <div className="moto-delete-confirm__box">
            <div className="moto-delete-confirm__icon">🗑️</div>
            <h3 className="moto-delete-confirm__title">¿Eliminar del garage?</h3>
            <p className="moto-delete-confirm__desc">
              Vas a eliminar <strong>{(motoABorrar.marca || "").toUpperCase()} {(motoABorrar.modelo || "").toUpperCase()}</strong>
              {motoABorrar.matricula ? ` (${motoABorrar.matricula})` : ""} de tu garage.
              <br />Esta acción es permanente. Si la moto vuelve a estar activa en el taller, reaparecerá.
            </p>
            <div className="moto-delete-confirm__actions">
              <button
                className="moto-delete-confirm__cancel"
                onClick={() => setMotoABorrar(null)}
                disabled={borrando}
              >
                Cancelar
              </button>
              <button
                className="moto-delete-confirm__ok"
                onClick={handleConfirmarBorrar}
                disabled={borrando}
              >
                {borrando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista cuestionario para una moto concreta ──
  if (motoEditando) {
    return (
      <div className="cliente-section-page">
        <NotificationModal
          isOpen={notif.open}
          type={notif.type}
          message={notif.message}
          onClose={() => setNotif((p) => ({ ...p, open: false }))}
        />
        <div className="cliente-section-page__topbar">
          <button className="cliente-section-page__back" onClick={() => setMotoEditando(null)}>
            <CaretLeftIcon weight="fill" /> Volver al garage
          </button>
          <div className="cliente-section-page__title-wrap">
            <div className="cliente-section-page__title-icon"><GearIcon weight="fill" /></div>
            <h2 className="cliente-section-page__title">
              {(motoEditando.marca || "").toUpperCase()} {(motoEditando.modelo || "").toUpperCase()}
            </h2>
          </div>
        </div>
        <div className="questionnaire-wrapper">
          <ClienteQuestionario
            cliente={cliente}
            motos={[motoEditando]}
            onComplete={handleQuestionnaireComplete}
            onSkip={() => setMotoEditando(null)}
            mode="moto-only"
          />
        </div>
      </div>
    );
  }

  if (loading || loadingMotos) {
    return (
      <div className="cliente-section-page">
        <Link to="/cliente" className="cliente-section-page__back">
          <CaretLeftIcon weight="fill" /> Volver
        </Link>
        <div className="cliente-section-page__loading">Cargando garage...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cliente-section-page">
        <Link to="/cliente" className="cliente-section-page__back">
          <CaretLeftIcon weight="fill" /> Volver
        </Link>
        <p className="cliente-section-page__error">{error}</p>
      </div>
    );
  }

  return (
    <div className="cliente-section-page cliente-section-page--garage">
      <NotificationModal
        isOpen={notif.open}
        type={notif.type}
        message={notif.message}
        onClose={() => setNotif((p) => ({ ...p, open: false }))}
      />
      <div className="cliente-section-page__topbar">
        <Link to="/cliente" className="cliente-section-page__back">
          <CaretLeftIcon weight="fill" /> Volver
        </Link>
        <div className="cliente-section-page__title-wrap">
          <div className="cliente-section-page__title-icon"><MotorcycleIcon weight="fill" /></div>
          <h2 className="cliente-section-page__title">Mi Garage</h2>
        </div>
      </div>

      {motos.length === 0 ? (
        <div className="moto-card moto-card--empty">
          <MotorcycleIcon weight="fill" />
          <p>No se encontraron motocicletas registradas.</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
            Contacta con nosotros para asociar tus motos a tu cuenta.
          </p>
        </div>
      ) : (
        <div className="client-motos-list">
          {motos.map((moto) => {
            const motoKey = moto.matricula || moto.id;
            const hayAlerta = tieneCualquierAlerta(moto);
            const isOpen = motoExpandida === motoKey;
            return (
              <div
                key={moto.id || moto.matricula}
                className={`moto-card${isOpen ? " moto-card--open" : ""}${hayAlerta ? " moto-card--alert" : ""}`}
              >
                <div className="moto-card__header">
                  <div
                    className="moto-card__toggle"
                    role="button"
                    tabIndex={0}
                    onClick={() => setMotoExpandida(isOpen ? null : motoKey)}
                    onKeyDown={(e) => e.key === "Enter" && setMotoExpandida(isOpen ? null : motoKey)}
                  >
                    <div className="moto-card__toggle-left">
                      <div className="moto-card__icon"><MotorcycleIcon weight="fill" /></div>
                      <div className="moto-card__info">
                        <span className="moto-card__nombre">{moto.marca} {moto.modelo}</span>
                        <span className="moto-card__matricula">{moto.matricula || "Sin matrícula"}</span>
                      </div>
                    </div>
                    <div className="moto-card__toggle-right">
                      {hayAlerta && (
                        <span className="moto-card__alert-wrap">
                          <WarningIcon weight="fill" className="moto-card__alert-icon" />
                        </span>
                      )}
                      {isOpen ? <CaretUpIcon weight="fill" /> : <CaretDownIcon weight="fill" />}
                    </div>
                  </div>
                  <button
                    className="moto-card__delete-btn"
                    title="Eliminar moto del garage"
                    onClick={() => setMotoABorrar(moto)}
                  >
                    <TrashIcon weight="fill" size={15} />
                  </button>
                </div>

                {isOpen && (
                  <div className="moto-card__detail">
                    <div className="moto-card__ficha">
                      <h4 className="moto-card__section-title">Ficha del vehículo</h4>
                      <div className="moto-card__ficha-grid">
                        <div className="moto-card__ficha-item">
                          <MotorcycleIcon weight="fill" className="moto-card__ficha-icon" />
                          <div>
                            <span className="moto-card__ficha-label">Marca / Modelo</span>
                            <span className="moto-card__ficha-value">{(moto.marca || "—").toUpperCase()} {(moto.modelo || "—").toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="moto-card__ficha-item">
                          <HashIcon weight="fill" className="moto-card__ficha-icon" />
                          <div>
                            <span className="moto-card__ficha-label">Matrícula</span>
                            <span className="moto-card__ficha-value">{moto.matricula || "—"}</span>
                          </div>
                        </div>
                        <div className="moto-card__ficha-item">
                          <CalendarIcon weight="fill" className="moto-card__ficha-icon" />
                          <div>
                            <span className="moto-card__ficha-label">Año</span>
                            <span className="moto-card__ficha-value">{moto.anio || "—"}</span>
                          </div>
                        </div>
                        {moto.bastidor && (
                          <div className="moto-card__ficha-item">
                            <IdentificationCardIcon weight="fill" className="moto-card__ficha-icon" />
                            <div>
                              <span className="moto-card__ficha-label">Bastidor</span>
                              <span className="moto-card__ficha-value">{moto.bastidor}</span>
                            </div>
                          </div>
                        )}
                        {moto.km && (
                          <div className="moto-card__ficha-item">
                            <GaugeIcon weight="fill" className="moto-card__ficha-icon" />
                            <div>
                              <span className="moto-card__ficha-label">Kilómetros</span>
                              <span className="moto-card__ficha-value">
                                {Number(moto.km).toLocaleString("es-ES")} km
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── AVISOS ── */}
                    {(() => {
                      const alertasMat = alertasMotor[normMat(moto.matricula)] || {};
                      const a = alertasMat.aceite;
                      const af = alertasMat.frenos;
                      const ar = alertasMat.refrigerante;

                      const ffData = alertasMat.ff;
                      const rrData = alertasMat.rr;

                      const stFF = !ffData
                        ? { status: "sin-datos", texto: "Sin servicio de horquilla delantera en historial de OR" }
                        : ffData.alerta
                        ? { status: "caducado", texto: `Mantenimiento caducado · último servicio hace ${ffData.mesesDesde} meses (${formatDate(ffData.ultimaFecha)})` }
                        : { status: "ok", texto: `Último servicio: ${formatDate(ffData.ultimaFecha)} · hace ${ffData.mesesDesde} meses` };

                      const stRR = !rrData
                        ? { status: "sin-datos", texto: "Sin servicio de amortiguador trasero en historial de OR" }
                        : rrData.alerta
                        ? { status: "caducado", texto: `Mantenimiento caducado · último servicio hace ${rrData.mesesDesde} meses (${formatDate(rrData.ultimaFecha)})` }
                        : { status: "ok", texto: `Último servicio: ${formatDate(rrData.ultimaFecha)} · hace ${rrData.mesesDesde} meses` };

                      const stAceite = !a
                        ? { status: "sin-datos", texto: "Sin registro de cambio de aceite" }
                        : a.alerta
                        ? { status: "caducado", texto: `Sustitución recomendada · último cambio hace ${a.mesesDesde} meses (${formatDate(a.ultimaFecha)})` }
                        : { status: "ok", texto: `Último cambio: ${formatDate(a.ultimaFecha)} · hace ${a.mesesDesde} meses` };
                      const stFreno = !af
                        ? { status: "sin-datos", texto: "Sin registro de cambio de líquido de frenos" }
                        : af.alerta
                        ? { status: "caducado", texto: `Sustitución recomendada · hace ${af.mesesDesde} meses (${formatDate(af.ultimaFecha)})` }
                        : { status: "ok", texto: `Último cambio: ${formatDate(af.ultimaFecha)} · hace ${af.mesesDesde} meses` };
                      const stRefri = !ar
                        ? { status: "sin-datos", texto: "Sin registro de cambio de refrigerante" }
                        : ar.alerta
                        ? { status: "caducado", texto: `Sustitución recomendada · hace ${ar.mesesDesde} meses (${formatDate(ar.ultimaFecha)})` }
                        : { status: "ok", texto: `Último cambio: ${formatDate(ar.ultimaFecha)} · hace ${ar.mesesDesde} meses` };

                      const hayAviso =
                        stFF.status === "caducado" ||
                        stRR.status === "caducado" ||
                        stAceite.status === "caducado" ||
                        stFreno.status === "caducado" ||
                        stRefri.status === "caducado";

                      return (
                        <div className="moto-avisos">
                          <div className="moto-avisos__header">
                            <h4 className="moto-avisos__title">Avisos</h4>
                            {hayAviso && (
                              <span className="moto-avisos__badge">
                                <WarningIcon weight="fill" size={13} /> Revisión pendiente
                              </span>
                            )}
                          </div>

                          {/* Horquilla Delantera (FF) */}
                          <div className="moto-avisos__item">
                            <span className="moto-avisos__item-label"><WrenchIcon weight="fill" size={13} /> Horquilla delantera (FF)</span>
                            <div className={`moto-card__mantenimiento moto-card__mantenimiento--${stFF.status}`}>
                              <WrenchIcon weight="fill" className="moto-card__mantenimiento-icon" />
                              <span>{stFF.texto}</span>
                            </div>
                          </div>

                          {/* Amortiguador Trasero (RR) */}
                          <div className="moto-avisos__item">
                            <span className="moto-avisos__item-label"><WrenchIcon weight="fill" size={13} /> Amortiguador trasero (RR)</span>
                            <div className={`moto-card__mantenimiento moto-card__mantenimiento--${stRR.status}`}>
                              <WrenchIcon weight="fill" className="moto-card__mantenimiento-icon" />
                              <span>{stRR.texto}</span>
                            </div>
                          </div>

                          {/* Aceite de motor */}
                          <div className="moto-avisos__item">
                            <span className="moto-avisos__item-label"><DropIcon weight="fill" size={13} /> Aceite de motor</span>
                            <div className={`moto-card__mantenimiento moto-card__mantenimiento--${stAceite.status}`}>
                              <DropIcon weight="fill" className="moto-card__mantenimiento-icon" />
                              <span>{stAceite.texto}</span>
                            </div>
                          </div>

                          {/* Líquido de frenos */}
                          <div className="moto-avisos__item">
                            <span className="moto-avisos__item-label"><WindIcon weight="fill" size={13} /> Líquido de frenos</span>
<div className={`moto-card__mantenimiento moto-card__mantenimiento--${stFreno.status}`}>
                              <WindIcon weight="fill" className="moto-card__mantenimiento-icon" />
                              <span>{stFreno.texto}</span>
                            </div>
                          </div>

                          {/* Refrigerante */}
                          <div className="moto-avisos__item">
                            <span className="moto-avisos__item-label"><FlameIcon weight="fill" size={13} /> Refrigerante</span>
                            <div className={`moto-card__mantenimiento moto-card__mantenimiento--${stRefri.status}`}>
                              <FlameIcon weight="fill" className="moto-card__mantenimiento-icon" />
                              <span>{stRefri.texto}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="moto-card__section">
                      <h4 className="moto-card__section-title">Preferencias de suspensión</h4>
                      {moto.especialidad ? (
                        <div className="moto-card__questionnaire-row">
                          <div className="moto-card__questionnaire-left">
                            <span className="moto-card__questionnaire-badge done">Configurado</span>
                            <span className="moto-card__questionnaire-status">
                              {moto.especialidad} · {moto.tipoConduccion} · {moto.preferenciaRigidez}
                            </span>
                          </div>
                          <button
                            className="moto-config-btn moto-config-btn--edit"
                            onClick={() => setMotoEditando(moto)}
                          >
                            <PencilIcon weight="fill" size={14} /> Editar
                          </button>
                        </div>
                      ) : (
                        <div className="moto-card__questionnaire-row">
                          <div className="moto-card__questionnaire-left">
                            <span className="moto-card__questionnaire-badge pending">Pendiente</span>
                            <span className="moto-card__questionnaire-status">
                              Sin configurar — añade tus preferencias de suspensión
                            </span>
                          </div>
                          <button
                            className="moto-config-btn moto-config-btn--setup"
                            onClick={() => setMotoEditando(moto)}
                          >
                            <GearIcon weight="fill" size={14} /> Configurar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ClienteGarage;
