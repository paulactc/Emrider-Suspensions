// components/admin/forms/FormTechnicalDataWithClientData.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import {
  User,
  Bike,
  AlertTriangle,
  CheckCircle,
  Info,
  Wrench,
  Settings,
  FileText,
  Calendar,
  Save,
  ArrowLeft,
  Lock,
  Weight,
  Target,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import api from "../../../../services/Api";
import CuestionarioParaTecnico from "./CuestionarioParaTecnico";
import NotificationModal from "../../common/NotificationModal";
import "../../../styles/FormTechnicalDataWithClientData.scss";

// Componente para mostrar datos del cliente de forma compacta
const ClienteDataDisplay = ({ cliente }) => {
  if (!cliente) return null;

  const getSafeValue = (value, fallback = null) => {
    return value !== null && value !== undefined && value !== ""
      ? value
      : fallback;
  };

  const peso = getSafeValue(cliente.peso);
  const nivelPilotaje =
    getSafeValue(cliente.nivelPilotaje) || getSafeValue(cliente.nivel_pilotaje);

  const getNivelPilotajeLabel = (nivel) => {
    const niveles = {
      principiante: "Principiante",
      novato: "Novato",
      intermedio: "Intermedio",
      experto: "Experto",
      profesional: "Profesional",
    };
    return niveles[nivel] || nivel;
  };

  const customerDataPilotaje = [];

  if (peso) {
    customerDataPilotaje.push({
      icon: Weight,
      label: "Peso",
      value: `Peso: ${peso} kg`,
    });
  }

  if (nivelPilotaje) {
    customerDataPilotaje.push({
      icon: Target,
      label: "Nivel",
      value: `Nivel: ${getNivelPilotajeLabel(nivelPilotaje)}`,
    });
  }

  if (customerDataPilotaje.length === 0) {
    return (
      <div className="uleach-customer-compact__info">
        <div className="form-technical__cliente-data-no-questionnaire">
          Completa el cuestionario para ver tus datos de pilotaje
        </div>
      </div>
    );
  }

  return (
    <div className="uleach-customer-compact__info">
      {customerDataPilotaje.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div key={index} className="info-item">
            <IconComponent className="info-icon" />
            <span className="info-text">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
};

const FormTechnicalDataWithClientData = React.memo(
  function FormTechnicalDataWithClientData({
    formData = {},
    handleChange,
    tipoSuspension = "FF",
  }) {
    const { motoId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const qs = new URLSearchParams(location.search);
    const clienteId = qs.get("clienteId") ?? qs.get("clientId");

    const [clienteData, setClienteData] = useState(null);
    const [motoData, setMotoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [datosCompletos, setDatosCompletos] = useState(false);
    const [mostrarCuestionario, setMostrarCuestionario] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [needsQuestionnaire, setNeedsQuestionnaire] = useState(false);
    const [notif, setNotif] = useState({ open: false, type: "success", message: "" });
    const showNotif = (type, message) => setNotif({ open: true, type, message });

    // Estados para el flujo secuencial
    const [servicioGuardado, setServicioGuardado] = useState(false);
    const [guardandoServicio, setGuardandoServicio] = useState(false);
    const [servicioId, setServicioId] = useState(null);

    // Estados para controlar secciones desplegables FF
    const [muellePrincipalOpen, setMuellePrincipalOpen] = useState(false);
    const [pistonMainOpen, setPistonMainOpen] = useState(false);
    const [pistonCompresionOpen, setPistonCompresionOpen] = useState(false);

    // Estados para PISTON MAIN
    const [pistonMainSubtipo, setPistonMainSubtipo] = useState("");

    // Estados para PISTON COMPRESION
    const [pistonCompresionSubtipo, setPistonCompresionSubtipo] = useState("");

    // Estados para controlar campos adicionales (20 base + hasta 20 adicionales = 40 maximo)
    const [pistonMainCompresionExtraRows, setPistonMainCompresionExtraRows] = useState(0);
    const [pistonMainCheckvalveExtraRows, setPistonMainCheckvalveExtraRows] = useState(0);
    const [pistonMainReboteExtraRows, setPistonMainReboteExtraRows] = useState(0);
    const [pistonCompresionCompresionExtraRows, setPistonCompresionCompresionExtraRows] = useState(0);
    const [pistonCompresionCheckvalveExtraRows, setPistonCompresionCheckvalveExtraRows] = useState(0);

    const [formDataLocal, setFormDataLocal] = useState(() => {
      return {
        // Datos basicos del servicio
        pesoPiloto: formData.pesoPiloto || "",
        disciplina: formData.disciplina || "",
        numeroOrden: formData.numeroOrden || "",
        fechaServicio: new Date().toISOString().split("T")[0],
        kmMoto: formData.kmMoto || "",
        fechaProximoMantenimiento: formData.fechaProximoMantenimiento || "",
        servicioSuspension: formData.servicioSuspension || "",
        observaciones: formData.observaciones || "",
        observacionesServicio: formData.observacionesServicio || "",

        // Datos de suspension basicos
        marca: formData.marca || "",
        modelo: formData.modelo || "",
        año: formData.año || "",
        referenciasuspension: formData.referenciasuspension || "",

        // Campos tecnicos FF (Horquilla) - Con estructura In/Out
        oilType: formData.oilType || { in: "", out: "" },
        oilLevel: formData.oilLevel || { in: "", out: "" },
        hComp: formData.hComp || { in: "", out: "" },
        springRate: formData.springRate || "",
        compressionDamping: formData.compressionDamping || { in: "", out: "" },
        reboundDamping: formData.reboundDamping || { in: "", out: "" },
        preload: formData.preload || { in: "", out: "" },
        sag: formData.sag || { in: "", out: "" },
        gas: formData.gas || { in: "", out: "" },
        gasFF: formData.gasFF || { in: "", out: "" },
        specFF: formData.specFF || "",

        // Datos del muelle principal FF
        muellePrincipalSpringRate: formData.muellePrincipalSpringRate || { in: "", out: "" },
        muellePrincipalDiametroInterior: formData.muellePrincipalDiametroInterior || { in: "", out: "" },
        muellePrincipalDiametroExterior: formData.muellePrincipalDiametroExterior || { in: "", out: "" },
        muellePrincipalDiametroSpiras: formData.muellePrincipalDiametroSpiras || { in: "", out: "" },
        muellePrincipalLargo: formData.muellePrincipalLargo || { in: "", out: "" },
        muellePrincipalNumEspiras: formData.muellePrincipalNumEspiras || { in: "", out: "" },
        muellePrincipalTopeFisico: formData.muellePrincipalTopeFisico || { in: "", out: "" },

        // Datos del muelle compresion FF (FIX: faltaban en el estado inicial)
        muelleCompresionSpringRate: formData.muelleCompresionSpringRate || { in: "", out: "" },
        muelleCompresionDiametroInterior: formData.muelleCompresionDiametroInterior || { in: "", out: "" },
        muelleCompresionDiametroExterior: formData.muelleCompresionDiametroExterior || { in: "", out: "" },
        muelleCompresionLargo: formData.muelleCompresionLargo || { in: "", out: "" },
        muelleCompresionNumEspiras: formData.muelleCompresionNumEspiras || { in: "", out: "" },
        muelleCompresionTopeFisico: formData.muelleCompresionTopeFisico || { in: "", out: "" },

        // Datos PISTON MAIN FF
        pistonMainDiametroPiston: formData.pistonMainDiametroPiston || "",
        pistonMainDiametroEje: formData.pistonMainDiametroEje || "",
        pistonMainCompresionOriginalDerecho: formData.pistonMainCompresionOriginalDerecho || formData.pistonMainCompresionOriginal || Array(40).fill(""),
        pistonMainCompresionModificadoDerecho: formData.pistonMainCompresionModificadoDerecho || formData.pistonMainCompresionModificado || Array(40).fill(""),
        pistonMainCompresionOriginalIzquierdo: formData.pistonMainCompresionOriginalIzquierdo || Array(40).fill(""),
        pistonMainCompresionModificadoIzquierdo: formData.pistonMainCompresionModificadoIzquierdo || Array(40).fill(""),
        pistonMainCompresionDiametroIntShim: formData.pistonMainCompresionDiametroIntShim || "",
        pistonMainCheckvalveOriginalDerecho: formData.pistonMainCheckvalveOriginalDerecho || formData.pistonMainCheckvalveOriginal || Array(40).fill(""),
        pistonMainCheckvalveModificadoDerecho: formData.pistonMainCheckvalveModificadoDerecho || formData.pistonMainCheckvalveModificado || Array(40).fill(""),
        pistonMainCheckvalveOriginalIzquierdo: formData.pistonMainCheckvalveOriginalIzquierdo || Array(40).fill(""),
        pistonMainCheckvalveModificadoIzquierdo: formData.pistonMainCheckvalveModificadoIzquierdo || Array(40).fill(""),
        pistonMainCheckvalveDiametroIntShim: formData.pistonMainCheckvalveDiametroIntShim || "",
        pistonMainReboteOriginalDerecho: formData.pistonMainReboteOriginalDerecho || formData.pistonMainReboteOriginal || Array(40).fill(""),
        pistonMainReboteModificadoDerecho: formData.pistonMainReboteModificadoDerecho || formData.pistonMainReboteModificado || Array(40).fill(""),
        pistonMainReboteOriginalIzquierdo: formData.pistonMainReboteOriginalIzquierdo || Array(40).fill(""),
        pistonMainReboteModificadoIzquierdo: formData.pistonMainReboteModificadoIzquierdo || Array(40).fill(""),
        pistonMainReboteDiametroIntShim: formData.pistonMainReboteDiametroIntShim || "",

        // Datos PISTON COMPRESION FF
        pistonCompresionDiametroPiston: formData.pistonCompresionDiametroPiston || "",
        pistonCompresionDiametroEje: formData.pistonCompresionDiametroEje || "",
        pistonCompresionCompresionOriginalDerecho: formData.pistonCompresionCompresionOriginalDerecho || formData.pistonCompresionCompresionOriginal || Array(40).fill(""),
        pistonCompresionCompresionModificadoDerecho: formData.pistonCompresionCompresionModificadoDerecho || formData.pistonCompresionCompresionModificado || Array(40).fill(""),
        pistonCompresionCompresionOriginalIzquierdo: formData.pistonCompresionCompresionOriginalIzquierdo || Array(40).fill(""),
        pistonCompresionCompresionModificadoIzquierdo: formData.pistonCompresionCompresionModificadoIzquierdo || Array(40).fill(""),
        pistonCompresionCompresionDiametroIntShim: formData.pistonCompresionCompresionDiametroIntShim || "",
        pistonCompresionCheckvalveOriginalDerecho: formData.pistonCompresionCheckvalveOriginalDerecho || formData.pistonCompresionCheckvalveOriginal || Array(40).fill(""),
        pistonCompresionCheckvalveModificadoDerecho: formData.pistonCompresionCheckvalveModificadoDerecho || formData.pistonCompresionCheckvalveModificado || Array(40).fill(""),
        pistonCompresionCheckvalveOriginalIzquierdo: formData.pistonCompresionCheckvalveOriginalIzquierdo || Array(40).fill(""),
        pistonCompresionCheckvalveModificadoIzquierdo: formData.pistonCompresionCheckvalveModificadoIzquierdo || Array(40).fill(""),
        pistonCompresionCheckvalveDiametroIntShim: formData.pistonCompresionCheckvalveDiametroIntShim || "",

        forkLength: formData.forkLength || { in: "", out: "" },
        strokeLength: formData.strokeLength || { in: "", out: "" },
        oilCapacity: formData.oilCapacity || { in: "", out: "" },
        springLength: formData.springLength || { in: "", out: "" },
        compressionAdjuster: formData.compressionAdjuster || { in: "", out: "" },
        reboundAdjuster: formData.reboundAdjuster || { in: "", out: "" },
        compressionSettings: formData.compressionSettings || [],
        reboundSettings: formData.reboundSettings || [],

        // Campos tecnicos RR (Amortiguador)
        mainRate: formData.mainRate || "",
        springRef: formData.springRef || "",
        length: formData.length || "",
        numeroSpiras: formData.numeroSpiras || "",
        outerDiameter: formData.outerDiameter || "",
        innerDiameter: formData.innerDiameter || "",
        spire: formData.spire || "",
        rebSpring: formData.rebSpring || "",
        totalLength: formData.totalLength || "",
        stroke: formData.stroke || "",
        shaft: formData.shaft || "",
        piston: formData.piston || "",
        internalSpacer: formData.internalSpacer || "",
        height: formData.height || "",
        strokeToBumpRubber: formData.strokeToBumpRubber || "",
        rod: formData.rod || "",
        reboundSpring: formData.reboundSpring || "",
        springUpperDiameter: formData.springUpperDiameter || "",
        springLowerDiameter: formData.springLowerDiameter || "",
        headRodEnd: formData.headRodEnd || "",
        upperMount: formData.upperMount || "",
        lowerMount: formData.lowerMount || "",
        oil: formData.oil || "",
        gasRR: formData.gasRR || formData.gas || "",
        compressionOriginal: formData.compressionOriginal || "",
        compressionModification: formData.compressionModification || "",
        reboundOriginal: formData.reboundOriginal || [],
        reboundModification: formData.reboundModification || [],
        originalCompressionAdjuster: formData.originalCompressionAdjuster || [],
        modifiedCompressionAdjuster: formData.modifiedCompressionAdjuster || [],
      };
    });

    // Estado del cuestionario
    const [questionnaireData, setQuestionnaireData] = useState({
      peso: "",
      nivelPilotaje: "",
      especialidad: "",
      tipoConduccion: "",
      preferenciaRigidez: "",
    });

    useEffect(() => {
      if (!motoId) {
        setError("No se especifico el ID de la motocicleta");
        setLoading(false);
        return;
      }
      cargarDatosClienteYMoto();
    }, [motoId, clienteId]);

    useEffect(() => {
      if (formData && Object.keys(formData).length > 0) {
        setFormDataLocal((prev) => ({
          ...prev,
          ...formData,
        }));
      }
    }, []);

    const cargarDatosClienteYMoto = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        if (!motoId || motoId === "undefined" || motoId === "null") {
          throw new Error("ID de motocicleta no valido");
        }

        const moto = await Promise.race([
          api.getMoto(motoId),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout al cargar moto")), 10000)
          ),
        ]);
        setMotoData(moto);

        // Cargar servicio existente si ya existe
        let servicioExistente = null;
        try {
          const servicios = await api.getServiciosByMoto(motoId);
          if (servicios.success && servicios.data.length > 0) {
            const serviciosFiltrados = servicios.data.filter(
              (s) => s.tipo_suspension === tipoSuspension
            );

            if (serviciosFiltrados.length > 0) {
              servicioExistente = serviciosFiltrados[0];
            }
          }

          if (servicioExistente) {
            const tieneDatosTecnicos =
              servicioExistente.datos_tecnicos_json &&
              servicioExistente.datos_tecnicos_json !== null &&
              Object.keys(servicioExistente.datos_tecnicos_json).length > 0;

            // Campos basicos del servicio (comunes a ambas ramas)
            const baseServiceFields = {
              numeroOrden: servicioExistente.numero_orden,
              fechaServicio: servicioExistente.fecha_servicio
                ? new Date(servicioExistente.fecha_servicio).toISOString().split("T")[0]
                : undefined,
              kmMoto: servicioExistente.km_moto,
              fechaProximoMantenimiento: servicioExistente.fecha_proximo_mantenimiento
                ? new Date(servicioExistente.fecha_proximo_mantenimiento).toISOString().split("T")[0]
                : undefined,
              servicioSuspension: servicioExistente.servicio_suspension,
              observaciones: servicioExistente.observaciones,
              observacionesServicio: servicioExistente.observaciones_servicio,
              marca: servicioExistente.marca,
              modelo: servicioExistente.modelo,
              año: servicioExistente.año,
              referenciasuspension: servicioExistente.referencia,
              pesoPiloto: servicioExistente.peso_piloto,
              disciplina: servicioExistente.disciplina,
            };

            if (tieneDatosTecnicos) {
              const dtj = servicioExistente.datos_tecnicos_json;
              const mp = dtj.muellePrincipal || {};
              const mc = dtj.muelleCompresion || {};
              const pm = dtj.pistonMain || {};
              const pc = dtj.pistonCompresion || {};
              const pad = (arr) => {
                const a = arr || [];
                return [...a, ...Array(Math.max(0, 40 - a.length)).fill("")];
              };

              setFormDataLocal((prev) => ({
                ...prev,
                // Datos basicos del servicio
                ...Object.fromEntries(
                  Object.entries(baseServiceFields).filter(([, v]) => v !== undefined && v !== null && v !== "")
                ),
                // Datos tecnicos JSON - FF
                oilType: dtj.oilType ?? prev.oilType,
                oilLevel: dtj.oilLevel ?? prev.oilLevel,
                hComp: dtj.hComp ?? prev.hComp,
                springRate: dtj.springRate ?? prev.springRate,
                compressionDamping: dtj.compressionDamping ?? prev.compressionDamping,
                reboundDamping: dtj.reboundDamping ?? prev.reboundDamping,
                preload: dtj.preload ?? prev.preload,
                sag: dtj.sag ?? prev.sag,
                gas: dtj.gas ?? prev.gas,
                gasFF: dtj.gasFF ?? prev.gasFF,
                forkLength: dtj.forkLength ?? prev.forkLength,
                strokeLength: dtj.strokeLength ?? prev.strokeLength,
                oilCapacity: dtj.oilCapacity ?? prev.oilCapacity,
                springLength: dtj.springLength ?? prev.springLength,
                compressionAdjuster: dtj.compressionAdjuster ?? prev.compressionAdjuster,
                reboundAdjuster: dtj.reboundAdjuster ?? prev.reboundAdjuster,
                // Muelle principal
                muellePrincipalSpringRate: mp.springRate ?? prev.muellePrincipalSpringRate,
                muellePrincipalDiametroInterior: mp.diametroInterior ?? prev.muellePrincipalDiametroInterior,
                muellePrincipalDiametroExterior: mp.diametroExterior ?? prev.muellePrincipalDiametroExterior,
                muellePrincipalDiametroSpiras: mp.diametroSpiras ?? prev.muellePrincipalDiametroSpiras,
                muellePrincipalLargo: mp.largo ?? prev.muellePrincipalLargo,
                muellePrincipalNumEspiras: mp.numEspiras ?? prev.muellePrincipalNumEspiras,
                muellePrincipalTopeFisico: mp.topeFisico ?? prev.muellePrincipalTopeFisico,
                // Muelle compresion
                muelleCompresionSpringRate: mc.springRate ?? prev.muelleCompresionSpringRate,
                muelleCompresionDiametroInterior: mc.diametroInterior ?? prev.muelleCompresionDiametroInterior,
                muelleCompresionDiametroExterior: mc.diametroExterior ?? prev.muelleCompresionDiametroExterior,
                muelleCompresionLargo: mc.largo ?? prev.muelleCompresionLargo,
                muelleCompresionNumEspiras: mc.numEspiras ?? prev.muelleCompresionNumEspiras,
                muelleCompresionTopeFisico: mc.topeFisico ?? prev.muelleCompresionTopeFisico,
                // Piston Main
                pistonMainDiametroPiston: pm.diametroPiston ?? prev.pistonMainDiametroPiston,
                pistonMainDiametroEje: pm.diametroEje ?? prev.pistonMainDiametroEje,
                pistonMainCompresionOriginalDerecho: pm.compresionOriginalDerecho?.length ? pad(pm.compresionOriginalDerecho) : prev.pistonMainCompresionOriginalDerecho,
                pistonMainCompresionModificadoDerecho: pm.compresionModificadoDerecho?.length ? pad(pm.compresionModificadoDerecho) : prev.pistonMainCompresionModificadoDerecho,
                pistonMainCompresionOriginalIzquierdo: pm.compresionOriginalIzquierdo?.length ? pad(pm.compresionOriginalIzquierdo) : prev.pistonMainCompresionOriginalIzquierdo,
                pistonMainCompresionModificadoIzquierdo: pm.compresionModificadoIzquierdo?.length ? pad(pm.compresionModificadoIzquierdo) : prev.pistonMainCompresionModificadoIzquierdo,
                pistonMainCheckvalveOriginalDerecho: pm.checkvalveOriginalDerecho?.length ? pad(pm.checkvalveOriginalDerecho) : prev.pistonMainCheckvalveOriginalDerecho,
                pistonMainCheckvalveModificadoDerecho: pm.checkvalveModificadoDerecho?.length ? pad(pm.checkvalveModificadoDerecho) : prev.pistonMainCheckvalveModificadoDerecho,
                pistonMainCheckvalveOriginalIzquierdo: pm.checkvalveOriginalIzquierdo?.length ? pad(pm.checkvalveOriginalIzquierdo) : prev.pistonMainCheckvalveOriginalIzquierdo,
                pistonMainCheckvalveModificadoIzquierdo: pm.checkvalveModificadoIzquierdo?.length ? pad(pm.checkvalveModificadoIzquierdo) : prev.pistonMainCheckvalveModificadoIzquierdo,
                pistonMainReboteOriginalDerecho: pm.reboteOriginalDerecho?.length ? pad(pm.reboteOriginalDerecho) : prev.pistonMainReboteOriginalDerecho,
                pistonMainReboteModificadoDerecho: pm.reboteModificadoDerecho?.length ? pad(pm.reboteModificadoDerecho) : prev.pistonMainReboteModificadoDerecho,
                pistonMainReboteOriginalIzquierdo: pm.reboteOriginalIzquierdo?.length ? pad(pm.reboteOriginalIzquierdo) : prev.pistonMainReboteOriginalIzquierdo,
                pistonMainReboteModificadoIzquierdo: pm.reboteModificadoIzquierdo?.length ? pad(pm.reboteModificadoIzquierdo) : prev.pistonMainReboteModificadoIzquierdo,
                // Piston Compresion
                pistonCompresionDiametroPiston: pc.diametroPiston ?? prev.pistonCompresionDiametroPiston,
                pistonCompresionDiametroEje: pc.diametroEje ?? prev.pistonCompresionDiametroEje,
                pistonCompresionCompresionOriginalDerecho: pc.compresionOriginalDerecho?.length ? pad(pc.compresionOriginalDerecho) : prev.pistonCompresionCompresionOriginalDerecho,
                pistonCompresionCompresionModificadoDerecho: pc.compresionModificadoDerecho?.length ? pad(pc.compresionModificadoDerecho) : prev.pistonCompresionCompresionModificadoDerecho,
                pistonCompresionCompresionOriginalIzquierdo: pc.compresionOriginalIzquierdo?.length ? pad(pc.compresionOriginalIzquierdo) : prev.pistonCompresionCompresionOriginalIzquierdo,
                pistonCompresionCompresionModificadoIzquierdo: pc.compresionModificadoIzquierdo?.length ? pad(pc.compresionModificadoIzquierdo) : prev.pistonCompresionCompresionModificadoIzquierdo,
                pistonCompresionCheckvalveOriginalDerecho: pc.checkvalveOriginalDerecho?.length ? pad(pc.checkvalveOriginalDerecho) : prev.pistonCompresionCheckvalveOriginalDerecho,
                pistonCompresionCheckvalveModificadoDerecho: pc.checkvalveModificadoDerecho?.length ? pad(pc.checkvalveModificadoDerecho) : prev.pistonCompresionCheckvalveModificadoDerecho,
                pistonCompresionCheckvalveOriginalIzquierdo: pc.checkvalveOriginalIzquierdo?.length ? pad(pc.checkvalveOriginalIzquierdo) : prev.pistonCompresionCheckvalveOriginalIzquierdo,
                pistonCompresionCheckvalveModificadoIzquierdo: pc.checkvalveModificadoIzquierdo?.length ? pad(pc.checkvalveModificadoIzquierdo) : prev.pistonCompresionCheckvalveModificadoIzquierdo,
                // RR
                mainRate: dtj.mainRate ?? prev.mainRate,
                springRef: dtj.springRef ?? prev.springRef,
                length: dtj.length ?? prev.length,
                numeroSpiras: dtj.numeroSpiras ?? prev.numeroSpiras,
                outerDiameter: dtj.outerDiameter ?? prev.outerDiameter,
                innerDiameter: dtj.innerDiameter ?? prev.innerDiameter,
                spire: dtj.spire ?? prev.spire,
                rebSpring: dtj.rebSpring ?? prev.rebSpring,
                totalLength: dtj.totalLength ?? prev.totalLength,
                stroke: dtj.stroke ?? prev.stroke,
                shaft: dtj.shaft ?? prev.shaft,
                piston: dtj.piston ?? prev.piston,
                internalSpacer: dtj.internalSpacer ?? prev.internalSpacer,
                height: dtj.height ?? prev.height,
                strokeToBumpRubber: dtj.strokeToBumpRubber ?? prev.strokeToBumpRubber,
                rod: dtj.rod ?? prev.rod,
                reboundSpring: dtj.reboundSpring ?? prev.reboundSpring,
                springUpperDiameter: dtj.springUpperDiameter ?? prev.springUpperDiameter,
                springLowerDiameter: dtj.springLowerDiameter ?? prev.springLowerDiameter,
                headRodEnd: dtj.headRodEnd ?? prev.headRodEnd,
                upperMount: dtj.upperMount ?? prev.upperMount,
                lowerMount: dtj.lowerMount ?? prev.lowerMount,
                oil: dtj.oil ?? prev.oil,
                gasRR: dtj.gas ?? prev.gasRR,
                compressionOriginal: dtj.compressionOriginal ?? prev.compressionOriginal,
                compressionModification: dtj.compressionModification ?? prev.compressionModification,
                reboundOriginal: dtj.reboundOriginal?.length ? dtj.reboundOriginal : prev.reboundOriginal,
                reboundModification: dtj.reboundModification?.length ? dtj.reboundModification : prev.reboundModification,
                originalCompressionAdjuster: dtj.originalCompressionAdjuster?.length ? dtj.originalCompressionAdjuster : prev.originalCompressionAdjuster,
                modifiedCompressionAdjuster: dtj.modifiedCompressionAdjuster?.length ? dtj.modifiedCompressionAdjuster : prev.modifiedCompressionAdjuster,
              }));

              if (pm.subtipo) setPistonMainSubtipo(pm.subtipo);
              setServicioId(servicioExistente.id);
              setServicioGuardado(true);
            } else {
              setFormDataLocal((prev) => ({
                ...prev,
                ...Object.fromEntries(
                  Object.entries(baseServiceFields).filter(([, v]) => v !== undefined && v !== null && v !== "")
                ),
              }));

              setServicioId(servicioExistente.id);
              if (servicioExistente.status === "completed" || servicioExistente.status === "pending") {
                setServicioGuardado(true);
              }
            }
          }
        } catch (servicioError) {
          console.warn("Error cargando servicio existente:", servicioError.message);
        }

        // Cargar datos del cliente
        let cliente = null;
        try {
          if (clienteId) {
            cliente = await Promise.race([
              api.getCliente(clienteId),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout al cargar cliente")), 5000)
              ),
            ]);
          } else if (moto.cifPropietario) {
            const clientes = await Promise.race([
              api.getClientes(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout al cargar clientes")), 5000)
              ),
            ]);
            cliente = clientes.find((c) => (c.cif || "").toLowerCase() === (moto.cifPropietario || "").toLowerCase());
          }
        } catch (clienteError) {
          console.warn("Error cargando cliente:", clienteError.message);
        }

        if (cliente) {
          setClienteData(cliente);
          setFormDataLocal((prev) => ({
            ...prev,
            pesoPiloto: cliente.peso || prev.pesoPiloto,
            disciplina: obtenerDisciplinaFromMoto(moto) || prev.disciplina,
          }));
          verificarDatosCompletos(cliente, moto);
        } else {
          setDatosCompletos(false);
          setNeedsQuestionnaire(true);
          setMostrarCuestionario(true);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError(`Error al cargar los datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }, [motoId, clienteId]);

    const obtenerDisciplinaFromMoto = (moto) => {
      if (!moto) return "";
      if (moto.especialidad === "onroad") return "Onroad";
      if (moto.especialidad === "offroad") return "Offroad";
      return "";
    };

    const verificarDatosCompletos = (cliente, moto) => {
      if (!cliente || !moto) return false;

      const cPeso = cliente?.peso;
      const cNivel = cliente?.nivelPilotaje ?? cliente?.nivel_pilotaje;
      const mEsp = moto?.especialidad;
      const mTipo = moto?.tipoConduccion ?? moto?.tipo_conduccion;
      const mPref = moto?.preferenciaRigidez ?? moto?.preferencia_rigidez;

      const tieneClienteData = Boolean(cPeso) && Boolean(cNivel);
      const tieneMotoData = Boolean(mEsp) && Boolean(mTipo) && Boolean(mPref);
      const completo = tieneClienteData && tieneMotoData;

      const needsQuest = !tieneClienteData || !tieneMotoData;
      setNeedsQuestionnaire(needsQuest);
      setDatosCompletos(Boolean(completo));
      setMostrarCuestionario(true);
      return completo;
    };

    const handleInputChange = (field, value, subfield = null) => {
      if (subfield) {
        setFormDataLocal((prev) => ({
          ...prev,
          [field]: {
            ...prev[field],
            [subfield]: value,
          },
        }));
      } else {
        setFormDataLocal((prev) => ({
          ...prev,
          [field]: value,
        }));
      }

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }

      if (handleChange && typeof handleChange === "function") {
        const finalValue = subfield
          ? { ...formDataLocal[field], [subfield]: value }
          : value;
        handleChange({ target: { name: field, value: finalValue } });
      }
    };

    const handleArrayChange = (field, index, value) => {
      setFormDataLocal((prev) => {
        const currentArray = prev[field] || Array(40).fill("");
        const newArray = currentArray.map((item, i) => (i === index ? value : item));
        return { ...prev, [field]: newArray };
      });

      if (handleChange && typeof handleChange === "function") {
        const currentArray = formDataLocal[field] || Array(40).fill("");
        const newArray = currentArray.map((item, i) => (i === index ? value : item));
        handleChange({ target: { name: field, value: newArray } });
      }
    };

    const copyOriginalToModificado = (originalField, modificadoField) => {
      const originalData = formDataLocal[originalField] || [];
      setFormDataLocal((prev) => ({
        ...prev,
        [modificadoField]: [...originalData],
      }));
    };

    const handleCuestionarioComplete = async (datosFormulario) => {
      try {
        const result = await api.saveQuestionnaire(datosFormulario);

        if (result && result.success) {
          if (datosFormulario.cliente) {
            setClienteData((prev) => ({
              ...prev,
              peso: datosFormulario.cliente.peso,
              nivelPilotaje: datosFormulario.cliente.nivelPilotaje,
            }));
          }

          if (datosFormulario.motocicletas && datosFormulario.motocicletas[0]) {
            const motoActualizada = datosFormulario.motocicletas[0];
            setMotoData((prev) => ({
              ...prev,
              especialidad: motoActualizada.especialidad,
              tipoConduccion: motoActualizada.tipoConduccion,
              preferenciaRigidez: motoActualizada.preferenciaRigidez,
            }));
          }

          setMostrarCuestionario(true);
          setDatosCompletos(true);

          setFormDataLocal((prev) => ({
            ...prev,
            pesoPiloto: datosFormulario.cliente.peso,
            disciplina:
              datosFormulario.motocicletas[0].especialidad === "onroad"
                ? "Onroad"
                : "Offroad",
          }));
          showNotif("success", "Datos del cuestionario guardados correctamente. Ahora puedes continuar con el servicio tecnico.");
        }
      } catch (error) {
        console.error("Error guardando datos del cuestionario:", error);
        showNotif("error", "Error al guardar los datos del cuestionario: " + error.message);
      }
    };

    const validateServicioInfo = () => {
      const newErrors = {};
      if (!formDataLocal.numeroOrden) newErrors.numeroOrden = "Numero de orden requerido";
      if (!formDataLocal.servicioSuspension) newErrors.servicioSuspension = "Tipo de servicio requerido";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleGuardarServicio = useCallback(async () => {
      if (!validateServicioInfo()) return;

      setGuardandoServicio(true);
      try {
        const servicioData = {
          motoId: parseInt(motoId),
          clienteId: clienteId ? parseInt(clienteId) : null,
          tipoSuspension: tipoSuspension,
          numeroOrden: formDataLocal.numeroOrden,
          fechaServicio: formDataLocal.fechaServicio,
          kmMoto: formDataLocal.kmMoto,
          fechaProximoMantenimiento: formDataLocal.fechaProximoMantenimiento,
          servicioSuspension: formDataLocal.servicioSuspension,
          marca: formDataLocal.marca,
          modelo: formDataLocal.modelo,
          año: formDataLocal.año,
          referencia: formDataLocal.referenciasuspension,
          pesoPiloto: formDataLocal.pesoPiloto,
          disciplina: formDataLocal.disciplina,
          observacionesServicio: formDataLocal.observacionesServicio,
        };

        let result;
        if (servicioId) {
          result = await api.updateServicioInfo(servicioId, servicioData);
        } else {
          result = await api.createServicioInfo(servicioData);
        }

        if (result && result.success) {
          setServicioGuardado(true);
          if (!servicioId && result.data && result.data.id) {
            setServicioId(result.data.id);
          }
          showNotif("success", "Informacion del servicio guardada correctamente. Ahora puedes continuar con los datos tecnicos.");
        } else {
          throw new Error(result?.message || "Error al guardar el servicio");
        }
      } catch (error) {
        console.error("Error guardando informacion del servicio:", error);
        setErrors({ general: "Error al guardar la informacion del servicio" });
      } finally {
        setGuardandoServicio(false);
      }
    }, [formDataLocal, motoId, clienteId, tipoSuspension, servicioId]);

    const validateForm = () => {
      if (!servicioGuardado) {
        setErrors({ general: "Primero debe guardar la informacion del servicio" });
        return false;
      }
      setErrors({});
      return true;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      if (!servicioId) {
        setErrors({ general: "No se encontro el ID del servicio. Intenta guardar la informacion del servicio primero." });
        return;
      }

      setSaving(true);
      try {
        const datosTecnicosJson = {
          tipoSuspension: tipoSuspension,
          ...(tipoSuspension === "FF" && {
            oilType: formDataLocal.oilType,
            oilLevel: formDataLocal.oilLevel,
            hComp: formDataLocal.hComp,
            springRate: formDataLocal.springRate,
            compressionDamping: formDataLocal.compressionDamping,
            reboundDamping: formDataLocal.reboundDamping,
            preload: formDataLocal.preload,
            sag: formDataLocal.sag,
            gas: formDataLocal.gas,
            gasFF: formDataLocal.gasFF,
            forkLength: formDataLocal.forkLength,
            strokeLength: formDataLocal.strokeLength,
            oilCapacity: formDataLocal.oilCapacity,
            springLength: formDataLocal.springLength,
            compressionAdjuster: formDataLocal.compressionAdjuster,
            reboundAdjuster: formDataLocal.reboundAdjuster,
            muellePrincipal: {
              springRate: formDataLocal.muellePrincipalSpringRate,
              diametroInterior: formDataLocal.muellePrincipalDiametroInterior,
              diametroExterior: formDataLocal.muellePrincipalDiametroExterior,
              diametroSpiras: formDataLocal.muellePrincipalDiametroSpiras,
              largo: formDataLocal.muellePrincipalLargo,
              numEspiras: formDataLocal.muellePrincipalNumEspiras,
              topeFisico: formDataLocal.muellePrincipalTopeFisico,
            },
            muelleCompresion: {
              springRate: formDataLocal.muelleCompresionSpringRate,
              diametroInterior: formDataLocal.muelleCompresionDiametroInterior,
              diametroExterior: formDataLocal.muelleCompresionDiametroExterior,
              largo: formDataLocal.muelleCompresionLargo,
              numEspiras: formDataLocal.muelleCompresionNumEspiras,
              topeFisico: formDataLocal.muelleCompresionTopeFisico,
            },
            pistonMain: {
              diametroPiston: formDataLocal.pistonMainDiametroPiston,
              diametroEje: formDataLocal.pistonMainDiametroEje,
              subtipo: pistonMainSubtipo,
              compresionOriginalDerecho: (formDataLocal.pistonMainCompresionOriginalDerecho || []).filter((v) => v !== ""),
              compresionModificadoDerecho: (formDataLocal.pistonMainCompresionModificadoDerecho || []).filter((v) => v !== ""),
              compresionOriginalIzquierdo: (formDataLocal.pistonMainCompresionOriginalIzquierdo || []).filter((v) => v !== ""),
              compresionModificadoIzquierdo: (formDataLocal.pistonMainCompresionModificadoIzquierdo || []).filter((v) => v !== ""),
              compresionDiametroIntShim: formDataLocal.pistonMainCompresionDiametroIntShim,
              checkvalveOriginalDerecho: (formDataLocal.pistonMainCheckvalveOriginalDerecho || []).filter((v) => v !== ""),
              checkvalveModificadoDerecho: (formDataLocal.pistonMainCheckvalveModificadoDerecho || []).filter((v) => v !== ""),
              checkvalveOriginalIzquierdo: (formDataLocal.pistonMainCheckvalveOriginalIzquierdo || []).filter((v) => v !== ""),
              checkvalveModificadoIzquierdo: (formDataLocal.pistonMainCheckvalveModificadoIzquierdo || []).filter((v) => v !== ""),
              checkvalveDiametroIntShim: formDataLocal.pistonMainCheckvalveDiametroIntShim,
              reboteOriginalDerecho: (formDataLocal.pistonMainReboteOriginalDerecho || []).filter((v) => v !== ""),
              reboteModificadoDerecho: (formDataLocal.pistonMainReboteModificadoDerecho || []).filter((v) => v !== ""),
              reboteOriginalIzquierdo: (formDataLocal.pistonMainReboteOriginalIzquierdo || []).filter((v) => v !== ""),
              reboteModificadoIzquierdo: (formDataLocal.pistonMainReboteModificadoIzquierdo || []).filter((v) => v !== ""),
              reboteDiametroIntShim: formDataLocal.pistonMainReboteDiametroIntShim,
            },
            pistonCompresion: {
              diametroPiston: formDataLocal.pistonCompresionDiametroPiston,
              diametroEje: formDataLocal.pistonCompresionDiametroEje,
              compresionOriginalDerecho: (formDataLocal.pistonCompresionCompresionOriginalDerecho || []).filter((v) => v !== ""),
              compresionModificadoDerecho: (formDataLocal.pistonCompresionCompresionModificadoDerecho || []).filter((v) => v !== ""),
              compresionOriginalIzquierdo: (formDataLocal.pistonCompresionCompresionOriginalIzquierdo || []).filter((v) => v !== ""),
              compresionModificadoIzquierdo: (formDataLocal.pistonCompresionCompresionModificadoIzquierdo || []).filter((v) => v !== ""),
              compresionDiametroIntShim: formDataLocal.pistonCompresionCompresionDiametroIntShim,
              checkvalveOriginalDerecho: (formDataLocal.pistonCompresionCheckvalveOriginalDerecho || []).filter((v) => v !== ""),
              checkvalveModificadoDerecho: (formDataLocal.pistonCompresionCheckvalveModificadoDerecho || []).filter((v) => v !== ""),
              checkvalveOriginalIzquierdo: (formDataLocal.pistonCompresionCheckvalveOriginalIzquierdo || []).filter((v) => v !== ""),
              checkvalveModificadoIzquierdo: (formDataLocal.pistonCompresionCheckvalveModificadoIzquierdo || []).filter((v) => v !== ""),
              checkvalveDiametroIntShim: formDataLocal.pistonCompresionCheckvalveDiametroIntShim,
            },
            compressionSettings: (formDataLocal.compressionSettings || []).filter((v) => v !== ""),
            reboundSettings: (formDataLocal.reboundSettings || []).filter((v) => v !== ""),
          }),
          ...(tipoSuspension === "RR" && {
            mainRate: formDataLocal.mainRate,
            springRef: formDataLocal.springRef,
            length: formDataLocal.length,
            numeroSpiras: formDataLocal.numeroSpiras,
            outerDiameter: formDataLocal.outerDiameter,
            innerDiameter: formDataLocal.innerDiameter,
            spire: formDataLocal.spire,
            rebSpring: formDataLocal.rebSpring,
            totalLength: formDataLocal.totalLength,
            stroke: formDataLocal.stroke,
            shaft: formDataLocal.shaft,
            piston: formDataLocal.piston,
            internalSpacer: formDataLocal.internalSpacer,
            height: formDataLocal.height,
            strokeToBumpRubber: formDataLocal.strokeToBumpRubber,
            rod: formDataLocal.rod,
            reboundSpring: formDataLocal.reboundSpring,
            springUpperDiameter: formDataLocal.springUpperDiameter,
            springLowerDiameter: formDataLocal.springLowerDiameter,
            headRodEnd: formDataLocal.headRodEnd,
            upperMount: formDataLocal.upperMount,
            lowerMount: formDataLocal.lowerMount,
            oil: formDataLocal.oil,
            gas: formDataLocal.gasRR,
            compressionOriginal: formDataLocal.compressionOriginal,
            compressionModification: formDataLocal.compressionModification,
            reboundOriginal: (formDataLocal.reboundOriginal || []).filter((v) => v !== ""),
            reboundModification: (formDataLocal.reboundModification || []).filter((v) => v !== ""),
            originalCompressionAdjuster: (formDataLocal.originalCompressionAdjuster || []).filter((v) => v !== ""),
            modifiedCompressionAdjuster: (formDataLocal.modifiedCompressionAdjuster || []).filter((v) => v !== ""),
          }),
        };

        const result = await api.updateServicioInfo(servicioId, {
          datosTecnicosJson: datosTecnicosJson,
        });

        if (result && result.success) {
          showNotif("success", `Datos tecnicos ${tipoSuspension} guardados correctamente`);
          navigate(-1);
        } else {
          throw new Error(result?.message || "Error al guardar los datos tecnicos");
        }
      } catch (error) {
        console.error("Error guardando datos tecnicos:", error);
        setErrors({ general: `Error al guardar los datos tecnicos: ${error.message}` });
      } finally {
        setSaving(false);
      }
    };

    const mapearEspecialidad = (esp) => {
      return esp === "onroad" ? "Carretera" : esp === "offroad" ? "Campo" : esp;
    };

    // =============================================
    // HELPER: Renderiza una seccion de filas Original/Modificado con lado derecho e izquierdo
    // =============================================
    const renderShimSection = (title, titleColor, fields, extraRows, setExtraRows, shimField) => {
      const { originalDerecho, modificadoDerecho, originalIzquierdo, modificadoIzquierdo } = fields;

      return (
        <div style={{ marginTop: "2rem" }}>
          {/* Header con Diametro Int Shim */}
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center",
            marginBottom: "1rem", padding: "1rem", backgroundColor: "#f3f4f6",
            borderRadius: "8px", border: "2px solid #d1d5db", gap: "1rem",
          }}>
            <h3 style={{ color: "#1f2937", fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
              {title}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ fontWeight: 600, color: "#4b5563", fontSize: "0.9rem" }}>Diametro Int Shim:</label>
              <input
                type="text"
                value={formDataLocal[shimField] || ""}
                onChange={(e) => handleInputChange(shimField, e.target.value)}
                className="form-input"
                style={{ width: "120px" }}
                disabled={!servicioGuardado}
              />
            </div>
          </div>

          {/* LADO DERECHO */}
          <div style={{ marginBottom: "3rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
            <h4 style={{ color: "#1f2937", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", padding: "0.5rem 1rem", backgroundColor: "#dbeafe", borderRadius: "6px" }}>
              LADO DERECHO
            </h4>
            <div style={{ gridColumn: "1 / -1", marginBottom: "0.5rem" }}>
              <button type="button" onClick={() => copyOriginalToModificado(originalDerecho, modificadoDerecho)}
                style={{ padding: "0.5rem 1rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}
                disabled={!servicioGuardado}>
                Pasar datos de Original a Modificado
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 1fr", gap: "0.5rem", alignItems: "start" }}>
              <div style={{ fontWeight: 600, color: "#6b7280", textAlign: "center" }}>#</div>
              <div style={{ fontWeight: 600, color: "#6b7280", textAlign: "center" }}>Original</div>
              <div style={{ fontWeight: 600, color: "#6b7280", textAlign: "center" }}>Modificado</div>
              {Array.from({ length: 20 + extraRows }).map((_, index) => (
                <React.Fragment key={index}>
                  <div style={{ textAlign: "center", color: "#6b7280" }}>{index + 1}</div>
                  <input type="text" value={(formDataLocal[originalDerecho] || [])[index] || ""}
                    onChange={(e) => handleArrayChange(originalDerecho, index, e.target.value)}
                    className="form-input" style={{ padding: "0.5rem", fontSize: "0.9rem", textAlign: "center" }}
                    disabled={!servicioGuardado} />
                  <input type="text" value={(formDataLocal[modificadoDerecho] || [])[index] || ""}
                    onChange={(e) => handleArrayChange(modificadoDerecho, index, e.target.value)}
                    className="form-input" style={{ padding: "0.5rem", fontSize: "0.9rem", textAlign: "center" }}
                    disabled={!servicioGuardado} />
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* LADO IZQUIERDO */}
          <div style={{ marginBottom: "2rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
            <h4 style={{ color: "#1f2937", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", padding: "0.5rem 1rem", backgroundColor: "#fef3c7", borderRadius: "6px" }}>
              LADO IZQUIERDO
            </h4>
            <div style={{ gridColumn: "1 / -1", marginBottom: "0.5rem" }}>
              <button type="button" onClick={() => copyOriginalToModificado(originalIzquierdo, modificadoIzquierdo)}
                style={{ padding: "0.5rem 1rem", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}
                disabled={!servicioGuardado}>
                Pasar datos de Original a Modificado
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 1fr", gap: "0.5rem", alignItems: "start" }}>
              <div style={{ fontWeight: 600, color: "#6b7280", textAlign: "center" }}>#</div>
              <div style={{ fontWeight: 600, color: "#6b7280", textAlign: "center" }}>Original</div>
              <div style={{ fontWeight: 600, color: "#6b7280", textAlign: "center" }}>Modificado</div>
              {Array.from({ length: 20 + extraRows }).map((_, index) => (
                <React.Fragment key={`izq-${index}`}>
                  <div style={{ textAlign: "center", color: "#6b7280" }}>{index + 1}</div>
                  <input type="text" value={(formDataLocal[originalIzquierdo] || [])[index] || ""}
                    onChange={(e) => handleArrayChange(originalIzquierdo, index, e.target.value)}
                    className="form-input" style={{ padding: "0.5rem", fontSize: "0.9rem", textAlign: "center" }}
                    disabled={!servicioGuardado} />
                  <input type="text" value={(formDataLocal[modificadoIzquierdo] || [])[index] || ""}
                    onChange={(e) => handleArrayChange(modificadoIzquierdo, index, e.target.value)}
                    className="form-input" style={{ padding: "0.5rem", fontSize: "0.9rem", textAlign: "center" }}
                    disabled={!servicioGuardado} />
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Boton anadir filas */}
          {extraRows < 20 && (
            <button type="button" onClick={() => setExtraRows((prev) => Math.min(prev + 5, 20))}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}
              disabled={!servicioGuardado}>
              <Plus size={16} /> Agregar 5 filas mas
            </button>
          )}
        </div>
      );
    };

    // =============================================
    // HELPER: Renderiza un campo In/Out
    // =============================================
    const renderInOutField = (label, field, type = "text", placeholder = "", step) => (
      <div className="form-group-inout">
        <label className="form-label">{label}</label>
        <div className="input-pair">
          <div className="input-wrapper">
            <span className="input-label">In</span>
            <input type={type} step={step} value={formDataLocal[field]?.in || ""}
              onChange={(e) => handleInputChange(field, e.target.value, "in")}
              className="form-input-inout" placeholder={placeholder} disabled={!servicioGuardado} />
          </div>
          <div className="input-wrapper">
            <span className="input-label">Out</span>
            <input type={type} step={step} value={formDataLocal[field]?.out || ""}
              onChange={(e) => handleInputChange(field, e.target.value, "out")}
              className="form-input-inout" placeholder={placeholder} disabled={!servicioGuardado} />
          </div>
        </div>
      </div>
    );

    if (loading) {
      return (
        <div className="app-containerform">
          <div className="form-technical__loading-container">
            <div className="form-technical__loading-spinner"></div>
            <h3>Cargando datos tecnicos...</h3>
            <p>Preparando formulario</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="app-containerform">
          <div className="error-container">
            <h3>Error al cargar datos</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-retry">Reintentar</button>
          </div>
        </div>
      );
    }

    return (
      <div className="app-containerform">
        {/* Header con boton volver */}
        <div className="form-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} /> Volver
          </button>
          <div className="header-title">
            <h1>Datos Tecnicos - {tipoSuspension === "FF" ? "FF (Horquilla Delantera)" : "RR (Amortiguador Trasero)"}</h1>
            {motoData && <p>{motoData.marca} {motoData.modelo} - {motoData.matricula}</p>}
          </div>
        </div>

        {errors.general && (
          <div className="error-banner"><AlertTriangle size={20} /> {errors.general}</div>
        )}

        {/* Cuestionario para Tecnico */}
        <CuestionarioParaTecnico
          cliente={clienteData} moto={motoData} onComplete={handleCuestionarioComplete}
          datosActuales={formDataLocal} datosCompletos={datosCompletos}
        />

        {/* Informacion del Cliente y Moto */}
        <div className="client-moto-info">
          <h2 className="header-title">
            Informacion del Cliente y Motocicleta
            <span className="suspension-type-badge">
              {tipoSuspension === "FF" ? "Horquilla Delantera (FF)" : "Amortiguador Trasero (RR)"}
            </span>
          </h2>

          {/* Datos del Cliente */}
          <div className="info-section">
            <div className="info-header">
              <User className="info-icon" /><h3>Datos del Cliente</h3>
              {datosCompletos ? <CheckCircle className="status-icon status-complete" /> : <AlertTriangle className="status-icon status-incomplete" />}
            </div>
            {clienteData ? (
              <div className="info-grid">
                <div className="info-item"><span className="info-label">Nombre:</span><span className="info-value">{clienteData.nombre_completo || `${clienteData.nombre || ""} ${clienteData.apellidos || ""}`.trim() || "—"}</span></div>
                <div className="info-item"><span className="info-label">CIF:</span><span className="info-value">{clienteData.cif}</span></div>
                <div className="info-item"><span className="info-label">Datos de Pilotaje:</span><span className="info-value"><ClienteDataDisplay cliente={clienteData} /></span></div>
              </div>
            ) : (
              <div className="no-data"><Info className="info-icon" /><span>No se encontraron datos del cliente</span></div>
            )}
          </div>

          {/* Datos de la Moto */}
          <div className="info-section">
            <div className="info-header"><Bike className="info-icon" /><h3>Datos de la Motocicleta</h3></div>
            {motoData ? (
              <div className="info-grid">
                <div className="info-item"><span className="info-label">Marca/Modelo:</span><span className="info-value">{motoData.marca} {motoData.modelo}</span></div>
                <div className="info-item"><span className="info-label">Año:</span><span className="info-value">{motoData.anio || "—"}</span></div>
                <div className="info-item"><span className="info-label">Matricula:</span><span className="info-value">{motoData.matricula}</span></div>
                <div className="info-item"><span className="info-label">Especialidad:</span><span className="info-value">{motoData.especialidad ? mapearEspecialidad(motoData.especialidad) : <span className="missing-data">No disponible</span>}</span></div>
                <div className="info-item"><span className="info-label">Tipo Conduccion:</span><span className="info-value">{(motoData.tipoConduccion ?? motoData.tipo_conduccion) || <span className="missing-data">No disponible</span>}</span></div>
                <div className="info-item"><span className="info-label">Preferencia Rigidez:</span><span className="info-value">{motoData.preferenciaRigidez || <span className="missing-data">No disponible</span>}</span></div>
              </div>
            ) : (
              <div className="no-data"><Info className="info-icon" /><span>No se encontraron datos de la motocicleta</span></div>
            )}
          </div>

          {/* Estado del Cuestionario */}
          <div className="questionnaire-status">
            {datosCompletos ? (
              <div className="status-complete"><CheckCircle className="status-icon" /><span>El cliente ya ha completado el cuestionario.</span></div>
            ) : (
              <div className="status-incomplete"><AlertTriangle className="status-icon" /><span>El cliente aun no ha completado el cuestionario. Complete los datos en el formulario de arriba.</span></div>
            )}
          </div>
        </div>

        {/* FORMULARIO TECNICO CON FLUJO SECUENCIAL */}
        <form onSubmit={handleSubmit} className="technical-form">
          {/* PASO 1: INFORMACION DEL SERVICIO */}
          <div className={`formulario-seccion ${!datosCompletos ? "deshabilitado" : ""} ${servicioGuardado ? "completado" : ""}`}>
            {!datosCompletos && (
              <div className="overlay-deshabilitado"><AlertTriangle className="overlay-icon" /><p>Completa el cuestionario antes de continuar</p></div>
            )}
            {servicioGuardado && (
              <div className="overlay-completado">
                <CheckCircle className="overlay-icon" /><p>Informacion del servicio guardada correctamente</p>
                <button type="button" onClick={() => setServicioGuardado(false)} className="btn-editar-servicio">Modificar informacion</button>
              </div>
            )}

            <div className="form-section servicio-section">
              <div className="section-header">
                <FileText size={24} /><h2>Informacion del Servicio</h2>
                <div className="section-status">
                  {servicioGuardado
                    ? <span className="status-saved"><CheckCircle size={16} /> Guardado</span>
                    : <span className="status-pending"><AlertTriangle size={16} /> Pendiente</span>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Numero de orden *</label>
                  <input type="text" value={formDataLocal.numeroOrden} onChange={(e) => handleInputChange("numeroOrden", e.target.value)}
                    className={`form-input ${errors.numeroOrden ? "error" : ""}`} placeholder="ORD-2025-001" disabled={!datosCompletos || servicioGuardado} />
                  {errors.numeroOrden && <span className="error-text">{errors.numeroOrden}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha del servicio</label>
                  <input type="date" value={formDataLocal.fechaServicio} onChange={(e) => handleInputChange("fechaServicio", e.target.value)}
                    className="form-input" disabled={!datosCompletos || servicioGuardado} />
                </div>

                <div className="form-group">
                  <label className="form-label">Kilometros de la moto</label>
                  <input type="number" value={formDataLocal.kmMoto} onChange={(e) => handleInputChange("kmMoto", e.target.value)}
                    className="form-input" placeholder="25000" disabled={!datosCompletos || servicioGuardado} />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Tipo de servicio *</label>
                  <select value={formDataLocal.servicioSuspension} onChange={(e) => handleInputChange("servicioSuspension", e.target.value)}
                    className={`form-input ${errors.servicioSuspension ? "error" : ""}`} disabled={!datosCompletos || servicioGuardado}>
                    <option value="">Seleccionar servicio</option>
                    <option value="mantenimiento-basico">Mantenimiento basico</option>
                    <option value="mantenimiento-basico-retener">Mantenimiento basico + cambio de retener original</option>
                    <option value="modificacion-hidraulico">Modificacion del hidraulico</option>
                    <option value="mantenimiento-completo">Mantenimiento completo</option>
                  </select>
                  {errors.servicioSuspension && <span className="error-text">{errors.servicioSuspension}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Marca</label>
                  <input type="text" value={formDataLocal.marca} onChange={(e) => handleInputChange("marca", e.target.value)}
                    className="form-input" placeholder="Ohlins" disabled={!datosCompletos || servicioGuardado} />
                </div>

                <div className="form-group">
                  <label className="form-label">Modelo</label>
                  <input type="text" value={formDataLocal.modelo} onChange={(e) => handleInputChange("modelo", e.target.value)}
                    className="form-input" placeholder={tipoSuspension === "FF" ? "NIX 30" : "TTX GP"} disabled={!datosCompletos || servicioGuardado} />
                </div>

                <div className="form-group">
                  <label className="form-label">Año</label>
                  <input type="number" value={formDataLocal.año} onChange={(e) => handleInputChange("año", e.target.value)}
                    className="form-input" placeholder="2021" min="1990" max={new Date().getFullYear()} disabled={!datosCompletos || servicioGuardado} />
                </div>

                <div className="form-group">
                  <label className="form-label">Referencia</label>
                  <input type="text" value={formDataLocal.referenciasuspension} onChange={(e) => handleInputChange("referenciasuspension", e.target.value)}
                    className="form-input" placeholder={tipoSuspension === "FF" ? "NIX-30-43" : "TTX-GP-46-400"} disabled={!datosCompletos || servicioGuardado} />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Observaciones del servicio</label>
                  <textarea value={formDataLocal.observacionesServicio} onChange={(e) => handleInputChange("observacionesServicio", e.target.value)}
                    className="form-textarea" rows="3" placeholder="Describe cualquier observacion especifica sobre el servicio a realizar..."
                    disabled={!datosCompletos || servicioGuardado} />
                </div>
              </div>

              {datosCompletos && !servicioGuardado && (
                <div className="section-actions">
                  <button type="button" onClick={handleGuardarServicio} disabled={guardandoServicio} className="btn-save-service">
                    {guardandoServicio ? (<><div className="spinner"></div> Guardando...</>) : (<><Save size={20} /> Guardar Informacion del Servicio</>)}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RESTO DE SECCIONES (Solo visibles cuando el servicio este guardado) */}
          <div className={`formulario-tecnico ${!servicioGuardado ? "deshabilitado" : ""}`}>
            {!servicioGuardado && (
              <div className="overlay-deshabilitado"><Lock className="overlay-icon" /><p>Guarda primero la informacion del servicio para continuar</p></div>
            )}

            <div className="form-section">
              <div className="section-header"><Settings size={24} /><h2>Datos de Suspension</h2></div>
            </div>

            {/* CAMPOS TECNICOS FF */}
            {tipoSuspension === "FF" && (
              <>
                <div className="form-section">
                  <div className="section-header"><Wrench size={24} /><h2>Datos Tecnicos FF - Horquilla</h2></div>
                  <div className="form-grid-inout">
                    {renderInOutField("Tipo de aceite", "oilType", "text", "5W")}
                    {renderInOutField("Nivel de aceite (mm)", "oilLevel", "number", "120")}
                    {renderInOutField("H.Comp", "hComp", "number", "7.5", "0.1")}
                    {renderInOutField("Compresion", "compressionDamping", "number", "12")}
                    {renderInOutField("Rebote", "reboundDamping", "number", "14")}
                    {renderInOutField("Precarga (mm)", "preload", "number", "5")}
                    {renderInOutField("SAG (mm)", "sag", "number", "30")}
                    {renderInOutField("Gas (bar)", "gas", "number", "10.0", "0.1")}
                    {renderInOutField("Longitud Horquilla (mm)", "forkLength", "number", "650")}
                    {renderInOutField("Recorrido (mm)", "strokeLength", "number", "120")}
                    {renderInOutField("Capacidad Aceite (ml)", "oilCapacity", "number", "450")}
                    {renderInOutField("Longitud Muelle (mm)", "springLength", "number", "200")}
                    {renderInOutField("Ajustador Compresion", "compressionAdjuster", "text", "12 clicks")}
                    {renderInOutField("Ajustador Rebote", "reboundAdjuster", "text", "14 clicks")}
                  </div>
                </div>

                {/* Datos del Muelle Principal FF - Desplegable */}
                <div className="form-section">
                  <div className="section-header collapsible" onClick={() => setMuellePrincipalOpen(!muellePrincipalOpen)}
                    style={{ cursor: "pointer", userSelect: "none" }}>
                    <Settings size={24} /><h2>Datos de Muelle Principal</h2>
                    {muellePrincipalOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                  {muellePrincipalOpen && (
                    <div className="form-grid-inout">
                      {renderInOutField("H.comp (N/mm)", "muellePrincipalSpringRate", "number", "7.5", "0.1")}
                      {renderInOutField("Diametro Interior (mm)", "muellePrincipalDiametroInterior", "number", "35.0", "0.1")}
                      {renderInOutField("Diametro Exterior (mm)", "muellePrincipalDiametroExterior", "number", "45.0", "0.1")}
                      {renderInOutField("Diametro de Spiras (mm)", "muellePrincipalDiametroSpiras", "number", "3.5", "0.1")}
                      {renderInOutField("Largo del Muelle (mm)", "muellePrincipalLargo", "number", "250.0", "0.1")}
                      {renderInOutField("Num Espiras", "muellePrincipalNumEspiras", "number", "10")}
                      {renderInOutField("Tope Fisico (mm)", "muellePrincipalTopeFisico", "number", "5.0", "0.1")}
                    </div>
                  )}
                </div>

                {/* PISTON MAIN - Desplegable */}
                <div className="form-section">
                  <div className="section-header collapsible" onClick={() => setPistonMainOpen(!pistonMainOpen)}
                    style={{ cursor: "pointer", userSelect: "none" }}>
                    <Settings size={24} /><h2>SPEC FF - Piston Main</h2>
                    {pistonMainOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>

                  {pistonMainOpen && (
                    <div>
                      <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                        <label className="form-label">Subtipo</label>
                        <select value={pistonMainSubtipo} onChange={(e) => setPistonMainSubtipo(e.target.value)}
                          className="form-input" disabled={!servicioGuardado}>
                          <option value="">Seleccionar subtipo</option>
                          <option value="compresion-checkvalve">Compresion y Checkvalve</option>
                          <option value="rebote-checkvalve">Rebote y Checkvalve</option>
                        </select>
                      </div>

                      {pistonMainSubtipo && (
                        <>
                          <div className="form-grid" style={{ marginBottom: "1.5rem" }}>
                            <div className="form-group">
                              <label className="form-label">Diametro de Piston (mm)</label>
                              <input type="number" step="0.1" value={formDataLocal.pistonMainDiametroPiston}
                                onChange={(e) => handleInputChange("pistonMainDiametroPiston", e.target.value)}
                                className="form-input" placeholder="25.0" disabled={!servicioGuardado} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Diametro Eje (mm)</label>
                              <input type="number" step="0.1" value={formDataLocal.pistonMainDiametroEje}
                                onChange={(e) => handleInputChange("pistonMainDiametroEje", e.target.value)}
                                className="form-input" placeholder="12.0" disabled={!servicioGuardado} />
                            </div>
                          </div>

                          {/* Seccion Compresion/Rebote */}
                          {renderShimSection(
                            pistonMainSubtipo === "compresion-checkvalve" ? "COMPRESION" : "REBOTE",
                            "#3b82f6",
                            pistonMainSubtipo === "compresion-checkvalve" ? {
                              originalDerecho: "pistonMainCompresionOriginalDerecho",
                              modificadoDerecho: "pistonMainCompresionModificadoDerecho",
                              originalIzquierdo: "pistonMainCompresionOriginalIzquierdo",
                              modificadoIzquierdo: "pistonMainCompresionModificadoIzquierdo",
                            } : {
                              originalDerecho: "pistonMainReboteOriginalDerecho",
                              modificadoDerecho: "pistonMainReboteModificadoDerecho",
                              originalIzquierdo: "pistonMainReboteOriginalIzquierdo",
                              modificadoIzquierdo: "pistonMainReboteModificadoIzquierdo",
                            },
                            pistonMainSubtipo === "compresion-checkvalve" ? pistonMainCompresionExtraRows : pistonMainReboteExtraRows,
                            pistonMainSubtipo === "compresion-checkvalve" ? setPistonMainCompresionExtraRows : setPistonMainReboteExtraRows,
                            pistonMainSubtipo === "compresion-checkvalve" ? "pistonMainCompresionDiametroIntShim" : "pistonMainReboteDiametroIntShim"
                          )}

                          {/* Seccion Checkvalve (solo para compresion-checkvalve) */}
                          {pistonMainSubtipo === "compresion-checkvalve" && renderShimSection(
                            "CHECKVALVE",
                            "#6b7280",
                            {
                              originalDerecho: "pistonMainCheckvalveOriginalDerecho",
                              modificadoDerecho: "pistonMainCheckvalveModificadoDerecho",
                              originalIzquierdo: "pistonMainCheckvalveOriginalIzquierdo",
                              modificadoIzquierdo: "pistonMainCheckvalveModificadoIzquierdo",
                            },
                            pistonMainCheckvalveExtraRows,
                            setPistonMainCheckvalveExtraRows,
                            "pistonMainCheckvalveDiametroIntShim"
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* PISTON COMPRESION - Desplegable (FIX: era showSpecFFPistonCompresion, ahora pistonCompresionOpen) */}
                <div className="form-section">
                  <div className="section-header collapsible" onClick={() => setPistonCompresionOpen(!pistonCompresionOpen)}
                    style={{ cursor: "pointer", userSelect: "none" }}>
                    <Settings size={24} /><h2>SPEC FF - Piston Compresion</h2>
                    {pistonCompresionOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>

                  {pistonCompresionOpen && (
                    <div>
                      <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                        <label className="form-label">Subtipo:</label>
                        <select value={pistonCompresionSubtipo} onChange={(e) => setPistonCompresionSubtipo(e.target.value)}
                          className="form-input" disabled={!servicioGuardado}>
                          <option value="compresion-checkvalve">Compresion y Checkvalve</option>
                        </select>
                      </div>

                      <div className="form-grid" style={{ marginBottom: "1.5rem" }}>
                        <div className="form-group">
                          <label className="form-label">Diametro Piston:</label>
                          <input type="text" value={formDataLocal.pistonCompresionDiametroPiston || ""}
                            onChange={(e) => handleInputChange("pistonCompresionDiametroPiston", e.target.value)}
                            className="form-input" disabled={!servicioGuardado} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Diametro Eje:</label>
                          <input type="text" value={formDataLocal.pistonCompresionDiametroEje || ""}
                            onChange={(e) => handleInputChange("pistonCompresionDiametroEje", e.target.value)}
                            className="form-input" disabled={!servicioGuardado} />
                        </div>
                      </div>

                      {/* Seccion Compresion */}
                      {renderShimSection(
                        "COMPRESION",
                        "#3b82f6",
                        {
                          originalDerecho: "pistonCompresionCompresionOriginalDerecho",
                          modificadoDerecho: "pistonCompresionCompresionModificadoDerecho",
                          originalIzquierdo: "pistonCompresionCompresionOriginalIzquierdo",
                          modificadoIzquierdo: "pistonCompresionCompresionModificadoIzquierdo",
                        },
                        pistonCompresionCompresionExtraRows,
                        setPistonCompresionCompresionExtraRows,
                        "pistonCompresionCompresionDiametroIntShim"
                      )}

                      {/* Seccion Checkvalve */}
                      {renderShimSection(
                        "CHECKVALVE",
                        "#6b7280",
                        {
                          originalDerecho: "pistonCompresionCheckvalveOriginalDerecho",
                          modificadoDerecho: "pistonCompresionCheckvalveModificadoDerecho",
                          originalIzquierdo: "pistonCompresionCheckvalveOriginalIzquierdo",
                          modificadoIzquierdo: "pistonCompresionCheckvalveModificadoIzquierdo",
                        },
                        pistonCompresionCheckvalveExtraRows,
                        setPistonCompresionCheckvalveExtraRows,
                        "pistonCompresionCheckvalveDiametroIntShim"
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* BOTONES DE ACCION FINALES */}
            <div className="form-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-cancel">Cancelar</button>
              <button type="submit" disabled={saving || !servicioGuardado} className="btn-save">
                {saving ? (<><div className="spinner"></div> Guardando...</>) : (<><Save size={20} /> Finalizar y Guardar Datos Tecnicos {tipoSuspension}</>)}
              </button>
            </div>
          </div>
        </form>
      <NotificationModal
        isOpen={notif.open}
        type={notif.type}
        message={notif.message}
        onClose={() => setNotif((prev) => ({ ...prev, open: false }))}
      />
      </div>
    );
  }
);

export default FormTechnicalDataWithClientData;
