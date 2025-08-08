const API_BASE_URL = "http://localhost:3000/api";

class ApiService {
  // Método genérico para hacer peticiones
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en la petición:", error);
      throw error;
    }
  }

  // ===== CLIENTES =====

  // Obtener todos los clientes
  async getClientes() {
    return this.makeRequest("/clientes");
  }

  // Obtener un cliente por ID
  async getCliente(id) {
    return this.makeRequest(`/clientes/${id}`);
  }

  // Crear nuevo cliente
  async createCliente(clienteData) {
    return this.makeRequest("/clientes", {
      method: "POST",
      body: JSON.stringify(clienteData),
    });
  }

  // Actualizar cliente
  async updateCliente(id, clienteData) {
    return this.makeRequest(`/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(clienteData),
    });
  }

  // Eliminar cliente
  async deleteCliente(id) {
    return this.makeRequest(`/clientes/${id}`, {
      method: "DELETE",
    });
  }

  // ===== MOTOS =====
  // (tu backend actual)
  getMotosByCif(cif) {
    return this.makeRequest(`/motos/by-cif/${encodeURIComponent(cif)}`);
  }

  // Obtener todas las motos
  async getMotos() {
    return this.makeRequest("/motos");
  }

  // Obtener motos de un cliente
  async getMotosByCliente(clienteId) {
    return this.makeRequest(`/motos/cliente/${clienteId}`);
  }

  // Crear nueva moto
  async createMoto(motoData) {
    return this.makeRequest("/motos", {
      method: "POST",
      body: JSON.stringify(motoData),
    });
  }

  // Actualizar moto
  async updateMoto(id, motoData) {
    return this.makeRequest(`/motos/${id}`, {
      method: "PUT",
      body: JSON.stringify(motoData),
    });
  }

  // Eliminar moto
  async deleteMoto(id) {
    return this.makeRequest(`/motos/${id}`, {
      method: "DELETE",
    });
  }

  // ===== DATOS TÉCNICOS =====
  // GET datos técnicos por motoId
  getDatosTecnicosByMoto(motoId) {
    return this.makeRequest(
      `/datos-tecnicos/moto/${encodeURIComponent(motoId)}`
    );
  }

  // Crear datos técnicos
  async createDatosTecnicos(datosData) {
    return this.makeRequest("/datos-tecnicos", {
      method: "POST",
      body: JSON.stringify(datosData),
    });
  }

  // Actualizar datos técnicos
  async updateDatosTecnicos(id, datosData) {
    return this.makeRequest(`/datos-tecnicos/${id}`, {
      method: "PUT",
      body: JSON.stringify(datosData),
    });
  }
}

// Crear instancia única del servicio
const apiService = new ApiService();

export default apiService;
