function MotoForm({ motoData, handleChangeMotos }) {
  return (
    <>
      <div className="app-containerform">
        <form className="addForm">
          <h2 className="header-title">Datos de la moto</h2>
          <fieldset className="addForm__group">
            <legend className="input-label">Marca</legend>
            <input
              className="input-field"
              type="text"
              name="marca"
              id="marca"
              placeholder="Honda"
              value={motoData.marca}
              onChange={handleChangeMotos}
            />

            <legend className="input-label">Modelo</legend>
            <input
              className="input-field"
              type="text"
              name="modelo"
              id="modelo"
              placeholder="CBR 600"
              value={motoData.modelo}
              onChange={handleChangeMotos}
            />

            <legend className="input-label">Año de fabricación</legend>
            <input
              className="input-field"
              type="number"
              name="año"
              id="año"
              placeholder="2023"
              value={motoData.año}
              onChange={handleChangeMotos}
            />
            <legend className="input-label">Matrícula</legend>
            <input
              className="input-field"
              type="text"
              name="matricula"
              id="matricula"
              placeholder="1234ABC"
              value={motoData.Mmatricula}
              onChange={handleChangeMotos}
            />
            <button className="Newcustom">Guardar datos</button>
          </fieldset>
        </form>
      </div>
    </>
  );
}

export default MotoForm;
