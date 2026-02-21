import React, { useEffect, useState, useMemo } from "react";
import { Wrench, ChevronDown, ChevronUp, Loader, Bike, Calendar } from "lucide-react";
import api from "../../../services/Api";

const LABELS_FF = {
  oilType: "Tipo de aceite",
  oilLevel: "Nivel de aceite (mm)",
  oilCapacity: "Capacidad aceite (ml)",
  hComp: "H.Comp",
  springRate: "Spring rate",
  compressionDamping: "Compresion",
  reboundDamping: "Rebote",
  preload: "Precarga (mm)",
  sag: "SAG (mm)",
  gas: "Gas (bar)",
  gasFF: "Gas FF (bar)",
  forkLength: "Longitud horquilla (mm)",
  strokeLength: "Recorrido (mm)",
  springLength: "Longitud muelle (mm)",
  compressionAdjuster: "Ajustador compresion",
  reboundAdjuster: "Ajustador rebote",
};

const LABELS_MUELLE_PRINCIPAL = {
  springRate: "H.comp (N/mm)",
  diametroInterior: "Diametro interior (mm)",
  diametroExterior: "Diametro exterior (mm)",
  diametroSpiras: "Diametro spiras (mm)",
  largo: "Largo (mm)",
  numEspiras: "Num. espiras",
  topeFisico: "Tope fisico (mm)",
};

const LABELS_MUELLE_COMPRESION = {
  springRate: "H.comp (N/mm)",
  diametroInterior: "Diametro interior (mm)",
  diametroExterior: "Diametro exterior (mm)",
  largo: "Largo (mm)",
  numEspiras: "Num. espiras",
  topeFisico: "Tope fisico (mm)",
};

const LABELS_RR = {
  mainRate: "Main rate (N/mm)",
  springRef: "Ref. muelle",
  length: "Longitud muelle (mm)",
  numeroSpiras: "Num. espiras",
  outerDiameter: "Diametro exterior (mm)",
  innerDiameter: "Diametro interior (mm)",
  spire: "Espira (mm)",
  rebSpring: "Reb. spring",
  totalLength: "Longitud total (mm)",
  stroke: "Recorrido (mm)",
  shaft: "Eje (mm)",
  piston: "Piston (mm)",
  internalSpacer: "Separador interno (mm)",
  height: "Altura (mm)",
  strokeToBumpRubber: "Stroke to bump rubber (mm)",
  rod: "Varilla (mm)",
  reboundSpring: "Muelle rebote",
  springUpperDiameter: "Diametro superior muelle (mm)",
  springLowerDiameter: "Diametro inferior muelle (mm)",
  headRodEnd: "Head rod end",
  upperMount: "Anclaje superior",
  lowerMount: "Anclaje inferior",
  oil: "Aceite",
  gas: "Gas (bar)",
  compressionOriginal: "Compresion original",
  compressionModification: "Compresion modificacion",
};

function formatValue(val) {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "object" && !Array.isArray(val)) {
    const inVal = val.in !== undefined && val.in !== "" ? val.in : null;
    const outVal = val.out !== undefined && val.out !== "" ? val.out : null;
    if (inVal === null && outVal === null) return null;
    if (inVal === outVal) return `${inVal}`;
    const parts = [];
    if (inVal !== null) parts.push(`In: ${inVal}`);
    if (outVal !== null) parts.push(`Out: ${outVal}`);
    return parts.join(" / ");
  }
  if (Array.isArray(val)) {
    const filtered = val.filter((v) => v !== "" && v !== null && v !== undefined);
    if (filtered.length === 0) return null;
    return filtered.join(", ");
  }
  return String(val);
}

function TechRow({ label, value }) {
  const formatted = formatValue(value);
  if (!formatted) return null;
  return (
    <div className="datos-tecnicos__row">
      <span className="datos-tecnicos__label">{label}</span>
      <span className="datos-tecnicos__value">{formatted}</span>
    </div>
  );
}

function ShimStack({ label, original, modificado }) {
  const origFiltered = (original || []).filter((v) => v !== "" && v !== null && v !== undefined);
  const modFiltered = (modificado || []).filter((v) => v !== "" && v !== null && v !== undefined);
  if (origFiltered.length === 0 && modFiltered.length === 0) return null;
  return (
    <div className="datos-tecnicos__shim-stack">
      <span className="datos-tecnicos__shim-title">{label}</span>
      {origFiltered.length > 0 && (
        <div className="datos-tecnicos__shim-row">
          <span className="datos-tecnicos__shim-label">Original:</span>
          <span className="datos-tecnicos__shim-values">{origFiltered.join(" · ")}</span>
        </div>
      )}
      {modFiltered.length > 0 && (
        <div className="datos-tecnicos__shim-row">
          <span className="datos-tecnicos__shim-label">Modificado:</span>
          <span className="datos-tecnicos__shim-values">{modFiltered.join(" · ")}</span>
        </div>
      )}
    </div>
  );
}

