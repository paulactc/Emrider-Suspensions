import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import DatosTecnicosServicio from "../../user/DatosTecnicosServicio";
import api from "../../../../services/Api";

function TechnicalDataAdmin() {
  const { id } = useParams();
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    api
      .getServiciosByMoto(id)
      .then((res) => {
        const data = res.data || [];
        setServicios(data.filter((s) => s.datos_tecnicos_json));
      })
      .catch(() => setServicios([]))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", color: "#9ca3af", textAlign: "center" }}>
        Cargando datos técnicos...
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <DatosTecnicosServicio servicios={servicios} />
    </div>
  );
}

export default TechnicalDataAdmin;
