import UleachCustomUser from "../user/UleachCustomUser";

function Cliente({ listCustom, listBikes }) {
  // Aquí puedes definir qué índice del array quieres mostrar.
  // Por ejemplo, para mostrar el primer elemento (índice 0):
  const indexToRender = 0;
  const customToRender = listCustom[indexToRender];

  return (
    <>
      <h3>TUS DATOS DE CLIENTE</h3>
      {customToRender ? ( // Verifica si el elemento existe antes de renderizar
        <UleachCustomUser
          key={customToRender.id} // Asegúrate de que cada elemento en listCustom tenga una propiedad 'id' única.
          Custom={customToRender}
          listBikes={listBikes}
        />
      ) : (
        <p>No hay datos de cliente para mostrar en esta posición.</p>
      )}
    </>
  );
}

export default Cliente;
