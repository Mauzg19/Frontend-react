import { CssBaseline, ThemeProvider } from "@mui/material";
import "./App.css";
import ChatbotWidget from "./components/ChatbotWidget";

import darkTheme from "./theme/DarkTheme";
import Routers from "./Routers/Routers";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getUser } from "./State/Authentication/Action";
import { findCart } from "./State/Customers/Cart/cart.action";
import {
  getAllRestaurantsAction,
  getRestaurantByUserId
} from "./State/Customers/Restaurant/restaurant.action";

function App() {
  const dispatch = useDispatch();
  const auth = useSelector((store) => store.auth);
  const jwt = auth.jwt || localStorage.getItem("jwt");
  
  useEffect(() => {
    
    if (jwt) {
      dispatch(getUser(jwt));
      dispatch(findCart(jwt));
    }
  }, [dispatch, jwt]);

  useEffect(() => {
    dispatch(getAllRestaurantsAction());
  }, [dispatch]);

  useEffect(() => {
    if (auth.user?.role === "ROLE_RESTAURANT_OWNER" && jwt) {
      dispatch(getRestaurantByUserId(jwt));
    }
  }, [auth.user?.role, dispatch, jwt]);
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Routers />
      <ChatbotWidget />
    </ThemeProvider>
  );
}

export default App;
