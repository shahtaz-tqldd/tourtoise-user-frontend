import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";

const PrivateRoute = ({ children, redirectTo = "/login" }) => {
  const location = useLocation();
  const { isLoading, isFetching, authChecked, authError, refetchProfile } =
    useAuth();
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (authError) {
    return (
      <div className="h-screen w-screen center">
        <div className="flex flex-col items-center gap-4">
          <p>server not connected!</p>
          <Button
            type="button"
            onClick={refetchProfile}
            disabled={isFetching}
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>
    );
  }

  if (!authChecked || isLoading) return null;

  return isAuthenticated ? (
    children
  ) : (
    <Navigate state={{ from: location }} to={redirectTo} replace />
  );
};

export default PrivateRoute;
