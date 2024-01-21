import React, { Fragment, useEffect, useContext, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import AddButton from "./AddButton";
import EntrySelector from "./EntrySelector";
import WarningModal from "../manager/WarningModal";
import UpdateModal from "../manager/UpdateModal";
// import OptionsTableCell from "../manager/OptionsTableCell";
// import RawInputCell from "../manager/RawInputCell";
import "../../index.css";

const TableView = () => {
  const {
    currentPressed,
    tableData,
    requestRefresh,
    setRequestRefresh,
    viewEntriesCount,
  } = useContext(AdminContext);

  // searching states
  const [searchQuery, setSearchQuery] = useState("");
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredRows = tableData
    ? tableData.data.data.filter((row) =>
        Object.values(row).some(
          (value) =>
            value &&
            (matchWholeWord && searchQuery.trim().length > 0
              ? value.toString().toLowerCase() === searchQuery.toLowerCase()
              : value
                  .toString()
                  .toLowerCase()
                  .includes(searchQuery.trim().toLowerCase()))
        )
      )
    : [];

  /* for pretty display of modal confirming deletion and updates */
  const [warningModalIsOpen, setWarningModalIsOpen] = useState(false);
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false);
  const [cellValue, setCellValue] = useState(["", ""]);
  const [field, setField] = useState("");
  const [table, setTable] = useState("");
  const [pkey, setPkey] = useState("");
  const [pkeyValue, setPkeyValue] = useState("");
  const [keyToUpdate, setKeyToUpdate] = useState("");
  const [rowData, setRowData] = useState({});

  const handleDelete = (_table, _pkey, _pkey_value, _row_data) => {
    setTable(_table);
    setPkey(_pkey);
    setPkeyValue(_pkey_value);
    setRowData(_row_data);
    setWarningModalIsOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      let url = process.env.REACT_APP_SERVER_URL + `api/admin/tables`;
      console.log(url);

      /* To delete a menu item you must delete its associatd ingredients.
      use a different route for that */
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table: table,
          pkey: pkey,
          pkey_value: pkeyValue,
        }),
      });
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      setRequestRefresh(!requestRefresh);
    } catch (err) {
      console.error(err.message);
    }

    setWarningModalIsOpen(false);
  };

  const handleWarningModalClose = () => {
    setWarningModalIsOpen(false);
  };

  const handleCellInputChange = async (
    e,
    _field,
    _table,
    _pkey,
    _pkey_value,
    _key,
    initial
  ) => {
    setCellValue([initial, e]);
    setField(_field);
    setTable(_table);
    setPkey(_pkey);
    setPkeyValue(_pkey_value);
    setKeyToUpdate(_key);
    setUpdateModalIsOpen(true);
  };

  const handleUpdateConfirm = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_SERVER_URL + "api/admin/tables",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            table: table,
            pkey: pkey,
            pkey_value: pkeyValue,
            key: keyToUpdate,
            value: cellValue[1],
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      setRequestRefresh(!requestRefresh);
    } catch (err) {
      console.error(err.message);
    }

    setUpdateModalIsOpen(false);
  };

  const handleUpdateModalClose = () => {
    setUpdateModalIsOpen(false);
    setCellValue(cellValue[0], cellValue[0]);
  };

  /* Entry control for table */
  const [lowerBoundView, setLowerBoundView] = useState(0);
  const [upperBoundView, setUpperBoundView] = useState(
    Math.min(viewEntriesCount, filteredRows.length)
  );
  // const [maxResults, setMaxResults] = useState(0);
  const [currentTableIndex, setCurrentTableIndex] = useState(1);
  const [maxTableIndex, setMaxTableIndex] = useState(0);

  useEffect(() => {
    if (
      filteredRows.length < currentTableIndex * viewEntriesCount &&
      maxTableIndex !== currentTableIndex
    ) {
      setCurrentTableIndex(1);
    }

    setLowerBoundView((currentTableIndex - 1) * viewEntriesCount);
    setUpperBoundView(
      Math.min(currentTableIndex * viewEntriesCount, filteredRows.length)
    );
    setMaxTableIndex(Math.ceil(filteredRows.length / viewEntriesCount));
  }, [currentTableIndex, filteredRows, viewEntriesCount]);

  const createIndexButton = (className, text, index, disabled = false) => {
    return (
      <button
        className={className}
        disabled={disabled}
        onClick={index > 0 ? () => setCurrentTableIndex(index) : null}
      >
        {text}
      </button>
    );
  };

  const generateIndexButtons = () => {
    return (
      <Fragment>
        {createIndexButton(
          "btn",
          "Previous",
          currentTableIndex - 1,
          currentTableIndex === 1
        )}
        {currentTableIndex !== 1 && createIndexButton("btn", "1", 1)}
        {currentTableIndex > 3 && createIndexButton("btn", "...", 0, true)}

        {currentTableIndex > 2 &&
          createIndexButton(
            "btn",
            currentTableIndex - 1,
            currentTableIndex - 1
          )}

        {/* Active Index */}
        {createIndexButton(
          "btn btn-primary",
          <strong>{currentTableIndex}</strong>,
          0
        )}

        {currentTableIndex < maxTableIndex - 1 &&
          createIndexButton(
            "btn",
            currentTableIndex + 1,
            currentTableIndex + 1
          )}
        {currentTableIndex < maxTableIndex - 2 &&
          createIndexButton("btn ", "...", 0, true)}
        {currentTableIndex !== maxTableIndex &&
          createIndexButton("btn", maxTableIndex, maxTableIndex)}
        {createIndexButton(
          "btn",
          "Next",
          currentTableIndex + 1,
          currentTableIndex === maxTableIndex
        )}
      </Fragment>
    );
  };

  return (
    <div className="container-fluid">
      <div className="list-group">
        <div className="search-container mt-3 mb-1 d-flex align-items-center">
          <input
            type="text"
            placeholder="Search by any column..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <label className="mt-2 ml-1">
            <input
              className="mr-1"
              type="checkbox"
              checked={matchWholeWord}
              onChange={() => setMatchWholeWord(!matchWholeWord)}
            />
            Match whole word
          </label>
          <div className="ml-auto">
            Show <EntrySelector /> entries
          </div>
        </div>
        <table className="table table-hover table-dark">
          <thead>
            <tr class="bg-primary" style={{ textAlign: "center" }}>
              {currentPressed === "users" && (
                <Fragment>
                  <th scope="col">Username</th>
                  <th scope="col">Password</th>
                  <th scope="col">Email</th>
                  <th scope="col">User Role</th>
                  <th scope="col">Owner</th>
                  <th scope="col"></th>
                </Fragment>
              )}
            </tr>
          </thead>
          <AddButton />
          <tbody style={{ textAlign: "center" }}>
            {filteredRows &&
              currentPressed === "users" &&
              filteredRows.slice(lowerBoundView, upperBoundView).map((row) => {
                return (
                  <tr key={row.username}>
                    <td>{row.username}</td>
                    <td>{row.password}</td>
                    <td>{row.email}</td>
                    <td>{row.user_type}</td>
                    <td>{row.name}</td>
                    <td>
                      <button
                        class="btn btn-danger"
                        onClick={() =>
                          handleDelete("users", "username", row.username, row)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <WarningModal
          isOpen={warningModalIsOpen}
          onRequestClose={handleWarningModalClose}
          onDeleteConfirm={handleDeleteConfirm}
          rowData={rowData}
        />
        <UpdateModal
          isOpen={updateModalIsOpen}
          onRequestClose={handleUpdateModalClose}
          onUpdateConfirm={handleUpdateConfirm}
          field={field}
          from={cellValue[0]}
          to={cellValue[1]}
        />
        <div
          className={`d-flex align-items-center mb-3 ${
            filteredRows.length < 1 ? "m-auto" : ""
          }`}
        >
          Showing {filteredRows.length > 0 ? lowerBoundView + 1 : 0} to{" "}
          {upperBoundView} of {filteredRows.length} entries{" "}
          {filteredRows.length !== tableData.max_results &&
            `(filtered from ${tableData.max_results} total entries)`}
          <div className="ml-auto">
            {filteredRows.length > 0 && generateIndexButtons()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableView;