function DatosTecnicosFF({ datos }) {
  const pm = datos.pistonMain || {};
  const pc = datos.pistonCompresion || {};
  const mp = datos.muellePrincipal || {};
  const mc = datos.muelleCompresion || {};
  const hasMainFields = Object.entries(LABELS_FF).some(([k]) => formatValue(datos[k]));
  const hasMuellePrincipal = Object.entries(LABELS_MUELLE_PRINCIPAL).some(([k]) => formatValue(mp[k]));
  const hasMuelleCompresion = Object.entries(LABELS_MUELLE_COMPRESION).some(([k]) => formatValue(mc[k]));
  const hasPistonMain = pm.diametroPiston || pm.diametroEje ||
    (pm.compresionOriginalDerecho || []).some(Boolean) ||
    (pm.reboteOriginalDerecho || []).some(Boolean) ||
    (pm.checkvalveOriginalDerecho || []).some(Boolean);
  const hasPistonCompresion = pc.diametroPiston || pc.diametroEje ||
    (pc.compresionOriginalDerecho || []).some(Boolean) ||
    (pc.checkvalveOriginalDerecho || []).some(Boolean);

  return (
    <div className="datos-tecnicos__content">
      {hasMainFields && (
        <div className="datos-tecnicos__group">
          <h5 className="datos-tecnicos__group-title">Ajustes de horquilla</h5>
          {Object.entries(LABELS_FF).map(([key, label]) => (
            <TechRow key={key} label={label} value={datos[key]} />
          ))}
        </div>
      )}

      {hasMuellePrincipal && (
        <div className="datos-tecnicos__group">
          <h5 className="datos-tecnicos__group-title">Muelle principal</h5>
          {Object.entries(LABELS_MUELLE_PRINCIPAL).map(([key, label]) => (
            <TechRow key={key} label={label} value={mp[key]} />
          ))}
        </div>
      )}

      {hasMuelleCompresion && (
        <div className="datos-tecnicos__group">
          <h5 className="datos-tecnicos__group-title">Muelle compresion</h5>
          {Object.entries(LABELS_MUELLE_COMPRESION).map(([key, label]) => (
            <TechRow key={key} label={label} value={mc[key]} />
          ))}
        </div>
      )}

      {hasPistonMain && (
        <div className="datos-tecnicos__group">
          <h5 className="datos-tecnicos__group-title">SPEC FF - Piston Main</h5>
          <TechRow label="Diametro piston (mm)" value={pm.diametroPiston} />
          <TechRow label="Diametro eje (mm)" value={pm.diametroEje} />
          <ShimStack label="Compresion" original={pm.compresionOriginalDerecho} modificado={pm.compresionModificadoDerecho} />
          <ShimStack label="Compresion (izq)" original={pm.compresionOriginalIzquierdo} modificado={pm.compresionModificadoIzquierdo} />
          <ShimStack label="Checkvalve" original={pm.checkvalveOriginalDerecho} modificado={pm.checkvalveModificadoDerecho} />
          <ShimStack label="Checkvalve (izq)" original={pm.checkvalveOriginalIzquierdo} modificado={pm.checkvalveModificadoIzquierdo} />
          <ShimStack label="Rebote" original={pm.reboteOriginalDerecho} modificado={pm.reboteModificadoDerecho} />
          <ShimStack label="Rebote (izq)" original={pm.reboteOriginalIzquierdo} modificado={pm.reboteModificadoIzquierdo} />
        </div>
      )}

      {hasPistonCompresion && (
        <div className="datos-tecnicos__group">
          <h5 className="datos-tecnicos__group-title">SPEC FF - Piston Compresion</h5>
          <TechRow label="Diametro piston (mm)" value={pc.diametroPiston} />
          <TechRow label="Diametro eje (mm)" value={pc.diametroEje} />
          <ShimStack label="Compresion" original={pc.compresionOriginalDerecho} modificado={pc.compresionModificadoDerecho} />
          <ShimStack label="Compresion (izq)" original={pc.compresionOriginalIzquierdo} modificado={pc.compresionModificadoIzquierdo} />
          <ShimStack label="Checkvalve" original={pc.checkvalveOriginalDerecho} modificado={pc.checkvalveModificadoDerecho} />
          <ShimStack label="Checkvalve (izq)" original={pc.checkvalveOriginalIzquierdo} modificado={pc.checkvalveModificadoIzquierdo} />
        </div>
      )}
    </div>
  );
}

