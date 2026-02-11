// UlEachDatesTechnical.js
import {
  FileText,
  Gauge,
  Calendar,
  Wrench,
  Target,
  Settings,
  Info,
  Zap,
  MessageSquare,
  Cog,
  AlertTriangle,
} from "lucide-react";

function UlEachDatesTechnical({ datetechnicalArray, motoId, onFichaCaducada }) {
  const bikeDatesTechnical = datetechnicalArray.filter(
    (datetechnical) => String(datetechnical.clienteId) === String(motoId)
  );

  if (bikeDatesTechnical.length === 0) {
    return (
      <div className="tech-data-container">
        <div className="no-data-message">
          No se encontraron datos técnicos para esta motocicleta
        </div>
      </div>
    );
  }

  const fechaActual = new Date();

  // Ordenar por fecha de creación descendente
  const ordenadas = [...bikeDatesTechnical].sort((a, b) => {
    const fechaA = new Date(a.fechaCreacion);
    const fechaB = new Date(b.fechaCreacion);
    return fechaB - fechaA;
  });

  // Verificar si la más reciente está vigente
  const fichaMasReciente = ordenadas[0];
  const fechaCreacion = new Date(fichaMasReciente.fechaCreacion);
  const esOffroad = fichaMasReciente.disciplina?.toLowerCase() === "offroad";
  const mesesValidos = esOffroad ? 6 : 12;
  const fechaVencimiento = new Date(fechaCreacion);
  fechaVencimiento.setMonth(fechaVencimiento.getMonth() + mesesValidos);

  const estaCaducada = fechaActual > fechaVencimiento;

  // Comunicar al componente padre si la ficha más reciente está caducada
  if (typeof onFichaCaducada === "function") {
    onFichaCaducada(estaCaducada);
  }

  return (
    <div className="tech-data-container">
      {ordenadas.map((datesTechnical) => (
        <div key={datesTechnical.id}>
          <section className="body-list-client">
            <section className="subsection">
              <h3 className="subtitles">
                <Info size={16} /> INFORMACIÓN
              </h3>
              <ul className="Sublists">
                <li>
                  <div className="sizeli">
                    <span className="field-label">
                      <Calendar size={14} /> Fecha del servicio
                    </span>
                    <span className="field-value">
                      {new Date(
                        datesTechnical.fechaCreacion
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      <Gauge size={14} /> Km de la motocicleta:
                    </span>
                    <span className="field-value">{datesTechnical.kmmoto}</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      <Calendar size={14} /> Fecha próximo mantenimiento:
                    </span>
                    <span className="field-value">
                      {datesTechnical.fechaProximoMantenimiento}
                    </span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      <Wrench size={14} /> Servicio de la suspensión:
                    </span>
                    <span className="field-value">
                      {datesTechnical.servicioSuspension}
                    </span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      <Target size={14} /> Disciplina piloto:
                    </span>
                    <span className="field-value">
                      {datesTechnical.disciplina}
                    </span>
                  </div>
                </li>
              </ul>
            </section>

            <section className="subsection">
              <h3 className="subtitles">
                <Settings size={16} /> SUSPENSIÓN
              </h3>
              <ul className="Sublists">
                <li>
                  <div className="sizeli">
                    <span className="field-label">
                      <FileText size={14} /> Marca:
                    </span>
                    <span className="field-value">{datesTechnical.marca}</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      <Settings size={14} /> Modelo:
                    </span>
                    <span className="field-value">{datesTechnical.modelo}</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      <Calendar size={14} /> Año:
                    </span>
                    <span className="field-value">{datesTechnical.ano}</span>
                  </div>
                </li>
              </ul>
            </section>

            <section className="subsection">
              <h4 className="subtitles">
                <MessageSquare size={16} /> OBSERVACIONES
              </h4>
              <ul className="Sublists">
                <li>
                  <div className="sizeli observation-field">
                    <span className="field-value observation-text">
                      {datesTechnical.observaciones}
                    </span>
                  </div>
                </li>
              </ul>
            </section>

            <h1 className="title-Shock">
              <Cog size={32} style={{ marginRight: "1rem" }} />
              DATOS TÉCNICOS
              <Cog size={32} style={{ marginLeft: "1rem" }} />
            </h1>

            <section className="subsection">
              <h3 className="subtitles">
                <Zap size={16} /> SETTING
              </h3>
              <ul className="Sublists">
                <li>
                  <div className="sizeli field-important">
                    <span className="field-label">
                      <Settings size={14} /> Spring:
                    </span>
                    <span className="field-value">16 N/mm</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      <Target size={14} /> Initial:
                    </span>
                    <span className="field-value">45</span>
                  </div>
                  <div className="sizeli field-important">
                    <span className="field-label">
                      <Wrench size={14} /> Oil:
                    </span>
                    <span className="field-value">{datesTechnical.oil}</span>
                  </div>
                  <div className="sizeli field-important">
                    <span className="field-label">
                      <Zap size={14} /> Gas:
                    </span>
                    <span className="field-value">{datesTechnical.gas}</span>
                  </div>
                  <div className="sizeli field-important">
                    <span className="field-label">
                      <Settings size={14} /> Rebound:
                    </span>
                    <span className="field-value">
                      {datesTechnical.reboundSpring}
                    </span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      <Gauge size={14} /> Comp.Low:
                    </span>
                    <span className="field-value">15</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      <Gauge size={14} /> Comp.High:
                    </span>
                    <span className="field-value">25</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      <Settings size={14} /> Rebound spring:
                    </span>
                    <span className="field-value">58 N/mm</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      <Target size={14} /> Stroke:
                    </span>
                    <span className="field-value">63mm</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      <Gauge size={14} /> Height RR:
                    </span>
                    <span className="field-value">
                      {datesTechnical.height}mm
                    </span>
                  </div>
                </li>
              </ul>
            </section>
          </section>
        </div>
      ))}
    </div>
  );
}

export default UlEachDatesTechnical;
