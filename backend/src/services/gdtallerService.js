// backend/src/services/gdtallerService.js
// Servicio para interactuar con la API de GDTaller (fuente de verdad para clientes/motos)

const GDTALLER_API_URL = process.env.GDTALLER_API_URL;
const GDTALLER_TOKEN = process.env.GDTALLER_TOKEN;

// Mapeo de prefijo de codigo postal a provincia española
const CP_A_PROVINCIA = {
  "01": "Alava", "02": "Albacete", "03": "Alicante", "04": "Almeria",
  "05": "Avila", "06": "Badajoz", "07": "Illes Balears", "08": "Barcelona",
  "09": "Burgos", "10": "Caceres", "11": "Cadiz", "12": "Castellon",
  "13": "Ciudad Real", "14": "Cordoba", "15": "A Coruna", "16": "Cuenca",
  "17": "Girona", "18": "Granada", "19": "Guadalajara", "20": "Gipuzkoa",
  "21": "Huelva", "22": "Huesca", "23": "Jaen", "24": "Leon",
  "25": "Lleida", "26": "La Rioja", "27": "Lugo", "28": "Madrid",
  "29": "Malaga", "30": "Murcia", "31": "Navarra", "32": "Ourense",
  "33": "Asturias", "34": "Palencia", "35": "Las Palmas", "36": "Pontevedra",
  "37": "Salamanca", "38": "Santa Cruz de Tenerife", "39": "Cantabria",
  "40": "Segovia", "41": "Sevilla", "42": "Soria", "43": "Tarragona",
  "44": "Teruel", "45": "Toledo", "46": "Valencia", "47": "Valladolid",
  "48": "Bizkaia", "49": "Zamora", "50": "Zaragoza", "51": "Ceuta", "52": "Melilla",
};

function getProvinciaFromCP(cp) {
  if (!cp || cp.length < 2 || cp === "00000") return null;
  return CP_A_PROVINCIA[cp.substring(0, 2)] || null;
}

// Cache en memoria con TTL de 5 minutos
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = {
  clients: { data: null, timestamp: 0 },
  vehicles: { data: null, timestamp: 0 },
};

function isCacheValid(key) {
  return cache[key].data !== null && Date.now() - cache[key].timestamp < CACHE_TTL_MS;
}

function clearCache() {
  cache.clients = { data: null, timestamp: 0 };
  cache.vehicles = { data: null, timestamp: 0 };
  console.log("Cache de GDTaller limpiado");
}

/**
 * Realiza una petición a la API de GDTaller
 */
