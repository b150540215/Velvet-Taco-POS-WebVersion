import React, { Fragment, useEffect, useContext, useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import { ManagerContext } from "../../context/ManagerContext";
import AddButton from "./AddButton";
import EntrySelector from "./EntrySelector";
import WarningModal from "./WarningModal";
import UpdateModal from "./UpdateModal";
import OptionsTableCell from "./OptionsTableCell";
import RawInputCell from "./RawInputCell";
import MultiOptionsTableCell from "./MultiOptionsTableCell";
import UpdateIngredientModal from "./UpdateIngredientModal";
import "../../index.css";

const TableView = () => {
  const {
    currentView,
    currentPressed,
    tableData,
    setReportDates,
    requestRefresh,
    setRequestRefresh,
    viewEntriesCount,
  } = useContext(ManagerContext);

  // sorting states
  const [sortColumn, setSortColumn] = useState("order_id");
  const [sortDirection, setSortDirection] = useState(false); // false -> desc

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(!sortDirection);
    } else {
      setSortColumn(column);
      setSortDirection(true);
    }
  };

  const sortData = () => {
    return [...filteredRows].sort((a, b) => {
      const lhs = a[sortColumn];
      const rhs = b[sortColumn];
      const lhsString = String(lhs || "");
      const rhsString = String(rhs || "");

      const isNumeric = !isNaN(lhs) && !isNaN(rhs);

      if (isNumeric) {
        return sortDirection
          ? parseFloat(lhs) - parseFloat(rhs)
          : parseFloat(rhs) - parseFloat(lhs);
      } else {
        return sortDirection
          ? lhsString.localeCompare(rhsString)
          : rhsString.localeCompare(lhsString);
      }
    });
  };

  // const generateSortIcons = (column) => {
  //   return (
  //     <div className="sort-icons">
  //       <FontAwesomeIcon
  //         icon={faSortUp}
  //         className="active"
  //         // className={`icon ${
  //         //   sortColumn === column && sortDirection === "asc" ? "active" : ""
  //         // }`}
  //       />
  //       <FontAwesomeIcon
  //         icon={faSortDown}
  //         className={`icon ${
  //           sortColumn === column && sortDirection === "desc" ? "active" : ""
  //         }`}
  //       />
  //     </div>
  //   );
  // };

  // menus for the menu table to select "type"
  const [menus, setMenus] = useState([]);
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_SERVER_URL + "api/cashier/menus"
        );
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        const _menus = await response.json();

        setMenus(_menus.data.data.map((item) => item.type));
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchMenus();
  }, []);

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
  const [updateIngredModalIsOpen, setUpdateIngredModalIsOpen] = useState(false);
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
      let url = process.env.REACT_APP_SERVER_URL + `api/manager/tables`;
      console.log(url);

      /* To delete a menu item you must delete its associatd ingredients.
      use a different route for that */
      if (table === "menu") {
        url += "/menu";
      }
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          table === "menu"
            ? JSON.stringify({
                item_name: pkeyValue,
              })
            : JSON.stringify({
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

  const handleMultiInputCellChange = async (
    e,
    _field,
    _table,
    _pkey,
    _pkey_value
  ) => {
    setCellValue([
      e[0].map((item) => item.label).join(", "),
      e[1].map((item) => item.label).join(", "),
    ]);
    setField(_field);
    setPkeyValue(_pkey_value);
    setKeyToUpdate(e[1]);
    setUpdateIngredModalIsOpen(true);
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

  const handleUpdateIngredientsConfirm = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_SERVER_URL +
          "api/manager/tables/inventory/ingredients",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item: pkeyValue,
            ingredients: keyToUpdate,
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

    setUpdateIngredModalIsOpen(false);
    // window.alert("Successfully updated entry.");
  };

  const handleUpdateConfirm = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_SERVER_URL + "api/manager/tables",
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
    // window.alert("Successfully updated entry.");
  };

  const handleUpdateModalClose = () => {
    setUpdateModalIsOpen(false);
    setUpdateIngredModalIsOpen(false);
    setCellValue(cellValue[0], cellValue[0]);
    // cell.target.innerText = cellValue[0];
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

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const handleStartDateChange = (value) => {
    setStartDate(value);
  };
  const handleEndDateChange = (value) => {
    setEndDate(value);
  };

  useEffect(() => {
    setReportDates({
      startDate: startDate.replace(/-/g, "/"),
      endDate: endDate.replace(/-/g, "/"),
    });
    setRequestRefresh(!requestRefresh);
  }, [startDate, endDate]);

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
          {currentView === "reports" && currentPressed !== "restock" && (
            <div className="ml-auto">
              Start Date:{" "}
              <input
                className="mr-4"
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                max={endDate || ""}
              ></input>
              End Date:{" "}
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                min={startDate || ""}
              ></input>
            </div>
          )}
          <div className="ml-auto">
            Show <EntrySelector /> entries
          </div>
        </div>
        <table className="table table-hover table-dark">
          <thead>
            <tr class="bg-primary" style={{ textAlign: "center" }}>
              {currentPressed === "orders" && (
                <Fragment>
                  <th scope="col">
                    Order ID
                    {/* {generateSortIcons("order-id")} */}
                  </th>
                  <th scope="col">
                    Date
                    {/* {generateSortIcons("date")} */}
                  </th>
                  <th scope="col">
                    Time
                    {/* {generateSortIcons("time")} */}
                  </th>
                  <th scope="col">
                    Cashier
                    {/* {generateSortIcons("cashier")} */}
                  </th>
                  <th scope="col">
                    Total ($)
                    {/* {generateSortIcons("total")} */}
                  </th>
                  <th scope="col">
                    Status
                    {/* {generateSortIcons("status")} */}
                  </th>
                  <th scope="col">
                    {/* <button className="btn btn-success">Add</button> */}
                  </th>
                </Fragment>
              )}
              {currentPressed === "inventory" && (
                <Fragment>
                  <th scope="col" onClick={() => handleSort("ingredient")}>
                    Ingredient
                  </th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Restock Quantity</th>
                  <th scope="col">Minimum Quantity</th>
                  <th scope="col"></th>
                </Fragment>
              )}
              {currentPressed === "menu" && (
                <Fragment>
                  {/* <th scope="col">Menu ID</th> */}
                  <th scope="col">Name</th>
                  <th scope="col">Calories</th>
                  <th scope="col">Price ($)</th>
                  <th scope="col">Type</th>
                  <th scope="col">Ingredients</th>
                  <th scope="col"></th>
                </Fragment>
              )}
              {currentPressed === "employees" && (
                <Fragment>
                  <th scope="col">Employee ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Pay ($/hr)</th>
                  <th scope="col">Schedule</th>
                  {/* <th scope="col"></th> */}
                </Fragment>
              )}
              {currentPressed === "product-usage" && (
                <Fragment>
                  <th scope="col">Ingredient</th>
                  <th
                    scope="col"
                    title="The amount sold during the time period start date to end date"
                  >
                    Units Sold
                  </th>
                  {/* <th
                    scope="col"
                    title="The amount sold during the time period start date to end date as a percentage"
                  >
                    % of Units Sold
                  </th>
                  <th
                    scope="col"
                    title="The date that the item will require restocking if it maintains the same usage rate"
                  >
                    Estimated Restock Date
                  </th> */}
                </Fragment>
              )}
              {currentPressed === "sales" && (
                <Fragment>
                  <th scope="col">Menu Item</th>
                  <th
                    scope="col"
                    title="The number of times the item was ordered from start date to end date"
                  >
                    # Ordered
                  </th>
                  <th
                    scope="col"
                    title="The amount of reveune generated by this item from start date to end date"
                  >
                    Reveune Generated
                  </th>
                </Fragment>
              )}
              {currentPressed === "excess" && (
                <Fragment>
                  <th scope="col">Ingredient</th>
                  <th
                    scope="col"
                    title="The amount sold during the time period start date to end date"
                  >
                    Units Sold
                  </th>
                  {/* <th
                    scope="col"
                    title="The percentage of ingredient's inventory sold since the start date to end date as a percentage"
                  >
                    % of Inventory Sold
                  </th> */}
                </Fragment>
              )}
              {currentPressed === "restock" && (
                <Fragment>
                  <th scope="col">Ingredient</th>
                  <th scope="col" title="The current amount on hand">
                    Quantity
                  </th>
                  <th
                    scope="col"
                    title="The quantity that the ingredient should be restocked at"
                  >
                    Restock Quantity
                  </th>
                </Fragment>
              )}
              {currentPressed === "sells-together" && (
                <Fragment>
                  <th scope="col">Menu Item 1</th>
                  <th scope="col">Menu Item 1 Count</th>
                  <th scope="col">Menu Item 2</th>
                  <th scope="col">Menu Item 2 Count</th>
                  <th
                    scope="col"
                    title="The number of times these two items were in the same order from start date to end date"
                  >
                    Count
                  </th>
                </Fragment>
              )}
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
              {/* <div className="refresh-icon" title="Refresh Table">
                <span onClick={() => setRequestRefresh(!requestRefresh)}>
                  &#x27f3;
                </span>
              </div> */}
            </tr>
          </thead>
          {currentView !== "reports" && <AddButton />}
          <tbody style={{ textAlign: "center" }}>
            {filteredRows &&
              currentPressed === "orders" &&
              sortData(filteredRows)
                .slice(lowerBoundView, upperBoundView)
                .map((row) => {
                  return (
                    <tr key={row.order_id}>
                      <td>{row.order_id}</td>
                      <td>{row.date}</td>
                      <td>{row.time}</td>
                      <td>{row.cashier}</td>
                      <td>{row.total ? row.total.toFixed(2) : ""}</td>
                      <OptionsTableCell
                        initialValue={row.status}
                        options={["Fulfilled", "Pending", "Cancelled"]}
                        onSave={(e) =>
                          handleCellInputChange(
                            e,
                            "Status",
                            "orders",
                            "order_id",
                            row.order_id,
                            "status",
                            row.status
                          )
                        }
                      />

                      <td>
                        <button
                          class="btn btn-danger"
                          onClick={() =>
                            handleDelete(
                              "orders",
                              "order_id",
                              row.order_id,
                              row
                            )
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
            {filteredRows &&
              currentPressed === "inventory" &&
              filteredRows.slice(lowerBoundView, upperBoundView).map((row) => {
                return (
                  <tr key={row.ingredient}>
                    <td>{row.ingredient}</td>
                    <RawInputCell
                      isInt={true}
                      type="number"
                      initialValue={row.quantity}
                      onSave={(e) =>
                        handleCellInputChange(
                          e,
                          "Quantity",
                          "inventory",
                          "ingredient",
                          row.ingredient,
                          "quantity",
                          row.quantity
                        )
                      }
                    />
                    <RawInputCell
                      isInt={true}
                      cellType="number"
                      initialValue={row.restock_quantity}
                      onSave={(e) =>
                        handleCellInputChange(
                          e,
                          "Restock Quantity",
                          "inventory",
                          "ingredient",
                          row.ingredient,
                          "restock_quantity",
                          row.restock_quantity
                        )
                      }
                    />
                    <RawInputCell
                      isInt={true}
                      cellType="number"
                      initialValue={row.min_quantity}
                      onSave={(e) =>
                        handleCellInputChange(
                          e,
                          "Minimum Quantity",
                          "inventory",
                          "ingredient",
                          row.ingredient,
                          "min_quantity",
                          row.min_quantity
                        )
                      }
                    />
                    <td>
                      <button
                        class="btn btn-danger"
                        onClick={() =>
                          handleDelete(
                            "inventory",
                            "ingredient",
                            row.ingredient,
                            row
                          )
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            {filteredRows &&
              currentPressed === "menu" &&
              filteredRows.slice(lowerBoundView, upperBoundView).map((row) => {
                return (
                  <tr key={row.menu_id}>
                    {/* <td>{row.menu_id}</td> */}
                    <RawInputCell
                      cellType="text"
                      initialValue={row.name}
                      onSave={(e) =>
                        handleCellInputChange(
                          e,
                          "Name",
                          "menu",
                          "menu_id",
                          row.menu_id,
                          "name",
                          row.name
                        )
                      }
                    />
                    <RawInputCell
                      isInt={true}
                      cellType="number"
                      initialValue={row.calories}
                      onSave={(e) =>
                        handleCellInputChange(
                          e,
                          "Calories",
                          "menu",
                          "menu_id",
                          row.menu_id,
                          "calories",
                          row.calories
                        )
                      }
                    />
                    <RawInputCell
                      isInt={false}
                      cellType="number"
                      initialValue={row.price}
                      onSave={(e) =>
                        handleCellInputChange(
                          e,
                          "Price",
                          "menu",
                          "menu_id",
                          row.menu_id,
                          "price",
                          row.price
                        )
                      }
                    />

                    <OptionsTableCell
                      initialValue={row.type}
                      options={menus}
                      onSave={(e) =>
                        handleCellInputChange(
                          e,
                          "Type",
                          "menu",
                          "menu_id",
                          row.menu_id,
                          "type",
                          row.type
                        )
                      }
                    />

                    <MultiOptionsTableCell
                      item={row.name}
                      onSave={(e) =>
                        handleMultiInputCellChange(
                          e,
                          "Ingredients",
                          "menu",
                          "menu_id",
                          row.name
                        )
                      }
                    />
                    <td>
                      <button
                        class="btn btn-danger"
                        onClick={() =>
                          /* we pass row.name as pkey even though it isn't the primary key because it needs the item name to delete from menu_inventory*/
                          handleDelete("menu", "item_name", row.name, [
                            row.name,
                            row.calories,
                            row.price,
                            row.type,
                          ])
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            {filteredRows &&
              currentPressed === "employees" &&
              filteredRows.slice(lowerBoundView, upperBoundView).map((row) => {
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{row.role}</td>
                    <td>{row.pay}</td>
                    <td>{row.schedule}</td>
                  </tr>
                );
              })}
            {filteredRows &&
              currentPressed === "product-usage" &&
              filteredRows.slice(lowerBoundView, upperBoundView).map((row) => {
                return (
                  <tr key={row.ingredient}>
                    <td>{row.ingredient}</td>
                    <td>{row.usage}</td>
                    {/* <td>some %</td>
                    <td>some date?</td> */}
                  </tr>
                );
              })}
            {filteredRows &&
              currentPressed === "sales" &&
              filteredRows.slice(lowerBoundView, upperBoundView).map((row) => {
                return (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.total_orders}</td>
                    <td>${row.total_orders * row.price}</td>
                  </tr>
                );
              })}
            {filteredRows &&
              currentPressed === "excess" &&
              filteredRows.slice(lowerBoundView, upperBoundView).map((row) => {
                return (
                  <tr key={row.ingredient}>
                    <td>{row.ingredient}</td>
                    <td>{row.totalcount}</td>
                    {/* <td>some %</td> */}
                    {/* <td>some date?</td> */}
                  </tr>
                );
              })}
            {filteredRows &&
              currentPressed === "restock" &&
              filteredRows.slice(lowerBoundView, upperBoundView).map((row) => {
                return (
                  <tr key={row.ingredient}>
                    <td>{row.ingredient}</td>
                    <td>{row.quantity}</td>
                    <td>{row.min_quantity}</td>
                  </tr>
                );
              })}
            {filteredRows &&
              currentPressed === "sells-together" &&
              filteredRows.slice(lowerBoundView, upperBoundView).map((row) => {
                return (
                  <tr key={row.uid}>
                    <td>{row.menu_item1}</td>
                    <td>{row.menu_item1_count}</td>
                    <td>{row.menu_item2}</td>
                    <td>{row.menu_item2_count}</td>
                    <td>{row.order_count}</td>
                  </tr>
                );
              })}
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
                          handleDelete("menu", "item_name", row.name, row)
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
        <UpdateIngredientModal
          isOpen={updateIngredModalIsOpen}
          onRequestClose={handleUpdateModalClose}
          onUpdateConfirm={handleUpdateIngredientsConfirm}
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
