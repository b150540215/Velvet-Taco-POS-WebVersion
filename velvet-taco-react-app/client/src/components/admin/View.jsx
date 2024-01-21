import React, { Fragment, useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";
import TableView from "./TableView";

const View = () => {
  const {
    currentView,
    currentPressed,
    tableData,
    setTableData,
    viewEntriesCount,
    requestRefresh,
  } = useContext(AdminContext);

  // hardcoded for now. when it is deployed, it will go to the link below
  //const SERVERURL = "http://localhost:3001/";
  //const SERVERURL = "https://project-3-server-d4yp.onrender.com/";

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url =
          process.env.REACT_APP_SERVER_URL + `api/admin/${currentView}/`;

        url += `?table=${currentPressed}&limit=${viewEntriesCount}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        const _data = await response.json();
        console.log("data: ", _data);

        setTableData(_data);

        // currentView === "tables" ? setTableData(_data) : setReportData(_data);
        // setData(_data);
      } catch (err) {
        console.error(err.message);
      }
    };
    if (currentPressed) {
      fetchData();
    }
  }, [currentPressed, currentView, viewEntriesCount, requestRefresh]);

  return <div>{tableData && <TableView />}</div>;
};

export default View;
