import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * For the standalone auth pages (/login, /register, …): signed-in users are
 * sent back to where they came from instead of seeing the form again.
 */
const GuestOnly = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestOnly;
