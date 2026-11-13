import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "../../../config/api";
import { clearCartAction } from "../../../State/Customers/Cart/cart.action";

const labels = {
  paid: "Pago confirmado",
  pending: "Pago pendiente",
  cancelled: "Pago cancelado",
  failed: "Pago fallido",
  error: "No se pudo consultar el pago",
  loading: "Consultando el pago…",
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const { id } = useParams();
  const orderId = new URLSearchParams(search).get("order_id") || id;
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt || !/^\d+$/.test(orderId || "")) {
      setStatus("error");
      return undefined;
    }
    const controller = new AbortController();
    setStatus("loading");
    api.get(`/api/order/${orderId}/payment-status`, {
      headers: { Authorization: `Bearer ${jwt}` },
      signal: controller.signal,
    }).then(async ({ data }) => {
      const confirmed = data.payment_status?.toLowerCase();
      setStatus(labels[confirmed] ? confirmed : "error");
      const key = `checkout-cart:${orderId}`;
      const savedCart = sessionStorage.getItem(key);
      if (confirmed !== "paid" || !savedCart) return;
      try {
        const snapshot = JSON.parse(savedCart);
        const { data: cart } = await api.get("/api/cart/", {
          headers: { Authorization: `Bearer ${jwt}` },
          signal: controller.signal,
        });
        const quantities = new Map(snapshot.map(({ id, quantity }) => [id, quantity]));
        if (!controller.signal.aborted && cart.items.length === quantities.size &&
            cart.items.every(({ id, quantity }) => quantities.get(id) === quantity)) {
          await dispatch(clearCartAction());
        }
        if (!controller.signal.aborted) sessionStorage.removeItem(key);
      } catch {
        // Keep the snapshot so a reload can retry cart cleanup.
      }
    }).catch(() => {
      if (!controller.signal.aborted) setStatus("error");
    });
    return () => controller.abort();
  }, [orderId, attempt, dispatch]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-5">
      <h1 className="text-2xl font-semibold" role="status">{labels[status]}</h1>
      {orderId && <p>Pedido #{orderId}</p>}
      {(status === "pending" || status === "error") && (
        <Button onClick={() => setAttempt((current) => current + 1)}>Consultar de nuevo</Button>
      )}
      <Button variant="contained" onClick={() => navigate("/my-profile/órdenes")}>
        Ver mis pedidos
      </Button>
    </main>
  );
};

export default PaymentSuccess;
