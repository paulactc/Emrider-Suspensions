import React, { useState, useEffect } from "react";
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
  motocicletas = [],
  onComplete,
  onSkip,
  esConfirmacion = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [clienteData, setClienteData] = useState({
    peso: cliente?.peso || "",
    nivelPilotaje: cliente?.nivelPilotaje || "",
  });
  const [selectedMoto, setSelectedMoto] = useState(null);
  const [motosData, setMotosData] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);

  // Inicializar datos de motos
  useEffect(() => {
    const initialMotosData = {};
    motocicletas.forEach((moto) => {
      initialMotosData[moto.id] = {
        especialidad: moto.especialidad || "",
        tipoConduccion: moto.tipoConduccion || "",
        preferenciaRigidez: moto.preferenciaRigidez || "",
      };
    });
    setMotosData(initialMotosData);
  }, [motocicletas]);

  // Definir pasos del cuestionario
  const steps = [
    // Paso 0: Información del cliente - Peso
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
    // Paso 1: Información del cliente - Nivel de pilotaje
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

  // Si hay múltiples motos, agregar paso de selección
  if (motocicletas.length > 1) {
    steps.push({
      id: "seleccionar-moto",
      type: "selection",
      title: "Selecciona tu motocicleta",
      subtitle: "Configuraremos una moto a la vez",
      icon: Bike,
      question: "¿Para qué motocicleta quieres configurar los ajustes?",
      field: "selectedMoto",
      inputType: "moto-select",
      motos: motocicletas,
    });
  }

  // Agregar pasos para cada motocicleta
  motocicletas.forEach((moto, index) => {
    // Solo agregar si es moto única o si hay selección múltiple
    const motoPrefix = motocicletas.length > 1 ? `Moto seleccionada: ` : "";

    // Especialidad
    steps.push({
      id: `moto-${moto.id}-especialidad`,
      type: "moto",
      motoId: moto.id,
      motoIndex: index,
      title: `${motoPrefix}${moto.marca} ${moto.modelo}`,
      subtitle: `Configuremos tu ${moto.marca} ${moto.modelo} (${moto.matricula})`,
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

  const currentStepData = steps[currentStep];
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  const getCurrentValue = () => {
    if (currentStepData.type === "cliente") {
      return clienteData[currentStepData.field] || "";
    } else {
      return motosData[currentStepData.motoId]?.[currentStepData.field] || "";
    }
  };

  const updateValue = (value) => {
    if (currentStepData.type === "cliente") {
      setClienteData((prev) => ({
        ...prev,
        [currentStepData.field]: value,
      }));
    } else {
      setMotosData((prev) => ({
        ...prev,
        [currentStepData.motoId]: {
          ...prev[currentStepData.motoId],
          [currentStepData.field]: value,
        },
      }));
    }
  };

  const validateCurrentStep = () => {
    const value = getCurrentValue();
    if (!value) return "Este campo es obligatorio";
    if (currentStepData.validation) {
      return currentStepData.validation(value);
    }
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

    // Preparar datos para enviar
    const dataToSend = {
      cliente: {
        id: cliente.id,
        ...clienteData,
      },
      motocicletas: Object.keys(motosData).map((motoId) => ({
        id: parseInt(motoId),
        ...motosData[motoId],
      })),
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
            Paso {currentStep + 1} de {totalSteps}
          </span>
          {esConfirmacion && (
            <span className="confirmation-badge">Confirmación anual</span>
          )}
        </div>
      </div>

      <div className="questionnaire-content">
        <div className="step-header">
          <div className="step-icon">
            <currentStepData.icon size={32} />
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
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="btn-secondary"
            >
              <ChevronLeft size={20} />
              Anterior
            </button>
          )}

          {!esConfirmacion && (
            <button onClick={onSkip} className="btn-skip">
              <SkipForward size={20} />
              Omitir por ahora
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
                <Save size={20} />
                {esConfirmacion ? "Confirmar datos" : "Finalizar"}
              </>
            ) : (
              <>
                Continuar
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteQuestionario;
