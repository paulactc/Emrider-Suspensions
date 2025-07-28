import UleachCustomUser from "../user/UleachCustomUser";

function Cliente({ listCustom, listBikes }) {
  // Aquí puedes definir qué índice del array quieres mostrar.
  // Por ejemplo, para mostrar el primer elemento (índice 0):
  const indexToRender = 1;
  const customToRender = listCustom[indexToRender];

  return (
    <>
      <h3 className="list-title">TUS DATOS DE CLIENTE</h3>
      {customToRender ? ( // Verifica si el elemento existe antes de renderizar
        <UleachCustomUser
          key={customToRender.id} // Asegúrate de que cada elemento en listCustom tenga una propiedad 'id' única.
          Custom={customToRender}
          listBikes={listBikes}
        />
      ) : (
        <p>No hay datos de cliente para mostrar .</p>
      )}
    </>
  );
}

export default Cliente;
