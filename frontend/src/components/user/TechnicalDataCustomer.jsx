// TechnicalDataCustomer.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import UlEachDatesTechnical from "./UlEachDatesTechnical";
import api from "../../../services/Api";

function TechnicalDataCustomer({ listTechnical }) {
  const { id: motoId } = useParams();
  const location = useLocation();

  // Si vienes navegando desde otra pantalla, quizás te pasaron los datos
  const passed = location.state?.listTechnical;

  const [datos, setDatos] = useState(
    passed?.datostecnicos || Array.isArray(passed) ? passed : []
  );
  const [loading, setLoading] = useState(!passed);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si ya te los pasaron por state, no llames API
    if (passed) return;

    // Si no hay datos en props, intenta API
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!motoId) {
          setError("Falta el identificador de la moto.");
          return;
        }

        const res = await api.getDatosTecnicosByMoto(motoId);
        // res debería ser un array plano desde el backend
        setDatos(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error("Error cargando datos técnicos:", e);
        setError("No se pudieron cargar los datos técnicos.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [motoId, passed]);

  if (loading) return <div>Cargando datos técnicos…</div>;
  if (error) return <div>{error}</div>;

  const datetechnicalArray = Array.isArray(datos)
    ? datos
    : datos?.datostecnicos || [];

  if (!Array.isArray(datetechnicalArray) || datetechnicalArray.length === 0) {
    return <div>No hay datos técnicos disponibles</div>;
  }

  return (
    <UlEachDatesTechnical
      datetechnicalArray={datetechnicalArray}
      motoId={motoId}
    />
  );
}

export default TechnicalDataCustomer;
