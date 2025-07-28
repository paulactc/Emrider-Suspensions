import "../styles/App.scss";
import React, { useState } from "react";
import Footer from "./layout/Footer";
import Header from "./layout/Header";
import LandingPage from "./layout/LandingPage";
import ListCustom from "./Page.Custom/ListCustom";
import { Route, Routes } from "react-router";
import FormsCustom from "./admin/forms/FormsCustom";
import dataBike from "../data/ListBike.json";
import dataCustom from "../data/ListCustom.json";
import dataTechnical from "../data/TechinalDatas.json";
import dataUsers from "../data/ListUsers.json";
import FormNewUser from "./Page.Custom/FormNewUser";
import TechnicalDataCustomer from "./user/TechnicalDataCustomer";
import FormBike from "./admin/forms/FormBike";
import FormTechnicalDataCustomer from "./admin/forms/FormTechnicalDataCustomer";
import Cliente from "./user/Cliente";
import ListBike from "./Page.Bike/ListBike";
import ListBikeadmin from "./Page.Bike/ListBikeadmin";
import TechnicalDataAdmin from "./admin/forms/TechnicalDataAdmin";
import { useEffect } from "react";
import { useLocation } from "react-router";
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const listCustom = dataCustom;

  const [filters, setFilters] = useState({
    Cliente: "",
    telefono: "",
  });

  const listBikes = dataBike;
  const listTechnical = dataTechnical;
  const listUsers = dataUsers;

  const [clientData, setClientData] = useState({
    Cliente: "",
    Email: "",
    teléfono: "",
    Dirección: "",
    CódigoPostal: "",
    Población: "",
    Provincia: "",
  });

  const [motoData, setMotoData] = useState({
    clienteId: null,
    id: "",
    Marca: "",
    Modelo: "",
    Añodefabricacion: "",
    Matricula: "",
  });

  const [formData, setFormData] = useState({
    pesoPiloto: "",
    disciplina: "",
    numeroOrden: "",
    observaciones: "",
    marca: "",
    modelo: "",
    año: "",
    referenciasuspension: "",
    mainRate: "",
    springRef: "",
    length: "",
    numeroSpiras: "",
    outer: "",
    inner: "",
    spire: "",
    rebSpring: "",
    totalLength: "",
    stroke: "",
    shaft: "",
    piston: "",
    internalSpacer: "",
    height: "",
    strokeToBumpRubber: "",
    rod: "",
    reboundSpring: "",
    springLength: "",
    springUpperDiameter: "",
    springLowerDiameter: "",
    headRodEnd: "",
    upperMount: "",
    lowerMount: "",
    oil: "",
    gas: "",
    compressionOriginal: "",
    compressionModification: "",
    reboundOriginal: "",
    reboundModification: "",
    originalCompressionAdjuster: "",
    modifiedCompressionAdjuster: "",
  });

  useEffect(() => {
    console.log("=== CAMBIO EN LISTCUSTOM ===");
    console.log("listCustom actualizado:", listCustom);

    if (Array.isArray(listCustom)) {
      const undefinedCount = listCustom.filter(
        (item) => item === undefined
      ).length;
      const nullCount = listCustom.filter((item) => item === null).length;
      const validCount = listCustom.filter(
        (item) => item && typeof item === "object" && item.Cliente
      ).length;

      console.log(
        `Stats: ${validCount} válidos, ${undefinedCount} undefined, ${nullCount} null`
      );
    }
  }, [listCustom]);

  useEffect(() => {
    console.log("=== VERIFICANDO DATOS ORIGINALES ===");
    console.log("1. dataCustom importado:", dataCustom);
    console.log("2. Tipo de dataCustom:", typeof dataCustom);
    console.log("3. Es array dataCustom:", Array.isArray(dataCustom));
    console.log("4. Longitud dataCustom:", dataCustom?.length);

    if (Array.isArray(dataCustom)) {
      dataCustom.forEach((item, index) => {
        console.log(`5. dataCustom[${index}]:`, item);
        console.log(`   - Tipo: ${typeof item}`);
        console.log(`   - Es null: ${item === null}`);
        console.log(`   - Es undefined: ${item === undefined}`);
        console.log(`   - Tiene Cliente: ${item?.Cliente || "NO"}`);
        console.log(
          `   - Keys disponibles:`,
          item ? Object.keys(item) : "ninguna"
        );
      });
    }

    console.log("6. Estado inicial listCustom:", listCustom);
    console.log(
      "7. Son iguales dataCustom y listCustom:",
      dataCustom === listCustom
    );
  }, []);

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

    const cleanedData = data.filter((customer) => {
      if (!customer || typeof customer !== "object") {
        console.warn("Cliente inválido encontrado:", customer);
        return false;
      }

      if (!customer.Cliente || customer.Cliente.trim() === "") {
        console.warn("Cliente sin nombre encontrado:", customer);
        return false;
      }

      return true;
    });

    console.log("Datos limpios:", cleanedData);

    const filteredData = cleanedData.filter((customer) => {
      if (filters.Cliente && filters.Cliente.trim() !== "") {
        const clientName = customer.Cliente.toLowerCase();
        const searchTerm = filters.Cliente.toLowerCase();
        if (!clientName.includes(searchTerm)) {
          return false;
        }
      }

      if (filters.telefono && filters.telefono.trim() !== "") {
        const phoneNumber = customer.telefono || "";
        const searchPhone = filters.telefono.toString();
        if (!phoneNumber.toString().includes(searchPhone)) {
          return false;
        }
      }

      return true;
    });

    console.log("Datos filtrados:", filteredData);
    return filteredData;
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

  return (
    <>
      <Header />
      <ScrollToTop />

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage handleButton={handleButton} listUsers={listUsers} />
          }
        />
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
        <Route
          path="/cliente"
          element={<Cliente listCustom={listCustom} listBikes={listBikes} />}
        />

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
        <Route
          path="/formsCustom"
          element={
            <FormsCustom
              handleChange={handleChangeClientes}
              clientData={clientData}
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
