import React from "react";
import { useNavigate } from "react-router-dom";
import Cart from "../components/cashier/Cart";
import Menu from "../components/cashier/Menu";
import Navbar from "../components/cashier/Navbar";
import { CashierContextProvider } from "../context/CashierContext";
import "../index.css";
import { useUser } from "./UserContext";
// import Header from "../../components/Header";

const CashierPage = () => {
  const { user } = useUser(); // Access user context
  const navigate = useNavigate();

  // Redirect if not a cashier
  React.useEffect(() => {
    if (!user || user.userType !== "cashier") {
      navigate("/"); // Redirect to an appropriate route
    }
  }, [user, navigate]);
  return (
    <CashierContextProvider>
      <div className="split-container">
        <div className="left-side menu-container">
          <div className="menu-background"></div>
          <div className="menu-overlay"></div>
          <Navbar />
          <Menu className="menu-content mt-2" />
        </div>
        <div className="right-side">
          <Cart></Cart>
        </div>
      </div>
    </CashierContextProvider>
  );
};

export default CashierPage;
