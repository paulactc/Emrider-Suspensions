import InputSearchCustom from "../admin/forms/InputSearchCustom";
import UleachCustom from "../Page.Custom/UleachCustom";

function ListCustom({
  listCustom,
  Custom,
  handleInputFilter,
  filters,
  listBikes,
}) {
  // --- DEBUG COMPLETO ---
  console.log("=== DEBUG ListCustom ===");
  console.log("1. listCustom recibido:", listCustom);
  console.log("2. Custom recibido:", Custom);
  console.log("3. Tipo de Custom:", typeof Custom);
  console.log("4. Es Array Custom?", Array.isArray(Custom));
  console.log("5. Longitud de Custom:", Custom?.length);

  // Verificar cada elemento individualmente
  if (Custom && Array.isArray(Custom)) {
    Custom.forEach((item, index) => {
      console.log(`6. Custom[${index}]:`, item);
      console.log(`   - Tipo: ${typeof item}`);
      console.log(`   - Es null: ${item === null}`);
      console.log(`   - Es undefined: ${item === undefined}`);
      console.log(`   - Tiene Cliente: ${item?.Cliente || "NO"}`);
    });
  }

  // Si Custom no existe o está vacío, usar listCustom como fallback
  const dataToUse =
    Custom && Array.isArray(Custom) && Custom.length > 0 ? Custom : listCustom;

  console.log("7. Datos a usar:", dataToUse);

  return (
    <>
      <InputSearchCustom
        handleInputFilter={handleInputFilter}
        filters={filters}
      />
      <h3>DATOS CLIENTE</h3>

      <ul className="ulListBikes">
        {dataToUse && Array.isArray(dataToUse) && dataToUse.length > 0 ? (
          dataToUse.map((eachCustom, index) => {
            console.log(`8. Procesando elemento ${index}:`, eachCustom);

            // Verificación estricta antes de renderizar
            if (eachCustom === undefined) {
              console.error(`❌ Elemento ${index} es undefined`);
              return (
                <li key={`error-${index}`} style={{ color: "red" }}>
                  Error: Elemento undefined en posición {index}
                </li>
              );
            }

            if (eachCustom === null) {
              console.error(`❌ Elemento ${index} es null`);
              return (
                <li key={`error-${index}`} style={{ color: "red" }}>
                  Error: Elemento null en posición {index}
                </li>
              );
            }

            if (typeof eachCustom !== "object") {
              console.error(
                `❌ Elemento ${index} no es un objeto:`,
                typeof eachCustom
              );
              return (
                <li key={`error-${index}`} style={{ color: "red" }}>
                  Error: Elemento no es objeto en posición {index}
                </li>
              );
            }

            if (!eachCustom.Cliente) {
              console.warn(
                `⚠️ Elemento ${index} no tiene Cliente:`,
                eachCustom
              );
              return (
                <li key={`warning-${index}`} style={{ color: "orange" }}>
                  Advertencia: Cliente sin nombre en posición {index}
                </li>
              );
            }

            console.log(`✅ Elemento ${index} es válido, renderizando...`);

            return (
              <UleachCustom
                eachCustom={eachCustom}
                key={eachCustom.Cliente || `custom-${index}`}
                listBikes={listBikes}
              />
            );
          })
        ) : (
          <li className="no-results">
            <p>No hay datos disponibles para mostrar.</p>
            <p>Custom: {Custom ? "existe" : "no existe"}</p>
            <p>listCustom: {listCustom ? "existe" : "no existe"}</p>
          </li>
        )}
      </ul>
    </>
  );
}

export default ListCustom;
