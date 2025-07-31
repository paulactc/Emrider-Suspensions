// UlEachDatesTechnical.js

function Caducidad({ datetechnicalArray, motoId, onFichaCaducada }) {
  const bikeDatesTechnical = datetechnicalArray.filter(
    (datetechnical) => datetechnical.clienteId === parseInt(motoId)
  );

  if (bikeDatesTechnical.length === 0) {
    // Si se requiere lógica de caducidad, pero no hay datos, lo marcamos como caducado
    if (typeof onFichaCaducada === "function") {
      onFichaCaducada(true);
    }
    return null;
  }

  const fechaActual = new Date();

  // Ordenar por fecha de creación descendente
  const ordenadas = [...bikeDatesTechnical].sort((a, b) => {
    const fechaA = new Date(a.fechaCreacion);
    const fechaB = new Date(b.fechaCreacion);
    return fechaB - fechaA;
  });

  // Buscar si existe alguna ficha vigente
  const hayFichaVigente = ordenadas.some((ficha) => {
    const fecha = new Date(ficha.fechaCreacion);
    const esOffroad = ficha.disciplina?.toLowerCase() === "offroad";
    const mesesValidos = esOffroad ? 6 : 12;
    const fechaVencimiento = new Date(fecha);
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + mesesValidos);
    return fechaActual <= fechaVencimiento;
  });

  const estaCaducada = !hayFichaVigente;

  // Comunicar al componente padre si la ficha más reciente está caducada
  if (typeof onFichaCaducada === "function") {
    onFichaCaducada(estaCaducada);
  }

  return null;
}

export default Caducidad;
