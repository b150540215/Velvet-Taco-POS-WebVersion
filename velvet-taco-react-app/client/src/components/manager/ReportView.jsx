import React, { useContext } from "react";
import { ManagerContext } from "../../context/ManagerContext";

const ReportView = () => {
  const { data } = useContext(ManagerContext);
  console.log(data);

  const {
    currentPressed,
    tableData,
    requestRefresh,
    setRequestRefresh,
    viewEntriesCount,
  } = useContext(ManagerContext);

  return <div>ReportView</div>;
};

export default ReportView;
