import React, { useEffect } from "react";
import OrdersTable from "./OrderTable";
import {
  Card,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurantsOrder } from "../../State/Admin/Order/restaurants.order.action";

const orderStatus = [
  { label: "Pendiente", value: "PENDING" },
  { label: "Completada", value: "COMPLETED" },
  { label: "Todas", value: "all" },
];

const RestaurantsOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const auth = useSelector((store) => store.auth);
  const jwt = auth.jwt || localStorage.getItem("jwt");
  const restaurantId = useSelector((store) => store.restaurant.usersRestaurant?.id);

  const decodedQueryString = decodeURIComponent(location.search);
  const searchParams = new URLSearchParams(decodedQueryString);
  const filterValue = searchParams.get("order_status");

  useEffect(() => {
    if (!restaurantId || !jwt) return;
    dispatch(
      fetchRestaurantsOrder({
        restaurantId,
        orderStatus: filterValue,
        jwt,
      })
    );
  }, [dispatch, jwt, restaurantId, filterValue]);

  const handleFilter = (e, value) => {
    const searchParams = new URLSearchParams(location.search);

    if (value === "all") {
      searchParams.delete("order_status");
    } else searchParams.set("order_status", e.target.value);

    const query = searchParams.toString();
    navigate({ search: `?${query}` });
  };
  
  return (
    <div className="px-2">
      <Card className="p-5">
        <Typography sx={{ paddingBottom: "1rem" }} variant="h5">
          Estado de la orden
        </Typography>
        <FormControl className="py-10" component="fieldset">
          <RadioGroup
            row
            name="category"
            value={filterValue ? filterValue : "all"}
            onChange={handleFilter}
          >
            {orderStatus.map((item, index) => (
              <FormControlLabel
                key={index}
                value={item.value}
                control={<Radio />}
                label={item.label}
                sx={{ color: "gray" }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Card>

      <OrdersTable name={"Todas las órdenes"} />
    </div>
  );
};

export default RestaurantsOrder;
