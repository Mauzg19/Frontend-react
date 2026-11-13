import {
  Box,
  Button,
  Card,
  Grid,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createEventAction,
  getRestaurnatsEvents,
} from "../../State/Customers/Restaurant/restaurant.action";
import { useParams } from "react-router-dom";
import EventCard from "./EventCard";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  outline: "none",
  boxShadow: 24,
  p: 4,
};

const initialValues = {
  image: "",
  location: "",
  name: "",
  startedAt: "",
  endsAt: "",
};

const Events = () => {
  const [image, setimage] = useState("");
  const dispatch = useDispatch();
  const { restaurant, auth } = useSelector((store) => store);
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState("");
  const handleCloseModal = () => setOpenModal(false);
  const handleOpenModal = () => setOpenModal(true);
  const jwt = localStorage.getItem("jwt");

  const [formValues, setFormValues] = useState(initialValues);

  const handleFormChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const saved = await dispatch(
      createEventAction({
        data: formValues,
        restaurantId: restaurant.usersRestaurant?.id,
        jwt
      })
    );
    if (saved) {
      setFormValues(initialValues);
      handleCloseModal();
    } else {
      setError("No se pudo guardar el evento.");
    }
  };

  useEffect(() => {
    if (restaurant.usersRestaurant) {
      dispatch(
        getRestaurnatsEvents({
          restaurantId: restaurant.usersRestaurant?.id,
          jwt: auth.jwt || jwt,
        })
      );
    }
  }, [restaurant.usersRestaurant]);

  return (
    <div>
     
      <div className="p-5">
        <Button
          sx={{ padding: "1rem 2rem" }}
          onClick={handleOpenModal}
          variant="contained"
          color="primary"
        >
          Crear nuevo evento
        </Button>
      </div>

      <div className="mt-5 px-5 flex flex-wrap gap-5">
        {restaurant.restaurantsEvents.map((item) => (
          <EventCard key={item.id} item={item} />
        ))}
        {/* <div>
          <img
          className="rounded-md w-[25rem] h-[25-rem] object-cover"
            src="https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt=""
          />
        </div> */}
      </div>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={handleSubmit}>
            {error && <p role="alert">{error}</p>}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="image"
                  label="URL de la imagen"
                  variant="outlined"
                  fullWidth
                  value={formValues.image}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="location"
                  required
                  label="Ubicación"
                  variant="outlined"
                  fullWidth
                  value={formValues.location}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  required
                  label="Nombre del evento"
                  variant="outlined"
                  fullWidth
                  value={formValues.name}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField name="startedAt" type="datetime-local" label="Fecha y hora de inicio"
                  fullWidth required InputLabelProps={{ shrink: true }}
                  value={formValues.startedAt} onChange={handleFormChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField name="endsAt" type="datetime-local" label="Fecha y hora de finalización"
                  fullWidth required InputLabelProps={{ shrink: true }}
                  inputProps={{ min: formValues.startedAt }}
                  value={formValues.endsAt} onChange={handleFormChange} />
              </Grid>
            </Grid>
            <Box mt={2}>
              <Button variant="contained" color="primary" type="submit">
                Crear evento
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </div>
  );
};

export default Events;
