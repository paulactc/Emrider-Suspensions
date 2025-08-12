import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router";
import UleachBikeAdmin from "./UleachBikeAdmin";
import api from "../../../services/Api";

function ListBikeadmin({ listBikes, listTechnical }) {
  const { id } = useParams();
  const location = useLocation();

  // Si vienes desde UleachCustom, puedes haber pasado motos y/o cif en state
  const motosEnState = location.state?.motos;
  const cifEnState = location.state?.cif;

  const [motos, setMotos] = useState(motosEnState || []);
  const [loading, setLoading] = useState(!motosEnState);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si ya venían en state, no llames al backend
    if (motosEnState && Array.isArray(motosEnState)) return;

    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Si vino cif en state y no está vacío
        if (typeof cifEnState === "string" && cifEnState.trim() !== "") {
          const res = await api.getMotosByCif(cifEnState.trim());
          setMotos(Array.isArray(res) ? res : []);
          return;
        }

        // 2) Fallback: obtener el cliente por id para sacar su cif y luego pedir motos
        if (id) {
          const cliente = await api.getCliente(id);
          const cif = cliente?.cif?.trim();
          if (cif) {
            const res = await api.getMotosByCif(cif);
            setMotos(Array.isArray(res) ? res : []);
            return;
          }
        }

        // 3) Último caso: no hay cif ni forma de obtenerlo
        setError("No se pudieron cargar las motos (falta clienteId o CIF).");
      } catch (e) {
        console.error("Error cargando motos:", e);
        setError("Error al cargar las motos");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id, cifEnState, motosEnState]);

  if (loading) return <div>Cargando motos…</div>;
  if (error) return <div>{error}</div>;
  if (!motos || motos.length === 0) {
    return <div>Este cliente no tiene motocicletas registradas</div>;
  }

  return (
    <>
      <h3>DATOS MOTOCICLETA</h3>
      <ul className="ulListBikes">
        <UleachBikeAdmin
          listBikes={motos} // ahora es un array plano desde el backend
          clientId={id} // por si lo necesitas dentro
          listTechnical={location.state?.listTechnical || listTechnical} // opcional si lo pasas
        />
      </ul>
    </>
  );
}

export default ListBikeadmin;
