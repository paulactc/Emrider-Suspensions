import "../styles/App.scss";
import React, { useState } from "react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import LandingPage from "./layout/LandingPage";
import ListCustom from "../components/Page.Custom/ListCustom";

import data from "../data/ListBikes.json";
import TechnicalDataCustomer from "./TechnicalDataCustomer";

function App() {
  //VARIABLES DE ESTADO

  const [listBikes, setListBikes] = useState(data);

  const [filters, setFilters] = useState({
    Cliente: "",
    Matricula: "",
  });

  //EVENTOS

  const handleInputFilter = (ev) => {
    const { id, value } = ev.target;
    setFilters({
      ...filters,
      [id]: value,
    });
  };

  const filteredBikes = listBikes
    .filter((eachBikes) =>
      eachBikes.Cliente.toLocaleLowerCase().includes(
        filters.Cliente.toLocaleLowerCase()
      )
    )
    .filter((eachBikes) => eachBikes.Matricula.includes(filters.Matricula));

  const handleButton = (ev) => {
    ev.preventDefault();
    console.log("has hecho click");
  };

  return (
    <>
      <Header />
      <main className="main">
        <form className="filters">
          <label htmlFor="filterCustom">Busqueda de cliente</label>
          <input
            id="Cliente"
            type="text"
            name="filterName"
            onInput={handleInputFilter}
            value={filters.Cliente}
          ></input>

          <label htmlFor="filterEnrolment">matricula de motocicleta</label>
          <input
            id="Matricula"
            name="filterEnrolment"
            type="text"
            onInput={handleInputFilter}
            value={filters.Matricula}
          ></input>
        </form>
        <ListCustom bikes={filteredBikes} />

        <LandingPage handleButton={handleButton} />
        <TechnicalDataCustomer />
      </main>

      <Footer />
    </>
  );
}

export default App;
