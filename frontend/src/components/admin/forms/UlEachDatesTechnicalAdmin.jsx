function UlEachDatesTechnicalAdmin({ datetechnicalArray, motoId }) {
  // Filtrar los datos técnicos por el motoId proporcionado
  const bikeDatesTechnical = datetechnicalArray.filter(
    (datetechnical) => datetechnical.clienteId === parseInt(motoId)
  );

  if (bikeDatesTechnical.length === 0) {
    return <div>No se encontraron datos técnicos para esta motocicleta</div>;
  }

  return (
    <>
      {bikeDatesTechnical.map((datesTechnical) => (
        <div key={datesTechnical.id}>
          <section className="body-list-client">
            <section className="subsection">
              <h3 className="subtitles">INFORMACIÓN </h3>
              <ul className="Sublists">
                <li>
                  <p className="sizeli">
                    Número de orden: {datesTechnical.numeroOrden}
                  </p>
                  <p className="sizeli">
                    Km de la motocicleta: {datesTechnical.kmmoto}
                  </p>
                  <p className="sizeli">
                    Fecha próxima mantenimiento:{" "}
                    {datesTechnical.fechaProximoMantenimiento}
                  </p>
                  <p className="sizeli">
                    Servicio de la suspensión:{" "}
                    {datesTechnical.servicioSuspension}
                  </p>
                  <p className="sizeli">
                    Disciplina piloto: {datesTechnical.disciplina}
                  </p>
                  <p className="sizeli">
                    Peso piloto: {datesTechnical.pesoPiloto}kg
                  </p>
                </li>
              </ul>
            </section>

            <section className="subsection">
              <h3 className="subtitles">SUSPENSION</h3>
              <ul className="Sublists">
                <li>
                  <p className="sizeli">Marca: {datesTechnical.marca}</p>
                  <p className="sizeli">Modelo: {datesTechnical.modelo}</p>
                  <p className="sizeli">Año: {datesTechnical.ano}</p>
                  <p className="sizeli">Referencia: {datesTechnical.ref}</p>
                </li>
              </ul>
            </section>

            <section className="subsection">
              <h4 className="subtitles">OBSERVACIONES:</h4>
              <ul>
                <li>
                  <p className="sizeli">{datesTechnical.observaciones}</p>
                </li>
              </ul>
            </section>

            <h1 className="title-Shock">DATOS TÉCNICOS</h1>

            <section className="subsection">
              <h3 className="subtitles">SETTING </h3>
              <ul className="Sublists">
                <li>
                  <p className="sizeli">
                    Spring: {datesTechnical.spring.mainRate} N/mm
                  </p>
                  <p className="sizeli">
                    Spring Ref: {datesTechnical.spring.springRef}
                  </p>
                  <p className="sizeli">Oil: {datesTechnical.oil}</p>
                  <p className="sizeli">Gas: {datesTechnical.gas}</p>
                  <p className="sizeli">
                    Compresión Original: {datesTechnical.compresion.original}
                  </p>
                  <p className="sizeli">
                    Compresión Modificada:{" "}
                    {datesTechnical.compresion.modification}
                  </p>
                  <p className="sizeli">
                    Rebound Spring: {datesTechnical.spring.rebSpring}
                  </p>
                  <p className="sizeli">
                    Stroke: {datesTechnical.spring.stroke}mm
                  </p>
                  <p className="sizeli">
                    Height: {datesTechnical.spring.height}mm
                  </p>
                </li>
              </ul>
            </section>

            <section className="subsection">
              <h3 className="subtitles">DATOS DEL MUELLE</h3>
              <ul className="Sublists">
                <li>
                  <p className="sizeli">
                    Longitud: {datesTechnical.spring.lenght}mm
                  </p>
                  <p className="sizeli">
                    Número de espiras: {datesTechnical.spring.numeroSpiras}
                  </p>
                  <p className="sizeli">
                    Diámetro exterior: {datesTechnical.spring.outer}mm
                  </p>
                  <p className="sizeli">
                    Diámetro interior: {datesTechnical.spring.inner}mm
                  </p>
                  <p className="sizeli">
                    Espira: {datesTechnical.spring.spire}mm
                  </p>
                  <p className="sizeli">
                    Longitud total: {datesTechnical.spring.totalLenght}mm
                  </p>
                  <p className="sizeli">Eje: {datesTechnical.spring.shaft}mm</p>
                  <p className="sizeli">
                    Pistón: {datesTechnical.spring.piston}mm
                  </p>
                  <p className="sizeli">
                    Separador interno: {datesTechnical.spring.internalSpacer}mm
                  </p>
                  <p className="sizeli">
                    Stroke to bump rubber:{" "}
                    {datesTechnical.spring.strokeToBumpRubber}mm
                  </p>
                  <p className="sizeli">Rod: {datesTechnical.spring.rod}mm</p>
                  <p className="sizeli">
                    Extremo de varilla: {datesTechnical.spring.headRodEnd}
                  </p>
                  <p className="sizeli">
                    Montaje superior: {datesTechnical.spring.upperMount}
                  </p>
                  <p className="sizeli">
                    Montaje inferior: {datesTechnical.spring.lowerMount}
                  </p>
                </li>
              </ul>
            </section>

            <section className="subsection">
              <h3 className="subtitles">AJUSTES DE REBOUND</h3>
              <ul className="Sublists">
                <li>
                  <p className="sizeli">
                    Rebound Original:{" "}
                    {datesTechnical.rebound.original.join(", ")}
                  </p>
                  <p className="sizeli">
                    Rebound Modificado:{" "}
                    {datesTechnical.rebound.modification.join(", ")}
                  </p>
                </li>
              </ul>
            </section>

            <section className="subsection">
              <h3 className="subtitles">AJUSTES DE COMPRESIÓN</h3>
              <ul className="Sublists">
                <li>
                  <p className="sizeli">
                    Ajustador Original:{" "}
                    {datesTechnical.originalCompressionAdjuster.join(", ")}
                  </p>
                  <p className="sizeli">
                    Ajustador Modificado:{" "}
                    {datesTechnical.modifiedCompressionAdjuster.join(", ")}
                  </p>
                </li>
              </ul>
            </section>
          </section>
        </div>
      ))}
    </>
  );
}
export default UlEachDatesTechnicalAdmin;
