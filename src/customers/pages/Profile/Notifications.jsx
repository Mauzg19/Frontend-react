import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUsersNotificationAction } from "../../../State/Customers/Orders/Action";
import { Alert, Button, Card } from "@mui/material";
import { api } from "../../../config/api";

const Notifications = () => {
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { order } = useSelector((store) => store);

  useEffect(() => {
    dispatch(getUsersNotificationAction());
  }, [dispatch]);

  const markRead = async () => {
    setBusy(true);
    setError("");
    try {
      await api.put("/api/notifications/read-all", null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      await dispatch(getUsersNotificationAction());
    } catch {
      setError("No se pudieron marcar las notificaciones.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 px-5 lg:px-20">
      <h1 className="py-5 font-bold text-2xl text-center">Notificaciones</h1>
      {error && <Alert severity="error">{error}</Alert>}
      {order.notifications.some((item) => !item.read) && (
        <Button disabled={busy} onClick={markRead}>Marcar todas como leídas</Button>
      )}
      {order.notifications.length === 0 && <p>Aún no tienes notificaciones.</p>}
      {order.notifications.map((item) => (
        <Card key={item.id} className="p-5">
          <h2 className={item.read ? "" : "font-semibold"}>{item.title}</h2>
          <p>{item.message}</p>
        </Card>
      ))}
    </div>
  );
};

export default Notifications;
