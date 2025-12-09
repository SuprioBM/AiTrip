import React from "react";  
import { Outlet } from "react-router-dom";
import Navigation from "./components/header";
import Footer from "./components/footer";

const Layout = () => {
  return (
    <>
      <Navigation />
      <main>
      <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
