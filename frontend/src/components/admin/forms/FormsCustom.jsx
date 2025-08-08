function FormCustom({ handleChangeClientes, clientData }) {
  return (
    <>
      <div className="app-containerform">
        <form className="addForm">
          <h2 className="header-title">Datos del cliente </h2>
          <fieldset className="addForm__group">
            <legend className="input-label">Cliente</legend>
            <input
              className="input-field"
              type="text"
              name="cliente"
              id="cliente"
              placeholder="Juan Martinez Perez"
              value={clientData.cliente} // ← CONECTA con el estado
              onChange={handleChangeClientes} // ← CONECTA con la función
            />

            <legend className="input-label">Email</legend>
            <input
              className="input-field"
              type="email"
              name="email"
              id="email"
              placeholder="ej@gmail.com"
              value={clientData.email} // ← CONECTA con el estado
              onChange={handleChangeClientes} // ← CONECTA con la función
            />
            <legend className="input-label">Teléfono</legend>
            <input
              className="input-field"
              type="text"
              name="telefono"
              id="telefono"
              placeholder="659887788"
              value={clientData.telefono} // ← CONECTA con el estado
              onChange={handleChangeClientes} // ← CONECTA con la función
            />

            <legend className="input-label">Dirección</legend>
            <input
              className="input-field"
              type="text"
              name="direccion"
              id="direccion"
              placeholder="C/Exito "
              value={clientData.direccion} // ← CONECTA con el estado
              onChange={handleChangeClientes} // ← CONECTA con la función
            />

            <legend className="input-label">Código postal</legend>
            <input
              className="input-field"
              type="text"
              name="codigopostal"
              id="codigoposta"
              placeholder="28001"
              value={clientData.codigopostal} // ← CONECTA con el estado
              onChange={handleChangeClientes} // ← CONECTA con la función
            />
            <legend className="input-label">Población </legend>
            <input
              className="input-field"
              type="text"
              name="poblacion"
              placeholder="Cádiz"
              value={clientData.poblacion} // ← CONECTA con el estado
              onChange={handleChangeClientes} // ← CONECTA con la función
            />
            <legend className="input-label">Provincia</legend>
            <input
              className="input-field"
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
      </div>
    </>
  );
}

export default FormCustom;
