function UlEachDatesTechnical({ datetechnicalArray, motoId }) {
  // Filtrar los datos técnicos por el motoId proporcionado
  const bikeDatesTechnical = datetechnicalArray.filter(
    (datetechnical) => datetechnical.clienteId === parseInt(motoId)
  );

  if (bikeDatesTechnical.length === 0) {
    return (
      <div className="no-data-message">
        No se encontraron datos técnicos para esta motocicleta
      </div>
    );
  }

  return (
    <>
      {bikeDatesTechnical.map((datesTechnical) => (
        <div key={datesTechnical.id}>
          <section className="body-list-client">
            <section className="subsection">
              <h3 className="subtitles">INFORMACIÓN</h3>
              <ul className="Sublists">
                <li>
                  <div className="sizeli">
                    <span className="field-label">Número de orden:</span>
                    <span className="field-value">
                      {datesTechnical.numeroOrden}
                    </span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">Km de la motocicleta:</span>
                    <span className="field-value">{datesTechnical.kmmoto}</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      Fecha próximo mantenimiento:
                    </span>
                    <span className="field-value">
                      {datesTechnical.fechaProximoMantenimiento}
                    </span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">
                      Servicio de la suspensión:
                    </span>
                    <span className="field-value">
                      {datesTechnical.servicioSuspension}
                    </span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">Disciplina piloto:</span>
                    <span className="field-value">
                      {datesTechnical.disciplina}
                    </span>
                  </div>
                </li>
              </ul>
            </section>

            <section className="subsection">
              <h3 className="subtitles">SUSPENSION</h3>
              <ul className="Sublists">
                <li>
                  <div className="sizeli">
                    <span className="field-label">Marca:</span>
                    <span className="field-value">{datesTechnical.marca}</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">Modelo:</span>
                    <span className="field-value">{datesTechnical.modelo}</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">Año:</span>
                    <span className="field-value">{datesTechnical.ano}</span>
                  </div>
                </li>
              </ul>
            </section>

            <section className="subsection">
              <h4 className="subtitles">OBSERVACIONES</h4>
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

            <h1 className="title-Shock">DATOS TÉCNICOS</h1>

            <section className="subsection">
              <h3 className="subtitles">SETTING</h3>
              <ul className="Sublists">
                <li>
                  <div className="sizeli field-important">
                    <span className="field-label">Spring:</span>
                    <span className="field-value">16 N/mm</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">Initial:</span>
                    <span className="field-value">45</span>
                  </div>
                  <div className="sizeli field-important">
                    <span className="field-label">Oil:</span>
                    <span className="field-value">{datesTechnical.oil}</span>
                  </div>
                  <div className="sizeli field-important">
                    <span className="field-label">Gas:</span>
                    <span className="field-value">{datesTechnical.gas}</span>
                  </div>
                  <div className="sizeli field-important">
                    <span className="field-label">Rebound:</span>
                    <span className="field-value">
                      {datesTechnical.reboundSpring}
                    </span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">Comp.Low:</span>
                    <span className="field-value">15</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">Comp.High:</span>
                    <span className="field-value">25</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">Rebound spring:</span>
                    <span className="field-value">58 N/mm</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">Stroke:</span>
                    <span className="field-value">63mm</span>
                  </div>
                  <div className="sizeli">
                    <span className="field-label">Height RR:</span>
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
    </>
  );
}

export default UlEachDatesTechnical;
