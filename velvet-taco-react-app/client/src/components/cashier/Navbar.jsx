import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CashierContext } from "../../context/CashierContext";
import { useUser } from "../../routes/UserContext";
const Navbar = () => {
  const { currentMenu, setCurrentMenu, menus, setMenus } =
    useContext(CashierContext);
  const { logout } = useUser();
  const navigate = useNavigate();
  // hardcoded for now. when it is deployed, it will go to the link below
  //const SERVERURL = "http://localhost:3001/";
  //const SERVERURL = "https://project-3-server-d4yp.onrender.com/";
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
        setMenus(_menus);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchMenus();
  }, [setMenus]);
  const handleSignOut = () => {
    logout(); // Call the logout function
    // Additional sign-out logic if needed
    navigate("/");
  };
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-3">
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
            {menus &&
              menus.data.data.map((row) => {
                return (
                  <li
                    key={row.type}
                    className={`nav-item ${
                      currentMenu === row.type ? "active" : ""
                    }`}
                  >
                    <a
                      className="nav-link"
                      href={`#${row.type}`}
                      onClick={() => setCurrentMenu(row.type)}
                    >
                      {row.type}
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
    </div>
  );
};

export default Navbar;
