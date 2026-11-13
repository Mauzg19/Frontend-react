import React, { useState } from "react";
import { Alert, Button } from "@mui/material";
import AddressCard from "../../components/Address/AddressCard";
import NewAddress, { addressHeaders } from "../../components/Address/NewAddressModal";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../../config/api";
import { getUser } from "../../../State/Authentication/Action";

const UsersAddresses = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const refresh = () => dispatch(getUser(localStorage.getItem("jwt")));
  const remove = async (address) => {
    if (!window.confirm(`¿Eliminar la dirección ${address.streetAddress}?`)) return;
    setError("");
    setDeleting(address.id);
    try {
      await api.delete(`/api/users/address/${address.id}`, { headers: addressHeaders() });
      await refresh();
    } catch {
      setError("No se pudo eliminar la dirección.");
    } finally {
      setDeleting(null);
    }
  };
  return (
    <div>
      <div className="flex items-center flex-col lg:px-10">
        <h1 className="text-xl text-center py-7 font-semibold">Direcciones</h1>
        {error && <Alert severity="error">{error}</Alert>}
        <Button onClick={() => setSelected(null)}>Agregar dirección</Button>
        <div className="flex justify-center flex-wrap gap-3">
          {user?.addresses?.map((item) => (
            <div key={item.id}>
              <AddressCard item={item} />
              <Button onClick={() => setSelected(item)}>Editar</Button>
              <Button disabled={deleting !== null} onClick={() => remove(item)}>Eliminar</Button>
            </div>
          ))}
        </div>
        {selected !== undefined && (
          <NewAddress open address={selected} onSaved={refresh} handleClose={() => setSelected(undefined)} />
        )}
      </div>
    </div>
  );
};

export default UsersAddresses;
