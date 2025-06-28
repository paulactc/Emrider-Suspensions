function FormTechnicalDataCustom({ formData, handleChange }) {
  return (
    <>
      <form className="addForm">
        <h2 className="title">Datos del servicio </h2>
        <legend className="addForm__title ">Peso del Piloto (kg)</legend>
        <input
          className="addForm__input "
          type="text"
          name="pesoPiloto"
          placeholder="68"
          value={formData.pesoPiloto} // ← CONECTA con el estado
          onChange={handleChange} // ← CONECTA con la función
        />

        <legend className="addForm__title ">Disciplina</legend>
        <input
          className="addForm__input"
          type="text"
          name="disciplina"
          placeholder="Motocross"
          value={formData.disciplina} // ← CONECTA con el estado
          onChange={handleChange} // ← CONECTA con la función
        />

        <legend className="addForm__title ">Número de Orden</legend>
        <input
          className="addForm__input "
          type="text"
          name="numeroOrden"
          placeholder="002"
          value={formData.numeroOrden} // ← CONECTA con el estado
          onChange={handleChange} // ← CONECTA con la función
        />

        <legend className="addForm__title ">Observaciones</legend>
        <textarea
          className="addForm__input"
          name="observaciones"
          placeholder="Observaciones a tener en cuenta "
          rows="4"
          value={formData.observaciones} // ← CONECTA con el estado
          onChange={handleChange} // ← CONECTA con la función
        />
      </form>

      <form className="addForm">
        <h2 className="title">Datos Suspensiones </h2>
        <fieldset className="addForm__section">
          <legend className="addForm__title">marca </legend>
          <input
            className="addForm__input"
            type="text"
            name="marca"
            placeholder="Marca "
            value={formData.marca} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />

          <legend className="addForm__title">modelo suspension</legend>
          <input
            className="addForm__input"
            type="text"
            name="modelo"
            placeholder="modelo "
            value={formData.modelo} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">año </legend>
          <input
            className="addForm__input"
            type="text"
            name="año"
            placeholder="año"
            value={formData.año} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />

          <legend className="addForm__title">referencia suspension</legend>
          <input
            className="addForm__input"
            type="text"
            name="referenciasuspension"
            placeholder="referencia suspension"
            value={formData.referenciasuspension} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
        </fieldset>

        <h2 className="title">Datos Tecnicos</h2>
        <fieldset className="addForm__section">
          <legend className="addForm__title">Spring Data</legend>

          <legend className="addForm__title">mainRate</legend>
          <input
            className="addForm__input"
            type="text"
            name="mainRate"
            placeholder="Main Rate"
            value={formData.mainRate} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />

          <legend className="addForm__title">springRef</legend>
          <input
            className="addForm__input"
            type="text"
            name="springRef"
            placeholder="Spring Reference"
            value={formData.springRef} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />

          <legend className="addForm__title">Provincia</legend>
          <legend className="addForm__title">Length (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="length"
            placeholder="Length (mm)"
            value={formData.length} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Number of Coils</legend>
          <input
            className="addForm__input"
            type="text"
            name="numeroSpiras"
            placeholder="Number of Coils"
            value={formData.numeroSpiras} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Outer Diameter (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="outer"
            placeholder="Outer Diameter (mm)"
            value={formData.outer} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Inner Diameter (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="inner"
            placeholder="Inner Diameter (mm)"
            value={formData.inner} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Spire (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="spire"
            placeholder="Spire (mm)"
            value={formData.spire} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Rebound Spring</legend>
          <input
            className="addForm__input"
            type="text"
            name="rebSpring"
            placeholder="Rebound Spring"
            value={formData.rebSpring} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Total Length (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="totalLength"
            placeholder="Total Length (mm)"
            value={formData.totalLength} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Stroke (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="stroke"
            placeholder="Stroke (mm)"
            value={formData.stroke} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Shaft (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="shaft"
            placeholder="Shaft (mm)"
            value={formData.shaft} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Piston (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="piston"
            placeholder="Piston (mm)"
            value={formData.piston} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Internal Spacer (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="internalSpacer"
            placeholder="Internal Spacer (mm)"
            value={formData.internalSpacer} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Height (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="height"
            placeholder="Height (mm)"
            value={formData.height} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Stroke to Bump Rubber (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="strokeToBumpRubber"
            placeholder="Stroke to Bump Rubber (mm)"
            value={formData.strokeToBumpRubber} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Rod (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="rod"
            placeholder="Rod (mm)"
            value={formData.rod} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Rebound Spring Rate</legend>
          <input
            className="addForm__input"
            type="text"
            name="reboundSpring"
            placeholder="Rebound Spring Rate"
            value={formData.reboundSpring} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Spring Length (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="springLength"
            placeholder="Spring Length (mm)"
            value={formData.springLength} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Spring Upper Diameter (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="springUpperDiameter"
            placeholder="Spring Upper Diameter (mm)"
            value={formData.springUpperDiameter} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Spring Lower Diameter (mm)</legend>
          <input
            className="addForm__input"
            type="text"
            name="springLowerDiameter"
            placeholder="Spring Lower Diameter (mm)"
            value={formData.springLowerDiameter} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Head Rod End</legend>
          <input
            className="addForm__input"
            type="text"
            name="headRodEnd"
            placeholder="Head Rod End"
            value={formData.headRodEnd} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Upper Mount</legend>
          <input
            className="addForm__input"
            type="text"
            name="upperMount"
            placeholder="Upper Mount"
            value={formData.upperMount} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Lower Mount</legend>
          <input
            className="addForm__input"
            type="text"
            name="lowerMount"
            placeholder="Lower Mount"
            value={formData.lowerMoun} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
        </fieldset>

        <fieldset className="addForm__section">
          <legend className="addForm__title">Oil & Gas</legend>
          <legend className="addForm__title">Oil</legend>
          <input
            className="addForm__input"
            type="text"
            name="oil"
            placeholder="Oil (e.g. Fork Oil 7.5W)"
            value={formData.oil} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">gas</legend>
          <input
            className="addForm__input"
            type="text"
            name="gas"
            placeholder="Gas (e.g. Nitrogen 10 bar)"
            value={formData.gas} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
        </fieldset>

        <fieldset className="addForm__section">
          <legend className="addForm__title">Compression</legend>
          <legend className="addForm__title">Original Compression</legend>
          <input
            className="addForm__input"
            type="text"
            name="compressionOriginal"
            placeholder="Original Compression"
            value={formData.compressionOriginal} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
          <legend className="addForm__title">Provincia</legend>
          <legend className="addForm__title">Modified Compression</legend>
          <input
            className="addForm__input"
            type="text"
            name="compressionModification"
            placeholder="Modified Compression"
            value={formData.compressionModification} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
        </fieldset>

        <fieldset className="addForm__section">
          <legend className="addForm__title">Rebound</legend>
          <label className="addForm__label" htmlFor="reboundOriginal">
            Original Rebound Values (comma-separated)
          </label>
          <textarea
            className="addForm__input"
            name="reboundOriginal"
            id="reboundOriginal"
            placeholder="1, 2, 3, ..., 18"
            value={formData.reboundOriginal} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />

          <label className="addForm__label" htmlFor="reboundModification">
            Modified Rebound Values (comma-separated)
          </label>
          <textarea
            className="addForm__input"
            name="reboundModification"
            id="reboundModification"
            placeholder="1, 2, 3, ..., 18"
            value={formData.reboundModification} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />
        </fieldset>

        <fieldset className="addForm__section">
          <legend className="addForm__title">Compression Adjusters</legend>
          <label
            className="addForm__label"
            htmlFor="originalCompressionAdjuster"
          >
            Original Compression Adjuster (comma-separated)
          </label>
          <textarea
            className="addForm__input"
            name="originalCompressionAdjuster"
            id="originalCompressionAdjuster"
            placeholder="1, 2, 3, ..., 13"
            value={formData.originalCompressionAdjuster} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />

          <label
            className="addForm__label"
            htmlFor="modifiedCompressionAdjuster"
          >
            Modified Compression Adjuster (comma-separated)
          </label>
          <textarea
            className="addForm__input"
            name="modifiedCompressionAdjuster"
            id="modifiedCompressionAdjuster"
            placeholder="1, 2, 3, ..., 13"
            value={formData.modifiedCompressionAdjuster} // ← CONECTA con el estado
            onChange={handleChange} // ← CONECTA con la función
          />

          <button className="Newcustom">Guardar datos</button>
        </fieldset>
      </form>
    </>
  );
}

export default FormTechnicalDataCustom;
