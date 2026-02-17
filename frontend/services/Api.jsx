const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

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
        // Intentar leer el mensaje de error del backend
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorBody = await response.json();
          if (errorBody.message) {
            errorMessage = errorBody.message;
          }
        } catch (_) {
          // Si no se puede parsear el body, usar el mensaje por defecto
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en la peticion:", error);
      throw error;
    }
  }

  // ===== AUTH =====

  async login(email, password) {
    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async loginWithDni(dni, password) {
    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ dni, password }),
    });
  }

  async register(userData) {
    return this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(emailOrDni) {
    const isEmail = emailOrDni.includes("@");
    return this.makeRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(isEmail ? { email: emailOrDni } : { dni: emailOrDni }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.makeRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async verifyToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return this.makeRequest("/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // ===== CLIENTES (solo lectura desde GDTaller) =====

  // Obtener todos los clientes
  async getClientes() {
    return this.makeRequest("/clientes");
  }

  // Obtener un cliente por ID (GDTaller ID o CIF)
  async getCliente(id) {
    return this.makeRequest(`/clientes/${encodeURIComponent(id)}`);
  }

  // Actualizar cuestionario del cliente (peso, nivel pilotaje)
  async updateClienteCuestionario(id, cuestionarioData) {
    return this.makeRequest(`/clientes/${encodeURIComponent(id)}/cuestionario`, {
      method: "PUT",
      body: JSON.stringify(cuestionarioData),
    });
  }

  // ===== MOTOS (solo lectura desde GDTaller) =====

  // Obtener motos por CIF
  getMotosByCif(cif) {
    return this.makeRequest(`/motos/by-cif/${encodeURIComponent(cif)}`);
  }

  // Obtener una moto por ID (GDTaller ID o matrícula)
  async getMoto(id) {
    return this.makeRequest(`/motos/${encodeURIComponent(id)}`);
  }

  // Obtener todas las motos
  async getMotos() {
    return this.makeRequest("/motos");
  }

  // Obtener datos completos de cliente y moto para servicios técnicos
  async getClienteYMotoParaServicio(motoId) {
    try {
      console.log("Obteniendo datos completos para servicio tecnico, moto ID:", motoId);

      // 1. Obtener datos de la moto
      const moto = await this.getMoto(motoId);
      console.log("Moto obtenida:", moto);

      // 2. Obtener datos del cliente por CIF
      let cliente = null;
      if (moto.cifPropietario) {
        const clientes = await this.getClientes();
        cliente = clientes.find((c) => c.cif === moto.cifPropietario);
        console.log("Cliente encontrado:", cliente);
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
      console.error("Error obteniendo datos para servicio:", error);
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
      console.error("Error verificando estado del cuestionario:", error);
      return {
        necesitaCuestionario: true,
        clienteCompleto: false,
        motoCompleta: false,
        cliente: null,
        moto: null,
      };
    }
  }

  // ===== ORDENES DE TRABAJO (GDTaller) =====

  async getOrderLinesByClient(clientId) {
    return this.makeRequest(`/gdtaller/order-lines/${encodeURIComponent(clientId)}`);
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
    console.log("Enviando cuestionario:", questionnaireData);
    return this.makeRequest("/questionnaire", {
      method: "POST",
      body: JSON.stringify(questionnaireData),
    });
  }

  // Verificar estado del cuestionario para un cliente
  async getQuestionnaireStatus(clienteId) {
    console.log("Verificando estado del cuestionario para cliente:", clienteId);
    return this.makeRequest(`/questionnaire/status/${encodeURIComponent(clienteId)}`);
  }

  // Obtener cliente con datos del cuestionario incluidos
  async getClienteCompleto(clienteId) {
    return this.makeRequest(`/clientes/${encodeURIComponent(clienteId)}`);
  }

  // Obtener motos con datos del cuestionario incluidos
  async getMotosByCifCompleto(cif) {
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
      return true;
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
    return this.makeRequest(`/servicios-info/${id}`);
  }

  // Obtener servicios por moto ID (GDTaller ID o matrícula)
  async getServiciosByMoto(motoId) {
    return this.makeRequest(`/servicios-info/by-moto/${encodeURIComponent(motoId)}`);
  }

  // Crear nueva información de servicio
  async createServicioInfo(servicioData) {
    return this.makeRequest("/servicios-info", {
      method: "POST",
      body: JSON.stringify(servicioData),
    });
  }

  // Actualizar información de servicio
  async updateServicioInfo(id, servicioData) {
    return this.makeRequest(`/servicios-info/${id}`, {
      method: "PUT",
      body: JSON.stringify(servicioData),
    });
  }

  // Eliminar información de servicio
  async deleteServicioInfo(id) {
    return this.makeRequest(`/servicios-info/${id}`, {
      method: "DELETE",
    });
  }

  // Obtener estadísticas de servicios
  async getServiciosStats() {
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
