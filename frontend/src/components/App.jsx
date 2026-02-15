import "../styles/App.scss";
import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import Footer from "./layout/Footer.jsx";
import Header from "./layout/Header";
import LandingPage from "./layout/LandingPage";
import ListCustom from "./Page.Custom/ListCustom";
import FormNewUser from "./Page.Custom/FormNewUser";
import ForgotPassword from "./Page.Custom/ForgotPassword";
import ResetPassword from "./Page.Custom/ResetPassword";
import TechnicalDataCustomer from "./user/TechnicalDataCustomer";

import Cliente from "./user/Cliente";
import ListBike from "./Page.Bike/ListBike";
import ListBikeadmin from "./Page.Bike/ListBikeadmin";
import TechnicalDataAdmin from "./admin/forms/TechnicalDataAdmin";
import FormTechnicalFF from "./admin/forms/FormTechnicalFF.jsx";
import FormTechnicalRR from "./admin/forms/FormTechnicalRR.jsx";
import FormTechnicalDataWithClientData from "./admin/forms/FormTechnicalDataWithClientData";

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

  // Cargar clientes desde el backend (con reintento automático)
  useEffect(() => {
    let cancelled = false;

    const fetchClientes = async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const clientes = await apiService.getClientes();
          if (!cancelled) {
            setListCustom(clientes);
            setLoading(false);
          }
          return;
        } catch (err) {
          console.error(`Intento ${attempt + 1}/2 falló:`, err.message);
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }
      if (!cancelled) setLoading(false);
    };

    fetchClientes();
    return () => { cancelled = true; };
  }, []);

  const [filters, setFilters] = useState({
    Nombre: "",
    Apellidos: "",
    telefono: "",
  });

  const listBikes = dataBike;
  const listTechnical = dataTechnical;
  const listUsers = dataUsers;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
              loading={loading}
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
              loading={loading}
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

        {/* 🔑 RECUPERACION DE CONTRASEÑA */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* 📝 FORMULARIOS */}
        <Route path="/nuevo-usuario" element={<FormNewUser />} />

        <Route
          path="/TechnicalDataCustomer"
          element={<TechnicalDataCustomer />}
        />
        <Route path="/TechnicalDataAdmin" element={<TechnicalDataAdmin />} />

        <Route
          path="/admin/form-technical-ff/:motoId"
          element={
            <FormTechnicalDataWithClientData
              tipoSuspension="FF"
              formData={formData}
            />
          }
        />

        <Route
          path="/admin/form-technical-rr/:motoId"
          element={
            <FormTechnicalDataWithClientData
              tipoSuspension="RR"
              formData={formData}
            />
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