async function callGDTallerAPI(endpoint, params = {}) {
  const body = new URLSearchParams({
    token: GDTALLER_TOKEN,
    endpoint: endpoint,
    ...params,
  });

  const response = await fetch(GDTALLER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Error en la API de GDTaller: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Prueba la conexión con la API de GDTaller
 */
async function testConnection() {
  return callGDTallerAPI("TryConnection");
}

/**
 * Obtiene los clientes desde GDTaller (con cache)
 */
async function getClients(options = {}) {
  // Usar cache si es válido y no se forzaron opciones específicas
  if (isCacheValid("clients") && !options.startDate && !options.endDate) {
    return cache.clients.data;
  }

  const params = {};
  params.startDate = options.startDate || "2020-01-01";
  params.endDate = options.endDate || new Date().toISOString().split("T")[0];

  const response = await callGDTallerAPI("GetClients", params);

  if (response.code !== 200) {
    throw new Error(`Error obteniendo clientes: ${response.message || "Error desconocido"}`);
  }

  let data = response.data;
  if (typeof data === "string" && data.length > 0) {
    data = JSON.parse(data);
  }

  const result = data || [];

  // Actualizar cache
  if (!options.startDate && !options.endDate) {
    cache.clients = { data: result, timestamp: Date.now() };
  }

  return result;
}

/**
 * Normaliza un CIF (elimina espacios) para comparaciones consistentes
 */
function normalizeCif(cif) {
  if (!cif) return "";
  return cif.replace(/\s+/g, "").toLowerCase();
}

/**
 * Obtiene los vehículos desde GDTaller (con cache).
 * Intenta GetVehicles primero; si no está habilitado, extrae vehículos de GetOrderLines.
 */
async function getVehicles(options = {}) {
  // Usar cache si es válido y no se forzaron opciones específicas
  if (isCacheValid("vehicles") && !options.startDate && !options.endDate && !options.clientId) {
    return cache.vehicles.data;
  }

  const params = {};
  params.startDate = options.startDate || "2020-01-01";
  params.endDate = options.endDate || new Date().toISOString().split("T")[0];

  if (options.clientId) {
    params.clientId = options.clientId;
  }

  // Intentar endpoint GetVehicles
  try {
    const response = await callGDTallerAPI("GetVehicles", params);

    if (response.code === 200) {
      let data = response.data;
      if (typeof data === "string" && data.length > 0) {
        data = JSON.parse(data);
      }

      const result = data || [];

      if (!options.startDate && !options.endDate && !options.clientId) {
        cache.vehicles = { data: result, timestamp: Date.now() };
      }

      return result;
    }
  } catch (err) {
    console.warn("GetVehicles no disponible, usando fallback GetOrderLines:", err.message);
  }

  // Fallback: extraer vehículos únicos desde GetOrderLines
  return await getVehiclesFromOrderLines(params);
}

/**
 * Fallback: extrae vehículos únicos de GetOrderLines cuando GetVehicles no está habilitado.
 * Enriquece los datos cruzando con la info de clientes de GetClients.
 */
async function getVehiclesFromOrderLines(params) {
  try {
    const response = await callGDTallerAPI("GetOrderLines", {
      startDate: params.startDate || "2020-01-01",
      endDate: params.endDate || new Date().toISOString().split("T")[0],
    });

    if (response.code !== 200) {
      console.warn("GetOrderLines tambien fallo:", response.message);
      return [];
    }

    let data = response.data;
    if (typeof data === "string" && data.length > 0) {
      data = JSON.parse(data);
    }

    if (!Array.isArray(data)) return [];

    // Obtener datos de clientes para enriquecer vehiculos
    let clientsMap = {};
    try {
      const clients = await getClients();
      for (const c of clients) {
        if (c.clienteID) clientsMap[c.clienteID] = c;
      }
    } catch (err) {
      console.warn("No se pudieron obtener clientes para enriquecer vehiculos:", err.message);
    }

    // Extraer vehículos únicos por vehiculoID
    const vehicleMap = {};
    for (const line of data) {
      const vid = line.vehiculoID;
      if (!vid || vid <= 0) continue;

      if (!vehicleMap[vid]) {
        // Buscar datos del cliente asociado
        const client = clientsMap[line.clienteID] || null;

        vehicleMap[vid] = {
          vehiculoID: vid,
          clienteID: line.clienteID,
          marca: null,
          modelo: null,
          matricula: line.matricula || null,
          bastidor: null,
          cliCif: line.cliCif || null,
          kms: line.orKms || null,
          color: null,
          version: null,
          cilindrada: null,
          potCV: null,
          potKW: null,
          // Enriquecer con datos del cliente
          clienteNombre: client?.nombre || null,
          cliApellidos: client?.apellidos || null,
          cliLoc: client?.localidad || null,
          cliCP: client?.cp || null,
          cliDommic: client?.domicilio || null,
          cliTlf: client?.tlf || null,
          cliTlf2: client?.tlf2 || null,
          cliEmail: client?.email || null,
          _fromOrderLines: true,
        };
      }

      // Actualizar con datos más recientes si la matrícula aparece
      if (line.matricula && !vehicleMap[vid].matricula) {
        vehicleMap[vid].matricula = line.matricula;
      }
      // Actualizar kms si son más altos
      if (line.orKms && Number(line.orKms) > Number(vehicleMap[vid].kms || 0)) {
        vehicleMap[vid].kms = line.orKms;
      }
    }

    const result = Object.values(vehicleMap);
    console.log(`Fallback GetOrderLines: ${result.length} vehiculos unicos extraidos (enriquecidos con datos de clientes)`);

    // Guardar en cache
    cache.vehicles = { data: result, timestamp: Date.now() };

    return result;
  } catch (err) {
    console.error("Error en fallback GetOrderLines:", err.message);
    return [];
  }
}

/**
 * Busca un cliente por CIF en los datos de GDTaller
 */
async function getClientByCif(cif) {
  const clients = await getClients();
  const raw = clients.find((c) => c.cif === cif);
  return raw ? mapClientFromGDTaller(raw) : null;
}

/**
 * Obtiene vehículos filtrando por CIF del propietario (normaliza CIF para comparación)
 */
async function getVehiclesByCif(cif) {
  const vehicles = await getVehicles();
  const cifNorm = normalizeCif(cif);
  return vehicles
    .filter((v) => normalizeCif(v.cliCif) === cifNorm)
    .map(mapVehicleFromGDTaller);
}

/**
 * Busca un vehículo por matrícula en los datos de GDTaller
 */
async function getVehicleByMatricula(matricula) {
  const vehicles = await getVehicles();
  const raw = vehicles.find((v) => v.matricula === matricula);
  return raw ? mapVehicleFromGDTaller(raw) : null;
}

/**
 * Obtiene las líneas de pedido desde GDTaller
 */
async function getOrderLines(options = {}) {
  const params = {};

  params.startDate = options.startDate || options.dateFrom || "2020-01-01";
  params.endDate = options.endDate || options.dateTo || new Date().toISOString().split("T")[0];
  if (options.vehicleId) params.vehicleId = options.vehicleId;
  if (options.clientId) params.clientId = options.clientId;

  const response = await callGDTallerAPI("GetOrderLines", params);

  if (response.code !== 200) {
    throw new Error(`Error obteniendo lineas de pedido: ${response.message || "Error desconocido"}`);
  }

  let data = response.data;
  if (typeof data === "string" && data.length > 0) {
    data = JSON.parse(data);
  }

  return data || [];
}

/**
 * Mapea un cliente de GDTaller al formato del frontend
 */
function mapClientFromGDTaller(gdClient) {
  let nombre = gdClient.nombre || null;
  let apellidos = gdClient.apellidos || null;
  const nombreCom = gdClient.nombreCom && gdClient.nombreCom.trim() ? gdClient.nombreCom.trim() : null;

  // Si no hay nombre pero si nombreCom, intentar extraer nombre/apellidos
  if (!nombre && nombreCom) {
    const parts = nombreCom.split(" ");
    if (parts.length > 1) {
      nombre = parts[0];
      apellidos = apellidos || parts.slice(1).join(" ");
    } else {
      nombre = nombreCom;
    }
  }

  // Construir nombre_completo de forma robusta
  const nombre_completo = nombreCom
    || [nombre, apellidos].filter(Boolean).join(" ")
    || null;

  const telefono = gdClient.tlf || gdClient.tlf2 || gdClient.tlf3 || null;
  const cp = gdClient.cp || null;

  // Provincia: derivar del codigo postal (el campo prov de GDTaller es incorrecto)
  const provincia = getProvinciaFromCP(cp) || null;

  return {
    id: gdClient.clienteID,
    gdtaller_id: gdClient.clienteID,
    nombre: nombre,
    apellidos: apellidos,
    nombre_completo: nombre_completo,
    email: gdClient.email || null,
    telefono: telefono,
    cif: gdClient.cif || null,
    direccion: gdClient.domicilio || null,
    poblacion: gdClient.localidad || null,
    localidad: gdClient.localidad || null,
    codigo_postal: cp,
    provincia: provincia,
    pais: gdClient.pais || null,
    prefijo: gdClient.prefijo || null,
    referencia: gdClient.ref || null,
  };
}

/**
 * Mapea un vehículo de GDTaller al formato del frontend
 */
function mapVehicleFromGDTaller(gdVehicle) {
  return {
    id: gdVehicle.vehiculoID,
    gdtaller_id: gdVehicle.vehiculoID,
    marca: gdVehicle.marca || null,
    modelo: gdVehicle.modelo || null,
    anio: null,
    matricula: gdVehicle.matricula || null,
    bastidor: gdVehicle.bastidor || null,
    cifPropietario: gdVehicle.cliCif ? gdVehicle.cliCif.replace(/\s+/g, "") : null,
    cif_propietario: gdVehicle.cliCif ? gdVehicle.cliCif.replace(/\s+/g, "") : null,
    kilometraje: gdVehicle.kms || null,
    color: gdVehicle.color || null,
    version: gdVehicle.version || null,
    cilindrada: gdVehicle.cilindrada || null,
    potencia_cv: gdVehicle.potCV || null,
    potencia_kw: gdVehicle.potKW || null,
    gdtaller_client_id: gdVehicle.clienteID,
    cliente_nombre: gdVehicle.clienteNombre || null,
    cliente_apellidos: gdVehicle.cliApellidos || null,
    cliente_localidad: gdVehicle.cliLoc || null,
    cliente_cp: gdVehicle.cliCP || null,
    cliente_direccion: gdVehicle.cliDommic || null,
    cliente_telefono: gdVehicle.cliTlf || gdVehicle.cliTlf2 || null,
    cliente_email: gdVehicle.cliEmail || null,
    _datosLimitados: gdVehicle._fromOrderLines || false,
  };
}

module.exports = {
  testConnection,
  getClients,
  getVehicles,
  getOrderLines,
  getClientByCif,
  getVehiclesByCif,
  getVehicleByMatricula,
  mapClientFromGDTaller,
  mapVehicleFromGDTaller,
  clearCache,
};
