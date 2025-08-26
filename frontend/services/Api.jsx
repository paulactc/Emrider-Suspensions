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

  // Obtener motos por CIF
  getMotosByCif(cif) {
    return this.makeRequest(`/motos/by-cif/${encodeURIComponent(cif)}`);
  }

  // Obtener una moto por ID
  async getMoto(id) {
    return this.makeRequest(`/motos/${id}`);
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

  // Obtener datos completos de cliente y moto para servicios técnicos
  async getClienteYMotoParaServicio(motoId) {
    try {
      console.log(
        "🔍 Obteniendo datos completos para servicio técnico, moto ID:",
        motoId
      );

      // 1. Obtener datos de la moto
      const moto = await this.getMoto(motoId);
      console.log("🏍️ Moto obtenida:", moto);

      // 2. Obtener datos del cliente por CIF
      let cliente = null;
      if (moto.cifPropietario) {
        const clientes = await this.getClientes();
        cliente = clientes.find((c) => c.cif === moto.cifPropietario);
        console.log("👤 Cliente encontrado:", cliente);
      }

      return {
        moto,
        cliente,
        datosCompletos: {
          clienteData: !!(cliente?.peso && cliente?.nivelPilotaje),
          motoData: !!(
            moto.especialidad &&
            moto.tipoConduccion &&
            moto.preferenciaRigidez
          ),
        },
      };
    } catch (error) {
      console.error("❌ Error obteniendo datos para servicio:", error);
      throw error;
    }
  }

  // Verificar si un cliente necesita completar el cuestionario
  async verificarEstadoCuestionario(motoId) {
    try {
      const datos = await this.getClienteYMotoParaServicio(motoId);

      return {
        necesitaCuestionario:
          !datos.datosCompletos.clienteData || !datos.datosCompletos.motoData,
        clienteCompleto: datos.datosCompletos.clienteData,
        motoCompleta: datos.datosCompletos.motoData,
        cliente: datos.cliente,
        moto: datos.moto,
      };
    } catch (error) {
      console.error("❌ Error verificando estado del cuestionario:", error);
      return {
        necesitaCuestionario: true,
        clienteCompleto: false,
        motoCompleta: false,
        cliente: null,
        moto: null,
      };
    }
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

  // ===== CUESTIONARIO =====

  // Guardar respuestas del cuestionario
  async saveQuestionnaire(questionnaireData) {
    console.log("📤 Enviando cuestionario:", questionnaireData);
    return this.makeRequest("/questionnaire", {
      method: "POST",
      body: JSON.stringify(questionnaireData),
    });
  }

  // Verificar estado del cuestionario para un cliente
  async getQuestionnaireStatus(clienteId) {
    console.log(
      "🔍 Verificando estado del cuestionario para cliente:",
      clienteId
    );
    return this.makeRequest(`/questionnaire/status/${clienteId}`);
  }

  // Obtener cliente con datos del cuestionario incluidos
  async getClienteCompleto(clienteId) {
    console.log("👤 Obteniendo cliente completo:", clienteId);
    return this.makeRequest(`/clientes/${clienteId}`);
  }

  // Obtener motos con datos del cuestionario incluidos
  async getMotosByCifCompleto(cif) {
    console.log("🏍️ Obteniendo motos completas por CIF:", cif);
    // Reutilizamos el método existente ya que las motos incluirán los nuevos campos
    return this.getMotosByCif(cif);
  }

  // ===== MÉTODOS AUXILIARES PARA EL CUESTIONARIO =====

  // Verificar si un cliente necesita completar el cuestionario
  async clienteNecesitaCuestionario(clienteId) {
    try {
      const status = await this.getQuestionnaireStatus(clienteId);
      return status.necesitaCuestionario;
    } catch (error) {
      console.error("Error verificando necesidad de cuestionario:", error);
      return true; // Por seguridad, asumir que sí necesita
    }
  }

  // Obtener tipo de cuestionario requerido
  async getTipoCuestionarioRequerido(clienteId) {
    try {
      const status = await this.getQuestionnaireStatus(clienteId);
      return status.tipoRequerido || "first-time";
    } catch (error) {
      console.error("Error obteniendo tipo de cuestionario:", error);
      return "first-time";
    }
  }

  // ===== INFORMACIÓN DE SERVICIOS =====

  // Obtener información de servicio por ID
  async getServicioInfo(id) {
    console.log("📋 Obteniendo información de servicio:", id);
    return this.makeRequest(`/servicios-info/${id}`);
  }

  // Obtener servicios por moto ID
  async getServiciosByMoto(motoId) {
    console.log("🏍️ Obteniendo servicios para moto:", motoId);
    return this.makeRequest(`/servicios-info/by-moto/${motoId}`);
  }

  // Crear nueva información de servicio
  async createServicioInfo(servicioData) {
    console.log("📝 Creando información de servicio:", servicioData);
    return this.makeRequest("/servicios-info", {
      method: "POST",
      body: JSON.stringify(servicioData),
    });
  }

  // Actualizar información de servicio
  async updateServicioInfo(id, servicioData) {
    console.log("✏️ Actualizando información de servicio:", id, servicioData);
    return this.makeRequest(`/servicios-info/${id}`, {
      method: "PUT",
      body: JSON.stringify(servicioData),
    });
  }

  // Eliminar información de servicio
  async deleteServicioInfo(id) {
    console.log("🗑️ Eliminando información de servicio:", id);
    return this.makeRequest(`/servicios-info/${id}`, {
      method: "DELETE",
    });
  }

  // Obtener estadísticas de servicios
  async getServiciosStats() {
    console.log("📊 Obteniendo estadísticas de servicios");
    return this.makeRequest("/servicios-info/stats/dashboard");
  }

  // Verificar si existe información de servicio para una moto
  async checkServicioExists(motoId) {
    try {
      const servicios = await this.getServiciosByMoto(motoId);
      const serviciosCompletos =
        servicios.data?.filter((s) => s.status === "completed") || [];
      const serviciosPendientes =
        servicios.data?.filter((s) => s.status === "pending") || [];

      return {
        hasCompletedServices: serviciosCompletos.length > 0,
        hasPendingServices: serviciosPendientes.length > 0,
        latestService: servicios.data?.[0] || null,
        totalServices: servicios.data?.length || 0,
      };
    } catch (error) {
      console.error("Error verificando servicios:", error);
      return {
        hasCompletedServices: false,
        hasPendingServices: false,
        latestService: null,
        totalServices: 0,
      };
    }
  }
}

// Crear instancia única del servicio
const apiService = new ApiService();

export default apiService;
