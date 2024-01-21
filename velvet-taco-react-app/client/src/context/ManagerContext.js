import React, { useState, createContext } from "react";

export const ManagerContext = createContext();

export const ManagerContextProvider = (props) => {
  const [currentView, setCurrentView] = useState("tables");
  const [currentPressed, setCurrentPressed] = useState("inventory");
  const [tableData, setTableData] = useState();
  const [viewEntriesCount, setViewEntriesCount] = useState(10);
  const [reportDates, setReportDates] = useState({});
  const [requestRefresh, setRequestRefresh] = useState(false);

  return (
    <ManagerContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentPressed,
        setCurrentPressed,
        tableData,
        setTableData,
        viewEntriesCount,
        setViewEntriesCount,
        reportDates,
        setReportDates,
        requestRefresh,
        setRequestRefresh,
      }}
    >
      {props.children}
    </ManagerContext.Provider>
  );
};
