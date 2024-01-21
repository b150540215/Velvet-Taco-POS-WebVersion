// import PropTypes from "prop-types";
// import { useLocation } from "react-router-dom";
import "../index.css";

const PageNotFound = () => {
  // const location = useLocation();
  return (
    <div className="PageNotFound">
      <header className="PageNotFound-header">
        The requested page does not exist.
      </header>
    </div>
  );
};

// PageNotFound.propTypes = {
//   path: PropTypes.string.isRequired
// };

export default PageNotFound;
