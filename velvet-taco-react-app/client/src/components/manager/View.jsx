import React, { Fragment, useContext, useEffect } from "react";
import { ManagerContext } from "../../context/ManagerContext";
import AddButton from "./AddButton";
import EntrySelector from "./EntrySelector";
import ReportView from "./ReportView";
import TableView from "./TableView";
import WarningModal from "./WarningModal";

const View = () => {
  const {
    currentView,
    currentPressed,
    setCurrentPressed,
    tableData,
    setTableData,
    viewEntriesCount,
    reportDates,
    setReportData,
    requestRefresh,
  } = useContext(ManagerContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url =
          process.env.REACT_APP_SERVER_URL + `api/manager/${currentView}/`;
        if (currentView === "tables") {
          url += `?table=${currentPressed}&limit=-1`;
        } else {
          url += `${currentPressed}?`;
          if (reportDates.startDate) {
            url += `startDate=${reportDates.startDate}`;
          }
          if (reportDates.endDate) {
            url += `&endDate=${reportDates.endDate}`;
          }
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        const _data = await response.json();

        setTableData(_data);
        setCurrentPressed(currentPressed);
      } catch (err) {
        console.error(err.message);
      }
    };
    if (currentPressed) {
      fetchData();
    }
  }, [
    currentPressed,
    currentView,
    viewEntriesCount,
    setTableData,
    setReportData,
    requestRefresh,
  ]);

  return (
    <div>
      {tableData && (
        <>
          {/* <AddButton /> */}
          {/* Show <EntrySelector /> entries */}
          <TableView />
        </>
      )}
    </div>
  );
};

export default View;
