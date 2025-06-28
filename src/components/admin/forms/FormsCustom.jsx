function FormCustom({ handleChangeClientes, clientData }) {
  return (
    <>
      <form className="addForm">
        <h2 className="title">Datos del cliente </h2>
        <fieldset className="addForm__group">
          <legend className="addForm__title">Cliente</legend>
          <input
            className="addForm__input"
            type="text"
            name="cliente"
            id="cliente"
            placeholder="Juan Martinez Perez"
            value={clientData.cliente} // ← CONECTA con el estado
            onChange={handleChangeClientes} // ← CONECTA con la función
          />

          <legend className="addForm__title">Email</legend>
          <input
            className="addForm__input"
            type="email"
            name="email"
            id="email"
            placeholder="ej@gmail.com"
            value={clientData.email} // ← CONECTA con el estado
            onChange={handleChangeClientes} // ← CONECTA con la función
          />
          <legend className="addForm__title">Teléfono</legend>
          <input
            className="addForm__input"
            type="text"
            name="telefono"
            id="telefono"
            placeholder="659887788"
            value={clientData.telefono} // ← CONECTA con el estado
            onChange={handleChangeClientes} // ← CONECTA con la función
          />

          <legend className="addForm__title">Dirección</legend>
          <input
            className="addForm__input"
            type="text"
            name="direccion"
            id="direccion"
            placeholder="C/Exito "
            value={clientData.direccion} // ← CONECTA con el estado
            onChange={handleChangeClientes} // ← CONECTA con la función
          />

          <legend className="addForm__title">Código postal</legend>
          <input
            className="addForm__input"
            type="text"
            name="codigopostal"
            id="codigoposta"
            placeholder="28001"
            value={clientData.codigopostal} // ← CONECTA con el estado
            onChange={handleChangeClientes} // ← CONECTA con la función
          />
          <legend className="addForm__title">Población </legend>
          <input
            className="addForm__input"
            type="text"
            name="poblacion"
            placeholder="Cádiz"
            value={clientData.poblacion} // ← CONECTA con el estado
            onChange={handleChangeClientes} // ← CONECTA con la función
          />
          <legend className="addForm__title">Provincia</legend>
          <input
            className="addForm__input"
            type="text"
            name="provincia"
            id="provincia"
            placeholder="Cádiz"
            value={clientData.provincia} // ← CONECTA con el estado
            onChange={handleChangeClientes} // ← CONECTA con la función
          />

          <button className="Newcustom">Guardar Cliente</button>
        </fieldset>
      </form>
    </>
  );
}

export default FormCustom;
