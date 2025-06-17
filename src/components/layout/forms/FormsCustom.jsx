function FormCustom() {
  return (
    <>
      <form className="addForm">
        <h2 className="title">Datos de la motocicleta</h2>
        <fieldset className="addForm__group">
          <legend className="addForm__title">Marca</legend>
          <input
            className="addForm__input"
            type="text"
            name="marca"
            id="marca"
            placeholder="Honda"
            value=""
          />

          <legend className="addForm__title">Modelo</legend>
          <input
            className="addForm__input"
            type="text"
            name="Modelo"
            id="Modelo"
            placeholder="CBR600RR"
            value=""
          />
          <legend className="addForm__title">Año de fabricación</legend>
          <input
            className="addForm__input"
            type="number"
            name="Año de fabricación"
            id="Año de fabricación"
            placeholder="2015"
            value=""
          />

          <legend className="addForm__title">Matrícula</legend>
          <input
            className="addForm__input"
            type="Number"
            name="Matrícula"
            id="Matrícula"
            placeholder="1234ABC"
            value=""
          />

          <legend className="addForm__title">Cliente</legend>
          <input
            className="addForm__input"
            type="text"
            name="cliente"
            id="cliente"
            placeholder="Manuel Lopez Perez"
            value=""
          />
          <legend className="addForm__title">Email </legend>
          <input
            className="addForm__input"
            type="text"
            name="Email"
            id="Email"
            placeholder="Juanlp@gmail.es"
            value=""
          />
          <legend className="addForm__title">Teléfono</legend>
          <input
            className="addForm__input"
            type="Number"
            name="Telefono"
            id="Telefono"
            placeholder="622222222"
            value=""
          />
          <legend className="addForm__title">Dirección</legend>
          <input
            className="addForm__input"
            type="Text"
            name="Direccion"
            id="Direccion"
            placeholder="C/Primavera 11 4ºb"
            value=""
          />
          <legend className="addForm__title">Código Postal</legend>
          <input
            className="addForm__input"
            type="Number"
            name="Codigopostal"
            id="Codigopostal"
            placeholder="28001"
            value=""
          />
          <legend className="addForm__title">Población</legend>
          <input
            className="addForm__input"
            type="text"
            name="Población"
            id="Población"
            placeholder="Alcala de Henares"
            value=""
          />

          <legend className="addForm__title">Provincia</legend>
          <input
            className="addForm__input"
            type="text"
            name="provincia"
            id="provincia"
            placeholder="Madrid"
            value=""
          />
        </fieldset>

        <fieldset className="addForm__group--upload">
          <GetAvatar
            updateAvatar={props.updatePhoto}
            text="Subir foto del proyecto"
          />
          <GetAvatar
            updateAvatar={props.updateImage}
            text="Subir foto de la autora"
          />

          {/*<label className="button">
            Subir foto del proyecto
            <input className="addForm__hidden" type="file" />
          </label>
          <label className="button">
            Subir foto de la autora
            <input className="addForm__hidden" type="file" />
          </label>*/}
          <button className="button--large">Guardar Cliente</button>
        </fieldset>
      </form>
    </>
  );
}

export default FormCustom;
