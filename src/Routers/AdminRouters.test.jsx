import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import { api } from "../config/api";
import restaurantReducer from "../State/Customers/Restaurant/Reducer";
import { getRestaurantByUserId } from "../State/Customers/Restaurant/restaurant.action";
import AdminRouters from "./AdminRouters";

jest.mock("../Admin/Admin", () => () => <div>Panel de gestión</div>);
jest.mock("../Admin/AddRestaurants/CreateRestaurantForm", () => () => <div>Crear restaurante</div>);
jest.mock("../config/api", () => ({ api: { get: jest.fn() } }));

function open() {
  const store = createStore(combineReducers({
    auth: () => ({ jwt: "session-a" }),
    restaurant: restaurantReducer,
  }), applyMiddleware(thunk));
  render(<Provider store={store}><AdminRouters /></Provider>);
  return store;
}

test("waits for the owner lookup and opens the existing panel", async () => {
  let respond;
  api.get.mockReturnValueOnce(new Promise(resolve => { respond = resolve; }));
  const store = open();
  let request;
  act(() => { request = store.dispatch(getRestaurantByUserId("session-a")); });
  expect(screen.getByRole("status")).toHaveTextContent("Cargando tu restaurante");
  expect(screen.queryByText("Crear restaurante")).toBeNull();
  await act(async () => { respond({ data: { id: 7 } }); await request; });
  expect(screen.getByText("Panel de gestión")).toBeInTheDocument();
});

test("offers retry on a temporary failure and creation after an empty response", async () => {
  api.get.mockRejectedValueOnce(new Error("Unavailable")).mockResolvedValueOnce({ data: "" });
  const store = open();
  await act(() => store.dispatch(getRestaurantByUserId("session-a")));
  expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar");
  expect(screen.queryByText("Crear restaurante")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("Crear restaurante")).toBeInTheDocument();
});

test("ignores an older lookup that finishes after the current result", async () => {
  let respond;
  api.get.mockReturnValueOnce(new Promise(resolve => { respond = resolve; }))
    .mockResolvedValueOnce({ data: { id: 7 } });
  const store = open();
  let request;
  act(() => { request = store.dispatch(getRestaurantByUserId("session-a")); });
  await act(() => store.dispatch(getRestaurantByUserId("session-a")));
  await act(async () => { respond({ data: "" }); await request; });
  expect(screen.getByText("Panel de gestión")).toBeInTheDocument();
});
