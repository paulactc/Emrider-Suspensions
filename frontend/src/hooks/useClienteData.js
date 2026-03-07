import { useState, useEffect } from "react";
import api from "../../services/Api";

/**
 * Hook compartido para cargar los datos del cliente autenticado.
 * Lee el CIF/DNI desde localStorage y busca el cliente en la API.
 */
export function useClienteData() {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userCif = user.dni || "";

    if (!userCif) {
      setLoading(false);
      setError("No hay sesión activa");
      return;
    }

    const load = async () => {
      try {
        // Intentar listar todos los clientes (solo funciona para admin)
        let found = null;
        try {
          const clientes = await api.getClientes();
          found = Array.isArray(clientes)
            ? clientes.find((c) => c.cif?.toLowerCase() === userCif.toLowerCase())
            : null;
        } catch (_) {
          // Esperado para clientes sin rol admin
        }

        // Siempre obtener datos frescos por CIF (incluye cuestionario de BD)
        try {
          const fresco = await api.getCliente(found?.id || userCif);
          if (fresco) found = { ...found, ...fresco };
        } catch (_) {}

        if (!found) {
          found = {
            cif: userCif,
            nombre: user.nombre || "Cliente",
            id: userCif,
          };
        }

        setCliente(found);
      } catch (err) {
        setError(err.message || "Error cargando datos del cliente");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { cliente, loading, error };
}
