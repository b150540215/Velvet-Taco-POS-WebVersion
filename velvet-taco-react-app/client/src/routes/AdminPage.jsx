import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/admin/Navbar";
import View from "../components/admin/View";
import { AdminContextProvider } from "../context/AdminContext";
import "../index.css";
import { useUser } from "./UserContext";

const AdminPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user || user.userType !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <AdminContextProvider>
      <div className="container-fluid mt-3">
        <Navbar />
        <View />
      </div>
    </AdminContextProvider>
  );
};

export default AdminPage;
