function UlEachDatesTechnical({ datetechnicalArray, motoId }) {
  // ✅ Props correctas

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
                  <p className="sizeli">Spring: 16 N/mm</p>
                  <p className="sizeli">Initial: 45</p>
                  {/*PDTE METER VALOR*/}
                  <p className="sizeli">Oil: {datesTechnical.oil}</p>
                  <p className="sizeli">Gas: {datesTechnical.gas}</p>
                  <p className="sizeli">
                    Rebound: {datesTechnical.reboundSpring}
                  </p>
                  <p className="sizeli">Comp.Low: 15</p>
                  {/*PDTE METER VALOR*/}
                  <p className="sizeli">Comp.High: 25</p>
                  {/*PDTE METER VALOR*/}
                  <p className="sizeli">Rebound spring: 58n/mm</p>{" "}
                  {/*PDTE METER VALOR*/}
                  <p className="sizeli">Stroke: 63mm</p>
                  {/*PDTE METER VALOR*/}
                  <p className="sizeli">Height RR: {datesTechnical.height}mm</p>
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
