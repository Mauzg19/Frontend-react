import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";
import { api } from "../../../config/api";

export const addressHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

const fields = [
  ["street", "Dirección", true],
  ["city", "Ciudad", true],
  ["postalCode", "Código postal", true],
  ["state", "Departamento", false],
  ["notes", "Notas de entrega", false],
];

export default function NewAddress({ open, handleClose, address, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const config = { headers: addressHeaders() };
    try {
      if (address?.id) {
        await api.put(`/api/users/address/${address.id}`, data, config);
      } else {
        await api.post("/api/users/address", { ...data, country: "Colombia" }, config);
      }
      await onSaved();
      handleClose();
    } catch {
      setError("No se pudo guardar la dirección. Revisa los datos e intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : handleClose} fullWidth maxWidth="xs">
      <form onSubmit={submit}>
        <DialogTitle>{address ? "Editar dirección" : "Agregar dirección"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          {fields.map(([name, label, required]) => (
            <TextField key={name} name={name} label={label} required={required} fullWidth
              margin="dense" defaultValue={(name === "street" ? address?.streetAddress : address?.[name]) ?? ""} />
          ))}
        </DialogContent>
        <DialogActions>
          <Button disabled={saving} onClick={handleClose}>Cancelar</Button>
          <Button disabled={saving} type="submit" variant="contained">Guardar dirección</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
