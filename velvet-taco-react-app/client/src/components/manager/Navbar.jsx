import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ManagerContext } from "../../context/ManagerContext";
import { useUser } from "../../routes/UserContext";
const Navbar = () => {
  const { currentView, setCurrentView, currentPressed, setCurrentPressed } =
    useContext(ManagerContext);
  const { logout } = useUser();
  const navigate = useNavigate();
  const handleViewChange = (e) => {
    // "tables" or "reports"
    setCurrentView(e.target.value);
    setCurrentPressed(
      e.target.value === "tables" ? "inventory" : "product-usage"
    );
  };

  const handleSignOut = () => {
    logout();
    navigate("/");
  };
  const table_buttons = [
    {
      text: "Inventory",
      internal: "inventory",
      anchor: "inventory",
    },
    {
      text: "Menu",
      internal: "menu",
      anchor: "menu",
    },
    {
      text: "Employees",
      internal: "employees",
      anchor: "employees",
    },
    {
      text: "Order History",
      internal: "orders",
      anchor: "order-history",
    },
  ];
  const report_buttons = [
    // internal and anchor are the same in these cases
    {
      text: "Product Usage Report",
      anchor: "product-usage-report",
      internal: "product-usage",
    },
    {
      text: "Sales Report",
      anchor: "sales-report",
      internal: "sales",
    },
    {
      text: "Excess Report",
      anchor: "excess-report",
      internal: "excess",
    },
    {
      text: "Restock Report",
      internal: "restock",
      anchor: "restock-report",
    },
    {
      text: "What Sells Together",
      internal: "sells-together",
      anchor: "what-sells-together",
    },
  ];

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarText"
          aria-controls="navbarText"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarText">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <select
                className="custom-select my-1 mr-sm-2"
                onChange={handleViewChange}
              >
                <option value="tables">Tables</option>
                <option value="reports">Reports</option>
              </select>
            </li>

            {currentView === "tables"
              ? table_buttons.map((row) => {
                  return (
                    <li
                      key={row.internal}
                      className={`nav-item ${
                        currentPressed === row.internal ? "active" : ""
                      }`}
                    >
                      <a
                        className="nav-link"
                        href={`#${row.anchor}`}
                        onClick={() => setCurrentPressed(row.internal)}
                      >
                        {row.text}
                      </a>
                    </li>
                  );
                })
              : report_buttons.map((row) => {
                  return (
                    <li
                      key={row.internal}
                      className={`nav-item ${
                        currentPressed === row.internal ? "active" : ""
                      }`}
                    >
                      <a
                        className="nav-link"
                        href={`#${row.anchor}`}
                        onClick={() => setCurrentPressed(row.internal)}
                      >
                        {row.text}
                      </a>
                    </li>
                  );
                })}
          </ul>
        </div>
        {/* <div className="ml-auto">
          <Link to="https://project-3-client-cqgf.onrender.com/index.html">
            <button className="btn btn-danger">Sign Out</button>
          </Link>
        </div> */}
        <div className="ml-auto">
          <button className="btn btn-danger" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </nav>
      {/* <h1 className="font-weight-light display-1 text-center">
        Restaurant Finder
      </h1> */}
    </div>
  );
};

export default Navbar;
