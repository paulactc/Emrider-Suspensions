import "../styles/App.scss";
import React, { useState } from "react";
import Footer from "./layout/Footer";
import Header from "./layout/Header";
import LandingPage from "./layout/LandingPage";
import ListCustom from "./Page.Custom/ListCustom";
import { Route, Routes } from "react-router";
import FormsCustom from "./admin/forms/FormsCustom";
import FormTechnicalDataCustom from "./admin/forms/FormTechnicalDataCustomer";
import dataBike from "../data/ListBike.json";
import dataCustom from "../data/ListCustom.json";
import dataTechnical from "../data/TechinalDatas.json";

import TechnicalDataCustomer from "./user/TechnicalDataCustomer";
import FormBike from "./admin/forms/FormBike";
import Cliente from "./user/Cliente";
import ListBike from "./Page.Bike/ListBike";
function App() {
  //VARIABLES DE ESTADO
  const [filters, setFilters] = useState({
    Cliente: "",
    telefono: "",
  });

  const [listCustom, setListCustom] = useState(dataCustom);
  const [listBikes, setListBikes] = useState(dataBike);
  const [listTechnical, setListTechnical] = useState(dataTechnical);

  const [clientData, setClientData] = useState({
    Cliente: "", // "Juan Perez Martinez"
    Email: "", // "juan@hotmail.es"
    Teléfono: "", // 722439479
    Dirección: "", // "C/Delicias 20"
    CódigoPostal: "", // 11130
    Población: "", // "Chiclana de la Frontera"
    Provincia: "", // "Cádiz"
  });

  const [motoData, setMotoData] = useState({
    clienteId: null, // Referencia al cliente
    Marca: "", // "BMW" o "Yamaha"
    Modelo: "", // "R1200GS" o "MT-07"
    Añodefabricacion: "", // 2020 (¿por qué tienes "Añodefabricacion" y "anoFabricacion"?)
    Matricula: "", // "1234GGS"
  });

  const [formData, setFormData] = useState({
    // Datos del servicio
    pesoPiloto: "",
    disciplina: "",
    numeroOrden: "",
    observaciones: "",
    // Datos Suspensiones
    marca: "",
    modelo: "",
    año: "",
    referenciasuspension: "",
    // Datos Técnicos - Spring Data
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
    // Oil & Gas
    oil: "",
    gas: "",
    // Compression
    compressionOriginal: "",
    compressionModification: "",
    // Rebound
    reboundOriginal: "",
    reboundModification: "",
    // Compression Adjusters
    originalCompressionAdjuster: "",
    modifiedCompressionAdjuster: "",
  });

  //EVENTOS

  const handleInputFilter = (ev) => {
    const { id, value } = ev.target;
    setFilters({
      ...filters,
      [id]: value,
    });
  };

  const filteredCustom = listCustom
    .filter((eachCustom) => {
      // Verificar que Cliente existe y filtrar
      if (!filters.Cliente) return true;
      return eachCustom.Cliente?.toLowerCase().includes(
        filters.Cliente.toLowerCase()
      );
    })
    .filter((eachCustom) => {
      // Verificar que telefono existe y filtrar
      if (!filters.telefono) return true;
      return eachCustom.telefono
        ?.toString()
        .includes(filters.telefono.toString());
    });

  const handleButton = () => {
    console.log("has hecho click");
  };
  //FORMULARIO DE LOS CLIENTES
  const handleChangeClientes = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  //FORMULARIO DE LOS DATOS TÉCNICOS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //FORMULARIO DE LOS DATOS DE MOTOS
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
      <Routes>
        <Route
          path="/"
          element={<LandingPage handleButton={handleButton} />}
        ></Route>
        <Route
          path="/admin/clientes"
          element={
            <ListCustom
              Custom={filteredCustom}
              handleInputFilter={handleInputFilter}
              filters={filters}
            />
          }
        />

        <Route
          path="/cliente"
          element={
            <Cliente
              Custom={filteredCustom}
              handleInputFilter={handleInputFilter}
              filters={filters}
            />
          }
        />

        <Route path="/admin/motos" element={<ListBike />} />

        <Route
          path="/formsCustom"
          element={
            <FormsCustom
              handleChange={handleChangeClientes}
              clientData={clientData}
            />
          }
        />
        <Route
          path="/FormTechnicalDataCustom"
          element={
            <FormTechnicalDataCustom
              handleChange={handleChange}
              formData={formData}
            />
          }
        />

        <Route
          path="/FormBike"
          element={
            <FormBike handleChangeMotos={handleChange} motoData={motoData} />
          }
        />
        <Route
          path="/TechnicalDataCustomer"
          element={<TechnicalDataCustomer />}
        />
      </Routes>
      <main className="main"></main>

      <Footer />
    </>
  );
}

export default App;