function DatosTecnicosRR({ datos }) {
  const hasFields = Object.entries(LABELS_RR).some(([k]) => formatValue(datos[k]));
  const rebOrigFiltered = (datos.reboundOriginal || []).filter(Boolean);
  const rebModFiltered = (datos.reboundModification || []).filter(Boolean);
  const compOrigFiltered = (datos.originalCompressionAdjuster || []).filter(Boolean);
  const compModFiltered = (datos.modifiedCompressionAdjuster || []).filter(Boolean);

  return (
    <div className="datos-tecnicos__content">
      {hasFields && (
        <div className="datos-tecnicos__group">
          <h5 className="datos-tecnicos__group-title">Datos amortiguador</h5>
          {Object.entries(LABELS_RR).map(([key, label]) => (
            <TechRow key={key} label={label} value={datos[key]} />
          ))}
        </div>
      )}
      {(rebOrigFiltered.length > 0 || rebModFiltered.length > 0) && (
        <div className="datos-tecnicos__group">
          <h5 className="datos-tecnicos__group-title">SPEC RR - Rebote</h5>
          <ShimStack label="Rebote" original={datos.reboundOriginal} modificado={datos.reboundModification} />
        </div>
      )}
      {(compOrigFiltered.length > 0 || compModFiltered.length > 0) && (
        <div className="datos-tecnicos__group">
          <h5 className="datos-tecnicos__group-title">SPEC RR - Compresion</h5>
          <ShimStack label="Ajustador compresion" original={datos.originalCompressionAdjuster} modificado={datos.modifiedCompressionAdjuster} />
        </div>
      )}
    </div>
  );
}

