import "../styles/App.scss";
import React, { useState } from "react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import LandingPage from "./layout/LandingPage";
import ListCustom from "../components/Page.Custom/ListCustom";
import { Route, Routes, Link } from "react-router";

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
      <Routes>
        <Route
          path="/"
          element={<LandingPage handleButton={handleButton} />}
        ></Route>
        <Route
          path="/list"
          element={
            <ListCustom
              bikes={filteredBikes}
              handleInputFilter={handleInputFilter}
            />
          }
        />
      </Routes>
      <main className="main">
        <TechnicalDataCustomer />
      </main>

      <Footer />
    </>
  );
}

export default App;
