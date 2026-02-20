import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Bike,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Weight,
  Target,
  Navigation,
  Mountain,
  Settings,
  Save,
  SkipForward,
} from "lucide-react";

const ClienteQuestionario = ({
  cliente,
  motos: motosProp, // ← nombre que envía el padre
  motocicletas = [], // ← compat. por si aún llega con este nombre
  onComplete,
  onSkip,
  esConfirmacion = false,
  mode = "all", // 'all' | 'cliente-only' | 'moto-only'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [clienteData, setClienteData] = useState({
    peso: cliente?.peso || "",
    nivelPilotaje: cliente?.nivelPilotaje || "",
  });
  const [selectedMoto, setSelectedMoto] = useState(null);
  const [motosData, setMotosData] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);

  // ✅ array de motos con referencia estable (usa la que venga)
  const motos = useMemo(
    () => motosProp ?? motocicletas ?? [],
    [motosProp, motocicletas]
  );

  // ✅ inicializar datos de motos (sin bucles)
  useEffect(() => {
    const initial = {};
    motos.forEach((m) => {
      initial[m.id] = {
        especialidad: m.especialidad || "",
        tipoConduccion: m.tipoConduccion || "",
        preferenciaRigidez: m.preferenciaRigidez || "",
      };
    });
    setMotosData((prev) =>
      JSON.stringify(prev) === JSON.stringify(initial) ? prev : initial
    );
  }, [motos]);

  // ✅ seleccionar primera moto por defecto (solo una vez)
  useEffect(() => {
    if (selectedMoto == null && motos.length > 0) {
      setSelectedMoto(motos[0].id);
    }
  }, [motos, selectedMoto]);

  // -------- Pasos --------
  const steps = [
    // Paso 0
    {
      id: "cliente-peso",
      type: "cliente",
      title: "Tu información física",
      subtitle:
        "Necesitamos conocer tu peso para ajustar perfectamente tu suspensión",
      icon: Weight,
      question: "¿Cuál es tu peso sin equipación?",
      field: "peso",
      inputType: "number",
      suffix: "kg",
      placeholder: "Ej: 75",
      validation: (value) => {
        const num = parseFloat(value);
        return num >= 40 && num <= 200
          ? null
          : "El peso debe estar entre 40 y 200 kg";
      },
    },
    // Paso 1
    {
      id: "cliente-nivel",
      type: "cliente",
      title: "Tu experiencia de pilotaje",
      subtitle: "Esto nos ayuda a configurar la suspensión según tu estilo",
      icon: Target,
      question: "¿Cuál es tu nivel de pilotaje?",
      field: "nivelPilotaje",
      inputType: "select",
      options: [
        {
          value: "principiante",
          label: "Principiante",
          desc: "Empezando en el mundo de las motos",
        },
        {
          value: "novato",
          label: "Novato",
          desc: "Algo de experiencia, pero aún aprendiendo",
        },
        {
          value: "intermedio",
          label: "Intermedio",
          desc: "Experiencia sólida, piloto confiado",
        },
        {
          value: "experto",
          label: "Experto",
          desc: "Mucha experiencia, domino técnicas avanzadas",
        },
        {
          value: "profesional",
          label: "Profesional",
          desc: "Piloto profesional o competidor",
        },
      ],
    },
  ];

  // Paso de selección de moto si hay varias
  if (motos.length > 1) {
    steps.push({
      id: "seleccionar-moto",
      type: "selection",
      title: "Selecciona tu motocicleta",
      subtitle: "Configuraremos una moto a la vez",
      icon: Bike,
      question: "¿Para qué motocicleta quieres configurar los ajustes?",
      field: "selectedMoto",
      inputType: "moto-select",
    });
  }

  // Solo añadimos pasos de la moto seleccionada (o la única)
  const motosToAsk =
    motos.length > 1 && selectedMoto
      ? motos.filter((m) => m.id === selectedMoto)
      : motos;

  motosToAsk.forEach((moto, index) => {
    const motoPrefix = motos.length > 1 ? `Moto seleccionada: ` : "";

    // Especialidad
    steps.push({
      id: `moto-${moto.id}-especialidad`,
      type: "moto",
      motoId: moto.id,
      motoIndex: index,
      title: `${motoPrefix}${moto.marca} ${moto.modelo}`,
      subtitle: `Configuremos tu ${moto.marca} ${moto.modelo} (${
        moto.matricula || ""
      })`,
      icon: Bike,
      question: "¿Para qué tipo de terreno usas principalmente esta moto?",
      field: "especialidad",
      inputType: "select",
      options: [
        {
          value: "onroad",
          label: "On Road (Carretera)",
          desc: "Principalmente asfalto y carreteras",
          icon: Navigation,
        },
        {
          value: "offroad",
          label: "Off Road (Campo)",
          desc: "Principalmente tierra y senderos",
          icon: Mountain,
        },
      ],
    });

    // Tipo de conducción
    steps.push({
      id: `moto-${moto.id}-conduccion`,
      type: "moto",
      motoId: moto.id,
      motoIndex: index,
      title: `${motoPrefix}${moto.marca} ${moto.modelo}`,
      subtitle: `Tipo de conducción - ${moto.marca} ${moto.modelo}`,
      icon: Settings,
      question: "¿Dónde conduces principalmente esta moto?",
      field: "tipoConduccion",
      inputType: "select",
      options: [
        {
          value: "calle",
          label: "Calle",
          desc: "Conducción urbana y interurbana",
        },
        {
          value: "circuito-asfalto",
          label: "Circuito Asfalto",
          desc: "Pista de carreras asfaltada",
        },
        {
          value: "circuito-tierra",
          label: "Circuito Tierra",
          desc: "Pista de tierra o motocross",
        },
      ],
    });

    // Preferencia de rigidez
    steps.push({
      id: `moto-${moto.id}-rigidez`,
      type: "moto",
      motoId: moto.id,
      motoIndex: index,
      title: `${motoPrefix}${moto.marca} ${moto.modelo}`,
      subtitle: `Preferencias de suspensión - ${moto.marca} ${moto.modelo}`,
      icon: Settings,
      question: "¿Qué prefieres en tu suspensión?",
      field: "preferenciaRigidez",
      inputType: "select",
      options: [
        {
          value: "blando",
          label: "Más Blando",
          desc: "Mayor comodidad, absorbe mejor las irregularidades",
        },
        {
          value: "duro",
          label: "Más Duro",
          desc: "Mayor precisión, mejor respuesta deportiva",
        },
      ],
    });
  });

  // Filtrar pasos según el modo
  const activeSteps =
    mode === "moto-only"
      ? steps.filter((s) => s.type !== "cliente")
      : mode === "cliente-only"
      ? steps.filter((s) => s.type === "cliente")
      : steps;

  const totalSteps = activeSteps.length;
  const currentStepData = activeSteps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  const getCurrentValue = () => {
    if (currentStepData.type === "cliente") {
      return clienteData[currentStepData.field] || "";
    }
    if (
      currentStepData.inputType === "moto-select" ||
      currentStepData.type === "selection"
    ) {
      return selectedMoto || "";
    }
    return motosData[currentStepData.motoId]?.[currentStepData.field] || "";
  };

  const updateValue = (value) => {
    if (currentStepData.type === "cliente") {
      setClienteData((prev) => ({ ...prev, [currentStepData.field]: value }));
      return;
    }
    if (
      currentStepData.inputType === "moto-select" ||
      currentStepData.type === "selection"
    ) {
      setSelectedMoto(value);
      return;
    }
    setMotosData((prev) => ({
      ...prev,
      [currentStepData.motoId]: {
        ...prev[currentStepData.motoId],
        [currentStepData.field]: value,
      },
    }));
  };

  const validateCurrentStep = () => {
    const value = getCurrentValue();
    if (!value) {
      return currentStepData.inputType === "moto-select"
        ? "Selecciona una motocicleta"
        : "Este campo es obligatorio";
    }
    if (currentStepData.validation) return currentStepData.validation(value);
    return null;
  };

  const handleNext = () => {
    const error = validateCurrentStep();
    if (error) return;

    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    const dataToSend = {
      cliente: { id: cliente.id, ...clienteData },
      motocicletas:
        mode !== "cliente-only"
          ? Object.keys(motosData).map((motoId) => ({
              id: isNaN(Number(motoId)) ? motoId : Number(motoId),
              ...motosData[motoId],
            }))
          : [],
      skipClientSave: mode === "moto-only",
    };
    try {
      await onComplete(dataToSend);
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const renderInput = () => {
    const value = getCurrentValue();
    const error = validateCurrentStep();

    if (currentStepData.inputType === "number") {
      return (
        <div className="input-group">
          <div className="number-input-wrapper">
            <input
              type="number"
              value={value}
              onChange={(e) => updateValue(e.target.value)}
              placeholder={currentStepData.placeholder}
              className={`number-input ${error ? "error" : ""}`}
              min="40"
              max="200"
            />
            <span className="input-suffix">{currentStepData.suffix}</span>
          </div>
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      );
    }

    if (currentStepData.inputType === "select") {
      return (
        <div className="options-grid">
          {currentStepData.options.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => updateValue(option.value)}
                className={`option-card ${
                  value === option.value ? "selected" : ""
                }`}
              >
                <div className="option-header">
                  {IconComponent && <IconComponent size={24} />}
                  <h4>{option.label}</h4>
                </div>
                <p>{option.desc}</p>
                {value === option.value && (
                  <div className="selected-indicator">
                    <Check size={20} />
                  </div>
                )}
              </button>
            );
          })}
          {error && (
            <div className="error-message full-width">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      );
    }

    if (currentStepData.inputType === "moto-select") {
      return (
        <div className="options-grid">
          {motos.map((m) => (
            <button
              key={m.id}
              onClick={() => updateValue(m.id)}
              className={`option-card ${
                selectedMoto === m.id ? "selected" : ""
              }`}
            >
              <div className="option-header">
                <Bike size={24} />
                <h4>
                  {m.marca} {m.modelo}
                </h4>
              </div>
              <p>{m.matricula || m.bastidor || "Sin matrícula"}</p>
              {selectedMoto === m.id && (
                <div className="selected-indicator">
                  <Check size={20} />
                </div>
              )}
            </button>
          ))}
          {error && (
            <div className="error-message full-width">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-header">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="step-info">
          <span>
            {" "}
            Paso {currentStep + 1} de {totalSteps}{" "}
          </span>
          {esConfirmacion && (
            <span className="confirmation-badge">Confirmación anual</span>
          )}
        </div>
      </div>

      <div className="questionnaire-content">
        <div className="step-header">
          <div className="step-icon">
            {(() => {
              const StepIcon = currentStepData.icon;
              return <StepIcon size={32} />;
            })()}
          </div>
          <div className="step-text">
            <h2>{currentStepData.title}</h2>
            <p>{currentStepData.subtitle}</p>
          </div>
        </div>

        <div className="question-section">
          <h3>{currentStepData.question}</h3>
          {renderInput()}
        </div>
      </div>

      <div className="questionnaire-footer">
        <div className="button-group">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((p) => p - 1)}
              className="btn-secondary"
            >
              <ChevronLeft size={20} /> Anterior
            </button>
          )}

          {!esConfirmacion && (
            <button onClick={onSkip} className="btn-skip">
              <SkipForward size={20} /> Omitir por ahora
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!!validateCurrentStep() || isCompleting}
            className="btn-primary"
          >
            {isCompleting ? (
              "Guardando..."
            ) : isLastStep ? (
              <>
                <Save size={20} />{" "}
                {esConfirmacion ? "Confirmar datos" : "Finalizar"}
              </>
            ) : (
              <>
                Continuar <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteQuestionario;
