import React, { createContext, useState } from "react";

export const AdminContext = createContext();

export const AdminContextProvider = (props) => {
  const [currentView, setCurrentView] = useState("tables");
  const [currentPressed, setCurrentPressed] = useState("users");
  const [tableData, setTableData] = useState();
  const [viewEntriesCount, setViewEntriesCount] = useState(10);
  const [requestRefresh, setRequestRefresh] = useState(false);

  return (
    <AdminContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentPressed,
        setCurrentPressed,
        tableData,
        setTableData,
        viewEntriesCount,
        setViewEntriesCount,
        requestRefresh,
        setRequestRefresh,
      }}
    >
      {props.children}
    </AdminContext.Provider>
  );
};
