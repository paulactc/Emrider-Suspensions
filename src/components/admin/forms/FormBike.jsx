function MotoForm({ motoData, handleChangeMotos }) {
  return (
    <>
      <form className="addForm">
        <h2 className="title">Datos de la moto</h2>
        <fieldset className="addForm__group">
          <legend className="addForm__title">Marca</legend>
          <input
            className="addForm__input"
            type="text"
            name="marca"
            id="marca"
            placeholder="Honda"
            value={motoData.marca}
            onChange={handleChangeMotos}
          />

          <legend className="addForm__title">Modelo</legend>
          <input
            className="addForm__input"
            type="text"
            name="modelo"
            id="modelo"
            placeholder="CBR 600"
            value={motoData.modelo}
            onChange={handleChangeMotos}
          />

          <legend className="addForm__title">Año de fabricación</legend>
          <input
            className="addForm__input"
            type="number"
            name="año"
            id="año"
            placeholder="2023"
            value={motoData.año}
            onChange={handleChangeMotos}
          />
          <legend className="addForm__title">Matrícula</legend>
          <input
            className="addForm__input"
            type="text"
            name="matricula"
            id="matricula"
            placeholder="1234ABC"
            value={motoData.Mmatricula}
            onChange={handleChangeMotos}
          />
        </fieldset>
      </form>
    </>
  );
}

export default MotoForm;
