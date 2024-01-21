import React from "react";
import { useNavigate } from "react-router-dom";
import { ManagerContextProvider } from "../context/ManagerContext";
import { useUser } from "./UserContext";
import Navbar from "../components/manager/Navbar";
import View from "../components/manager/View";
import "../index.css";

const ManagerPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user || user.userType !== "manager") {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <ManagerContextProvider>
      <div className="container-fluid mt-3">
        <Navbar />
        <View />
      </div>
    </ManagerContextProvider>
  );
};

export default ManagerPage;
