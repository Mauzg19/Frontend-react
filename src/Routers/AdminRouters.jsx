import { Alert, Box, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Admin from "../Admin/Admin";
import CreateRestaurantForm from "../Admin/AddRestaurants/CreateRestaurantForm";
import { getRestaurantByUserId } from "../State/Customers/Restaurant/restaurant.action";

const AdminRouters = () => {
  const dispatch = useDispatch();
  const jwt = useSelector((store) => store.auth.jwt) || localStorage.getItem("jwt");
  const { usersRestaurant, ownerRestaurantLookup } = useSelector((store) => store.restaurant);

  if (ownerRestaurantLookup?.jwt === jwt && ownerRestaurantLookup) {
    if (usersRestaurant) return <Admin />;
    if (ownerRestaurantLookup.status === "resolved") return <CreateRestaurantForm />;
    if (ownerRestaurantLookup.status === "error") {
      return (
        <Box p={3}>
          <Alert severity="error">No se pudo cargar tu restaurante.</Alert>
          <Button onClick={() => dispatch(getRestaurantByUserId(jwt))}>Reintentar</Button>
        </Box>
      );
    }
  }

  return <Box p={3} role="status">Cargando tu restaurante…</Box>;
};

export default AdminRouters;