function DatosTecnicosServicio({ cif, servicios: serviciosProp, groupByMoto = false }) {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedMoto, setExpandedMoto] = useState(null);

  useEffect(() => {
    // Si nos pasan los servicios directamente, usarlos sin fetch
    if (serviciosProp !== undefined) {
      setServicios(
        (serviciosProp || []).filter((s) => s.datos_tecnicos_json)
      );
      setLoading(false);
      return;
    }
    if (!cif) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getServiciosByCif(cif)
      .then((res) => setServicios(res.data || []))
      .catch(() => setServicios([]))
      .finally(() => setLoading(false));
  }, [cif, serviciosProp]);

  // Agrupar servicios por moto cuando se solicita
  const motoGroups = useMemo(() => {
    if (!groupByMoto || servicios.length === 0) return null;
    const groups = {};
    servicios.forEach((s) => {
      const key = s.matricula_moto || "sin-matricula";
      if (!groups[key]) {
        groups[key] = {
          key,
          matricula: s.matricula_moto || "—",
          marca: s.marca || "",
          modelo: s.modelo || "",
          items: [],
        };
      }
      groups[key].items.push(s);
    });
    return Object.values(groups);
  }, [servicios, groupByMoto]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  if (loading) {
    return (
      <div className={`datos-tecnicos-servicio${groupByMoto ? " datos-tecnicos-servicio--nested" : ""}`}>
        {!groupByMoto && (
          <div className="datos-tecnicos-servicio__header">
            <Wrench className="datos-tecnicos-servicio__icon" />
            <h3>Datos técnicos de servicios de suspensiones</h3>
          </div>
        )}
        <div className="datos-tecnicos-servicio__loading-card">
          <div className="datos-tecnicos-servicio__loading-icon">
            <Loader className="spinner" />
          </div>
          <p className="datos-tecnicos-servicio__loading-text">Cargando datos técnicos...</p>
        </div>
      </div>
    );
  }

  if (servicios.length === 0) {
    return (
      <div className={`datos-tecnicos-servicio${groupByMoto ? " datos-tecnicos-servicio--nested" : ""}`}>
        {!groupByMoto && (
          <div className="datos-tecnicos-servicio__header">
            <Wrench className="datos-tecnicos-servicio__icon" />
            <h3>Datos técnicos de servicios de suspensiones</h3>
          </div>
        )}
        <div className="datos-tecnicos-servicio__empty">
          <Wrench className="datos-tecnicos-servicio__empty-icon" />
          <p>Aún no hay datos técnicos registrados para tus suspensiones.</p>
        </div>
      </div>
    );
  }

  // Vista agrupada por moto
  if (groupByMoto && motoGroups) {
    return (
      <div className="datos-tecnicos-servicio datos-tecnicos-servicio--nested">
        {motoGroups.map((group) => {
          const isOpen = expandedMoto === group.key;
          return (
            <div key={group.key} className={`datos-tecnicos__moto-group${isOpen ? " datos-tecnicos__moto-group--open" : ""}`}>
              <button
                className="datos-tecnicos__moto-group-header"
                onClick={() => setExpandedMoto(isOpen ? null : group.key)}
              >
                <div className="datos-tecnicos__moto-group-info">
                  <Bike className="datos-tecnicos__moto-group-icon" />
                  <div>
                    <span className="datos-tecnicos__moto-group-nombre">
                      {[group.marca, group.modelo].filter(Boolean).join(" ") || group.matricula}
                    </span>
                    <span className="datos-tecnicos__moto-group-matricula">{group.matricula}</span>
                  </div>
                </div>
                <div className="datos-tecnicos__moto-group-right">
                  <span className="datos-tecnicos__moto-group-count">
                    {group.items.length} {group.items.length === 1 ? "servicio" : "servicios"}
                  </span>
                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
              </button>

              {isOpen && (
                <div className="datos-tecnicos__moto-group-body">
                  {group.items.map((servicio) => {
                    const isExpanded = expandedId === servicio.id;
                    const datos = servicio.datos_tecnicos_json || {};
                    const tipoLabel = servicio.tipo_suspension === "FF" ? "Horquilla delantera" : "Amortiguador trasero";
                    return (
                      <div
                        key={servicio.id}
                        className={`datos-tecnicos__card${isExpanded ? " datos-tecnicos__card--expanded" : ""}`}
                      >
                        <button
                          className="datos-tecnicos__card-header"
                          onClick={() => setExpandedId(isExpanded ? null : servicio.id)}
                        >
                          <div className="datos-tecnicos__card-info">
                            <Calendar className="datos-tecnicos__card-icon" />
                            <div className="datos-tecnicos__card-meta">
                              <span className={`datos-tecnicos__tipo datos-tecnicos__tipo--${(servicio.tipo_suspension || "").toLowerCase()}`}>
                                {tipoLabel}
                              </span>
                              <span className="datos-tecnicos__fecha">{formatDate(servicio.fecha_servicio)}</span>
                            </div>
                          </div>
                          <div className="datos-tecnicos__card-right">
                            {isExpanded ? <ChevronUp /> : <ChevronDown />}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="datos-tecnicos__card-body">
                            {servicio.tipo_suspension === "FF" ? (
                              <DatosTecnicosFF datos={datos} />
                            ) : (
                              <DatosTecnicosRR datos={datos} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Vista plana (por defecto)
  return (
    <div className="datos-tecnicos-servicio">
      <div className="datos-tecnicos-servicio__header">
        <Wrench className="datos-tecnicos-servicio__icon" />
        <h3>Datos técnicos de servicios de suspensiones</h3>
        <span className="datos-tecnicos-servicio__count">
          {servicios.length} {servicios.length === 1 ? "servicio" : "servicios"}
        </span>
      </div>

      <div className="datos-tecnicos-servicio__list">
        {servicios.map((servicio) => {
          const isExpanded = expandedId === servicio.id;
          const datos = servicio.datos_tecnicos_json || {};
          const tipoLabel = servicio.tipo_suspension === "FF" ? "Horquilla delantera" : "Amortiguador trasero";

          return (
            <div
              key={servicio.id}
              className={`datos-tecnicos__card${isExpanded ? " datos-tecnicos__card--expanded" : ""}`}
            >
              <button
                className="datos-tecnicos__card-header"
                onClick={() => setExpandedId(isExpanded ? null : servicio.id)}
              >
                <div className="datos-tecnicos__card-info">
                  <Calendar className="datos-tecnicos__card-icon" />
                  <div className="datos-tecnicos__card-meta">
                    {servicio.matricula_moto && (
                      <span className="datos-tecnicos__vehiculo">
                        <Bike className="datos-tecnicos__vehiculo-icon" />
                        {[servicio.marca, servicio.modelo].filter(Boolean).join(" ") || servicio.matricula_moto}
                        {servicio.matricula_moto && <span className="datos-tecnicos__matricula">{servicio.matricula_moto}</span>}
                      </span>
                    )}
                    <span className="datos-tecnicos__fecha">{formatDate(servicio.fecha_servicio)}</span>
                  </div>
                </div>
                <div className="datos-tecnicos__card-right">
                  <span className={`datos-tecnicos__tipo datos-tecnicos__tipo--${(servicio.tipo_suspension || "").toLowerCase()}`}>
                    {tipoLabel}
                  </span>
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </div>
              </button>

              {isExpanded && (
                <div className="datos-tecnicos__card-body">
                  {servicio.tipo_suspension === "FF" ? (
                    <DatosTecnicosFF datos={datos} />
                  ) : (
                    <DatosTecnicosRR datos={datos} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DatosTecnicosServicio;
