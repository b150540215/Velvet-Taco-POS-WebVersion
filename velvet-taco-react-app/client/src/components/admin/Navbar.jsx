import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { useUser } from "../../routes/UserContext";
const Navbar = () => {
  const { currentPressed, setCurrentPressed } = useContext(AdminContext);
  const { logout } = useUser();
  const navigate = useNavigate();
  const handleSignOut = () => {
    logout(); // Call the logout function
    // Additional sign-out logic if needed
    navigate("/");
  };
  const table_buttons = [
    {
      text: "User Accounts",
      internal: "users",
      anchor: "users",
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
            {table_buttons.map((row) => {
              return (
                <li
                  key={row.internal}
                  className={`nav-item ${
                    currentPressed === row.internal ? "active" : ""
                  }`}
                >
                  <a
                    className="nav-link"
                    href={`#${row.internal}`}
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
