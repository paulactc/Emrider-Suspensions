function FormTechnicalDataCustomer({ formData, handleChange }) {
  return (
    <>
      <div className="app-containerform">
        <form className="addForm">
          <h2 className="header-title">Datos del servicio </h2>

          <legend className="input-label">Peso del Piloto "kg"</legend>
          <input
            className="input-field"
            type="text"
            name="pesoPiloto"
            placeholder="68"
            value={formData.pesoPiloto} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />

          <legend className="input-label">Disciplina</legend>
          <input
            className="input-field"
            type="text"
            name="disciplina"
            placeholder="Motocross"
            value={formData.disciplina} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />

          <legend className="input-label">Número de Orden</legend>
          <input
            className="input-field"
            type="text"
            name="numeroOrden"
            placeholder="002"
            value={formData.numeroOrden} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />

          <legend className="input-label">Observaciones</legend>
          <textarea
            className="input-field"
            name="observaciones"
            placeholder="Observaciones a tener en cuenta "
            rows="4"
            value={formData.observaciones} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
        </form>

        <form>
          <h2 className="header-title">Datos Suspensiones </h2>
          <fieldset>
            <legend className="input-label">marca </legend>
            <input
              className="input-field"
              type="text"
              name="marca"
              placeholder="Marca "
              value={formData.marca} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />

            <legend className="input-label">modelo suspension</legend>
            <input
              className="input-field"
              type="text"
              name="modelo"
              placeholder="modelo "
              value={formData.modelo} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">año </legend>
            <input
              className="input-field"
              type="text"
              name="año"
              placeholder="año"
              value={formData.año} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />

            <legend className="input-label">referencia suspension</legend>
            <input
              className="input-field"
              type="text"
              name="referenciasuspension"
              placeholder="referencia suspension"
              value={formData.referenciasuspension} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
          </fieldset>

          <h2 className="header-title">Datos Tecnicos</h2>
          <fieldset>
            <legend className="input-label">Spring Data</legend>

            <legend className="input-label">mainRate</legend>
            <input
              className="input-field"
              type="text"
              name="mainRate"
              placeholder="Main Rate"
              value={formData.mainRate} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />

            <legend className="input-label">springRef</legend>
            <input
              className="input-field"
              type="text"
              name="springRef"
              placeholder="Spring Reference"
              value={formData.springRef} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />

            <legend className="input-label">Length (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="length"
              placeholder="Length (mm)"
              value={formData.length} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Number of Coils</legend>
            <input
              className="input-field"
              type="text"
              name="numeroSpiras"
              placeholder="Number of Coils"
              value={formData.numeroSpiras} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Outer Diameter (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="outer"
              placeholder="Outer Diameter (mm)"
              value={formData.outer} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Inner Diameter (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="inner"
              placeholder="Inner Diameter (mm)"
              value={formData.inner} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Spire (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="spire"
              placeholder="Spire (mm)"
              value={formData.spire} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Rebound Spring</legend>
            <input
              className="input-field"
              type="text"
              name="rebSpring"
              placeholder="Rebound Spring"
              value={formData.rebSpring} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Total Length (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="totalLength"
              placeholder="Total Length (mm)"
              value={formData.totalLength} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Stroke (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="stroke"
              placeholder="Stroke (mm)"
              value={formData.stroke} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Shaft (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="shaft"
              placeholder="Shaft (mm)"
              value={formData.shaft} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Piston (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="piston"
              placeholder="Piston (mm)"
              value={formData.piston} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Internal Spacer (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="internalSpacer"
              placeholder="Internal Spacer (mm)"
              value={formData.internalSpacer} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Height (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="height"
              placeholder="Height (mm)"
              value={formData.height} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Stroke to Bump Rubber (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="strokeToBumpRubber"
              placeholder="Stroke to Bump Rubber (mm)"
              value={formData.strokeToBumpRubber} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Rod (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="rod"
              placeholder="Rod (mm)"
              value={formData.rod} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Rebound Spring Rate</legend>
            <input
              className="input-field"
              type="text"
              name="reboundSpring"
              placeholder="Rebound Spring Rate"
              value={formData.reboundSpring} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Spring Length (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="springLength"
              placeholder="Spring Length (mm)"
              value={formData.springLength} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />

            <legend className="input-label">Spring Upper Diameter (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="springUpperDiameter"
              placeholder="Spring Upper Diameter (mm)"
              value={formData.springUpperDiameter} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />

            <legend className="input-label">Spring Lower Diameter (mm)</legend>
            <input
              className="input-field"
              type="text"
              name="springLowerDiameter"
              placeholder="Spring Lower Diameter (mm)"
              value={formData.springLowerDiameter} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />

            <legend className="input-label">Head Rod End</legend>
            <input
              className="input-field"
              type="text"
              name="headRodEnd"
              placeholder="Head Rod End"
              value={formData.headRodEnd} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Upper Mount</legend>
            <input
              className="input-field"
              type="text"
              name="upperMount"
              placeholder="Upper Mount"
              value={formData.upperMount} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Lower Mount</legend>
            <input
              className="input-field"
              type="text"
              name="lowerMount"
              placeholder="Lower Mount"
              value={formData.lowerMoun} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
          </fieldset>

          <fieldset className="addForm__section">
            <legend className="input-label">Oil & Gas</legend>
            <legend className="input-label">Oil</legend>
            <input
              className="input-field"
              type="text"
              name="oil"
              placeholder="Oil (e.g. Fork Oil 7.5W)"
              value={formData.oil} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
            <legend className="input-label">Gas</legend>
            <input
              className="input-field"
              type="text"
              name="gas"
              placeholder="Gas (e.g. Nitrogen 10 bar)"
              value={formData.gas} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
          </fieldset>

          <fieldset className="addForm__section">
            <legend className="input-label">Compression</legend>
            <legend className="input-label">Original Compression</legend>
            <input
              className="input-field"
              type="text"
              name="compressionOriginal"
              placeholder="Original Compression"
              value={formData.compressionOriginal} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />

            <legend className="input-label">Modified Compression</legend>
            <input
              className="input-field"
              type="text"
              name="compressionModification"
              placeholder="Modified Compression"
              value={formData.compressionModification} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
          </fieldset>

          <fieldset className="addForm__section">
            <legend className="input-label">Rebound</legend>
            <label className="addForm__label" htmlFor="reboundOriginal">
              Original Rebound Values (comma-separated)
            </label>
            <textarea
              className="input-field"
              name="reboundOriginal"
              id="reboundOriginal"
              placeholder="1, 2, 3, ..., 18"
              value={formData.reboundOriginal} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />

            <label className="input-label" htmlFor="reboundModification">
              Modified Rebound Values (comma-separated)
            </label>
            <textarea
              className="input-field"
              name="reboundModification"
              id="reboundModification"
              placeholder="1, 2, 3, ..., 18"
              value={formData.reboundModification} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />
          </fieldset>

          <fieldset className="addForm__section">
            <legend className="input-label">Compression Adjusters</legend>
            <label
              className="input-label"
              htmlFor="originalCompressionAdjuster"
            >
              Original Compression Adjuster (comma-separated)
            </label>
            <textarea
              className="input-field"
              name="originalCompressionAdjuster"
              id="originalCompressionAdjuster"
              placeholder="1, 2, 3, ..., 13"
              value={formData.originalCompressionAdjuster} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />

            <label
              className="input-label"
              htmlFor="modifiedCompressionAdjuster"
            >
              Modified Compression Adjuster (comma-separated)
            </label>
            <textarea
              className="input-field"
              name="modifiedCompressionAdjuster"
              id="modifiedCompressionAdjuster"
              placeholder="1, 2, 3, ..., 13"
              value={formData.modifiedCompressionAdjuster} // ← CONECTA con el estado
              onChange={handleChange} // ← CONECTA con la función
            />

            <button className="Newcustom">Guardar datos</button>
          </fieldset>
        </form>
      </div>
    </>
  );
}

export default FormTechnicalDataCustomer;
