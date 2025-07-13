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
      <section className="subsection">
        <h3 className="subtitles">Mantenimiento de tus suspensiones:</h3>
        <ul className="Sublists">
          <li>
            <p className="sizeli">Km moto: 138.000Km</p>
            <p className="sizeli">Fecha próxima mantenimiento: 15/02/26</p>
          </li>
        </ul>
      </section>

      {bikeDatesTechnical.map((datesTechnical) => (
        <div key={datesTechnical.id}>
          <section className="body-list-client">
            <h1 className="title-Shock">SHOCK SPEC.SHEET</h1>

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
              <h3 className="subtitles">SETTING FINAL-SHOCK</h3>
              <ul className="Sublists">
                <li>
                  <p className="sizeli">Spring: 16 N/mm</p>
                  <p className="sizeli">Spec: 25-00198</p>
                  <p className="sizeli">Initial: 45</p>
                  <p className="sizeli">Oil: {datesTechnical.oil}</p>
                  <p className="sizeli">Gas: {datesTechnical.gas}</p>
                  <p className="sizeli">
                    Rebound: {datesTechnical.reboundSpring}
                  </p>
                  <p className="sizeli">Comp.Low: 15</p>
                  <p className="sizeli">Comp.High: 25</p>
                  <p className="sizeli">Rebound spring: 58n/mm</p>
                  <p className="sizeli">Stroke: 63mm</p>
                  <p className="sizeli">Height RR: 89mm</p>
                </li>
              </ul>
            </section>

            <section className="subsection">
              <h4 className="subtitles">Observaciones:</h4>
              <ul>
                <li>
                  <p className="sizeli">{datesTechnical.observaciones}</p>
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
