import "../styles/App.scss";
import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import Footer from "./layout/Footer.jsx";
import Header from "./layout/Header";
import LandingPage from "./layout/LandingPage";
import ListCustom from "./Page.Custom/ListCustom";
import FormsCustom from "./admin/forms/FormsCustom";
import FormNewUser from "./Page.Custom/FormNewUser";
import TechnicalDataCustomer from "./user/TechnicalDataCustomer";
import FormBike from "./admin/forms/FormBike";
import FormTechnicalDataCustomer from "./admin/forms/FormTechnicalDataCustomer";
import Cliente from "./user/Cliente";
import ListBike from "./Page.Bike/ListBike";
import ListBikeadmin from "./Page.Bike/ListBikeadmin";
import TechnicalDataAdmin from "./admin/forms/TechnicalDataAdmin";
import EditarDatosCliente from "./Page.Custom/EditarDatosCliente";

// Importar el servicio API
import apiService from "../../services/Api.jsx";

// Datos estáticos (mientras migramos)
import dataBike from "../data/ListBike.json";
import dataTechnical from "../data/TechinalDatas.json";
import dataUsers from "../data/ListUsers.json";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [listCustom, setListCustom] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar clientes desde el backend
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const clientes = await apiService.getClientes();
        setListCustom(clientes);
        console.log("✅ Clientes cargados desde API:", clientes);
      } catch (error) {
        console.error("❌ Error al cargar clientes:", error);
        setError("Error al cargar los clientes");
        // Fallback: usar datos estáticos si el backend no está disponible
        // setListCustom(dataCustom);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const [filters, setFilters] = useState({
    Nombre: "",
    Apellidos: "",
    telefono: "",
  });

  const listBikes = dataBike;
  const listTechnical = dataTechnical;
  const listUsers = dataUsers;

  const [clientData, setClientData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    codigo_postal: "",
    poblacion: "",
    provincia: "",
  });

  const [motoData, setMotoData] = useState({
    id: "",
    marca: "",
    modelo: "",
    año_fabricacion: "",
    matricula: "",
    bastidor: "",
    cliente_id: null,
  });

  const [formData, setFormData] = useState({
    peso_piloto: "",
    disciplina: "",
    numero_orden: "",
    observaciones: "",
    marca: "",
    modelo: "",
    año: "",
    referencia_suspension: "",
    main_rate: "",
    spring_ref: "",
    length: "",
    numero_spiras: "",
    outer_diameter: "",
    inner_diameter: "",
    spire: "",
    reb_spring: "",
    total_length: "",
    stroke: "",
    shaft: "",
    piston: "",
    internal_spacer: "",
    height: "",
    stroke_to_bump_rubber: "",
    rod: "",
    rebound_spring: "",
    spring_length: "",
    spring_upper_diameter: "",
    spring_lower_diameter: "",
    head_rod_end: "",
    upper_mount: "",
    lower_mount: "",
    oil: "",
    gas: "",
    compression_original: "",
    compression_modification: "",
    rebound_original: "",
    rebound_modification: "",
    original_compression_adjuster: "",
    modified_compression_adjuster: "",
  });

  // Función para crear un nuevo cliente
  const createCliente = async (nuevoCliente) => {
    try {
      const result = await apiService.createCliente(nuevoCliente);
      console.log("✅ Cliente creado:", result);

      // Recargar la lista de clientes
      const clientesActualizados = await apiService.getClientes();
      setListCustom(clientesActualizados);

      return result;
    } catch (error) {
      console.error("❌ Error al crear cliente:", error);
      throw error;
    }
  };

  // Función para actualizar un cliente
  const updateCliente = async (id, datosActualizados) => {
    try {
      const result = await apiService.updateCliente(id, datosActualizados);
      console.log("✅ Cliente actualizado:", result);

      // Recargar la lista de clientes
      const clientesActualizados = await apiService.getClientes();
      setListCustom(clientesActualizados);

      return result;
    } catch (error) {
      console.error("❌ Error al actualizar cliente:", error);
      throw error;
    }
  };

  const handleInputFilter = (ev) => {
    const { id, value } = ev.target;
    setFilters({
      ...filters,
      [id]: value,
    });
  };

  const filterCustomData = (data, filters) => {
    if (!Array.isArray(data)) {
      console.warn("Los datos de clientes no son un array:", data);
      return [];
    }

    return data.filter((customer) => {
      if (!customer || typeof customer !== "object") {
        return false;
      }

      // Filtro por nombre
      if (filters.Nombre && filters.Nombre.trim() !== "") {
        const nombre = customer.nombre?.toLowerCase() || "";
        const apellidos = customer.apellidos?.toLowerCase() || "";
        const nombreCompleto = `${nombre} ${apellidos}`;
        const searchTerm = filters.Nombre.toLowerCase();
        if (!nombreCompleto.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro por teléfono
      if (filters.telefono && filters.telefono.trim() !== "") {
        const phoneNumber = customer.telefono || "";
        const searchPhone = filters.telefono.toString();
        if (!phoneNumber.toString().includes(searchPhone)) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredCustom = filterCustomData(listCustom, filters);

  const handleButton = () => {
    console.log("has hecho click");
  };

  const handleChangeClientes = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeMotos = (e) => {
    const { name, value } = e.target;
    setMotoData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ MOSTRAR PANTALLA DE CARGA GLOBAL SI ES NECESARIO
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>🔄 Cargando aplicación...</h2>
        <p>Por favor espera mientras cargamos los datos iniciales.</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <ScrollToTop />

      <Routes>
        {/* 🏠 PÁGINA PRINCIPAL */}
        <Route
          path="/"
          element={
            <LandingPage handleButton={handleButton} listUsers={listUsers} />
          }
        />

        {/* 👥 ADMINISTRACIÓN DE CLIENTES */}
        <Route
          path="/admin/clientes"
          element={
            <ListCustom
              Custom={filteredCustom}
              handleInputFilter={handleInputFilter}
              filters={filters}
              listBikes={listBikes}
              listCustom={listCustom}
            />
          }
        />

        {/* ✅ RUTA CORREGIDA: CLIENTE CON PROPS */}
        <Route
          path="/cliente"
          element={<Cliente listCustom={listCustom} listBikes={listBikes} />}
        />

        {/* ✅ NUEVA RUTA: LISTA DE CLIENTES (si es necesaria) */}
        <Route
          path="/list"
          element={
            <ListCustom
              Custom={filteredCustom}
              handleInputFilter={handleInputFilter}
              filters={filters}
              listBikes={listBikes}
              listCustom={listCustom}
            />
          }
        />

        {/* ✏️ EDITAR CLIENTE */}
        <Route
          path="/editar-cliente/:id"
          element={
            <EditarDatosCliente
              listCustom={listCustom}
              updateCliente={updateCliente}
            />
          }
        />

        {/* 🏍️ GESTIÓN DE MOTOS */}
        <Route
          path="/admin/motos/:id"
          element={
            <ListBike listBikes={listBikes} listTechnical={listTechnical} />
          }
        />
        <Route
          path="/admin/motosadmin/:id"
          element={<ListBikeadmin listBikes={listBikes} />}
        />

        {/* 📊 DATOS TÉCNICOS */}
        <Route
          path="/custom/datos-tecnicos/:id"
          element={
            <TechnicalDataCustomer
              handleChange={handleChange}
              formData={formData}
              listTechnical={listTechnical}
            />
          }
        />
        <Route
          path="/admin/datos-tecnicos-admin/:id"
          element={<TechnicalDataAdmin listTechnical={listTechnical} />}
        />

        {/* 📝 FORMULARIOS */}
        <Route
          path="/formsCustom"
          element={
            <FormsCustom
              handleChange={handleChangeClientes}
              clientData={clientData}
              createCliente={createCliente}
            />
          }
        />
        <Route path="/nuevo-usuario" element={<FormNewUser />} />
        <Route
          path="/FormBike"
          element={
            <FormBike
              handleChangeMotos={handleChangeMotos}
              motoData={motoData}
            />
          }
        />
        <Route
          path="/FormtechnicalDataCustomer"
          element={
            <FormTechnicalDataCustomer
              handleChange={handleChange}
              formData={formData}
            />
          }
        />
        <Route
          path="/TechnicalDataCustomer"
          element={<TechnicalDataCustomer />}
        />
        <Route path="/TechnicalDataAdmin" element={<TechnicalDataAdmin />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
