import { Button, Card, Divider, Snackbar } from "@mui/material";
import React, { Fragment, useEffect, useRef, useState } from "react";
import AddressCard from "../../components/Address/AddressCard";
import CartItemCard from "../../components/CartItem/CartItemCard";
import { useDispatch, useSelector } from "react-redux";
import formatCurrency from '../../../config/formatCurrency';

import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import { Box, Modal, Grid, TextField } from "@mui/material";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createOrder } from "../../../State/Customers/Orders/Action";
import { findCart } from "../../../State/Customers/Cart/cart.action";
import { isValid } from "../../util/ValidToOrder";
import { cartTotal } from "./totalPay";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";

const initialValues = {
  streetAddress: "",
  state: "",
  pincode: "",
  city: "",
};

const validationSchema = Yup.object().shape({
  streetAddress: Yup.string().required("La dirección es obligatoria"),
  state: Yup.string().required("El estado es obligatorio"),
  pincode: Yup.string().required("El código postal es obligatorio"),
  city: Yup.string().required("La ciudad es obligatoria"),
});

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  outline: "none",
  p: 4,
};

const Cart = () => {
  const [checkoutError, setCheckoutError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const checkoutRequest = useRef(null);
  const submittingRef = useRef(false);
  const dispatch = useDispatch();
  const { cart, auth } = useSelector((store) => store);
  const [openAddressModal, setOpenAddressModal] = useState(false);

  const handleCloseAddressModal = () => {
    setOpenAddressModal(false);
  };

  const handleOpenAddressModal = () => setOpenAddressModal(true);

  useEffect(() => {
    dispatch(findCart(localStorage.getItem("jwt")));
  }, [dispatch]);

  const startCheckout = async (address) => {
    if (submittingRef.current) return;
    if (!cart.cartItems.length || !isValid(cart.cartItems)) {
      setCheckoutError("El pedido debe contener productos de un solo restaurante.");
      return;
    }
    const order = {
      restaurantId: cart.cartItems[0].food.restaurant.id,
      items: cart.cartItems.map((item) => ({
        menuItemId: item.food.id,
        quantity: item.quantity,
        notes: item.notes,
      })),
      deliveryAddress: {
        fullName: address.fullName || auth.user?.fullName,
        streetAddress: address.streetAddress,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode || address.pincode,
        country: address.country || "Colombia",
      },
    };
    const signature = JSON.stringify(order);
    if (checkoutRequest.current?.signature !== signature) {
      checkoutRequest.current = { signature, id: crypto.randomUUID() };
    }
    submittingRef.current = true;
    setSubmitting(true);
    setCheckoutError("");
    try {
      const opened = await dispatch(createOrder({
        order: { ...order, clientRequestId: checkoutRequest.current.id },
        cartItems: cart.cartItems.map(({ id, quantity }) => ({ id, quantity })),
      }));
      if (!opened) setCheckoutError("No se pudo iniciar el pago. Intenta de nuevo.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Fragment>
      {cart.cartItems.length > 0 ? (
        <main className="lg:flex justify-between">
          <section className="lg:w-[30%] space-y-6 lg:min-h-screen pt-10">
            {cart.cartItems.map((item, i) => (
              <CartItemCard key={i} item={item} />
            ))}

            <Divider />
            <div className="billDetails px-5 text-sm">
              <p className="font-extralight py-5">Resumen del pedido</p>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-400">
                  <p>Total de productos</p>
                  <p>{formatCurrency(cartTotal(cart.cartItems))}</p>
                </div>
              </div>
            </div>
          </section>
          <Divider orientation="vertical" flexItem />
          <section className="lg:w-[70%] flex justify-center px-5 pb-10 lg:pb-0">
            <div className="">
              <h1 className="text-center font-semibold text-2xl py-10">
                Elige la dirección de entrega
              </h1>
              <div className="flex gap-5 flex-wrap justify-center">
                {auth.user?.addresses.map((item, index) => (
                  <AddressCard
                    key={item.id ?? index}
                    handleSelectAddress={startCheckout}
                    item={item}
                    showButton={true}
                  />
                ))}

                <Card className="flex flex-col justify-center items-center p-5  w-64 ">
                  <div className="flex space-x-5">
                    <AddLocationAltIcon />
                    <div className="space-y-5">
                      <p>Agregar nueva dirección</p>
                      <Button
                        onClick={handleOpenAddressModal}
                        sx={{ padding: ".75rem" }}
                        fullWidth
                        variant="contained"
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            {/* <div className="flex justify-center items-center h-[90vh]">
              <Card className="billDetails px-5 text-sm w-[20vw] p-10 space-y-5">
                <p className=" text-xl font-bold text-center">Bill Details</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-400">
                    <p>Item Total</p>
                    <p>{formatCurrency(cartTotal(cart.cartItems))}</p>
                  </div>
                  <div className="flex justify-between text-gray-400">
                <p>Deliver Fee</p>
                <p>{formatCurrency(21)}</p>
              </div> 
                  <div className="flex justify-between text-gray-400">
                <p>Plateform Fee</p>
                <p>{formatCurrency(5)}</p>
              </div> 
                  <div className="flex justify-between text-gray-400">
                <p>GST and Restaurant Charges</p>
                <p>{formatCurrency(33)}</p>
              </div>
                  <Divider />
                  <div className="flex justify-between text-gray-400">
                    <p>Total Pay</p>
                    <p>{formatCurrency(cartTotal(cart.cartItems))}</p>
                  </div>
                </div>
                <Button
                  onClick={createOrderUsingSelectedAddress}
                  variant="contained"
                >
                  Checkout
                </Button>
              </Card>
            </div> */}
          </section>
        </main>
      ) : (
        <div className="flex h-[90vh] justify-center items-center">
          <div className="text-center space-y-5">
            <RemoveShoppingCartIcon sx={{ width: "10rem", height: "10rem" }} />
            <p className="font-bold text-3xl">Tu carrito está vacío</p>
          </div>
        </div>
      )}
      <Modal open={openAddressModal} onClose={handleCloseAddressModal}>
        <Box sx={style}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={startCheckout}
          >
            {({ values, handleChange }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      name="streetAddress"
                      as={TextField}
                      label="Dirección"
                      fullWidth
                      variant="outlined"
                      error={!ErrorMessage("streetAddress")}
                      helperText={
                        <ErrorMessage name="streetAddress">
                          {(msg) => <span className="text-red-600">{msg}</span>}
                        </ErrorMessage>
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      name="state"
                      as={TextField}
                      label="Estado"
                      fullWidth
                      variant="outlined"
                      error={!ErrorMessage("state")}
                      helperText={
                        <ErrorMessage name="state">
                          {(msg) => <span className="text-red-600">{msg}</span>}
                        </ErrorMessage>
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      name="pincode"
                      as={TextField}
                      label="Código Postal"
                      fullWidth
                      variant="outlined"
                      error={!ErrorMessage("pincode")}
                      helperText={
                        <ErrorMessage name="pincode">
                          {(msg) => <span className="text-red-600">{msg}</span>}
                        </ErrorMessage>
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      name="city"
                      as={TextField}
                      label="Ciudad"
                      fullWidth
                      variant="outlined"
                      error={!ErrorMessage("city")}
                      helperText={
                        <ErrorMessage name="city">
                          {(msg) => <span className="text-red-600">{msg}</span>}
                        </ErrorMessage>
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                      {submitting ? "Abriendo pago…" : "Entregar aquí"}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
      <Snackbar
        open={Boolean(checkoutError)}
        autoHideDuration={6000}
        onClose={() => setCheckoutError("")}
        message={checkoutError}
      />
    </Fragment>
  );
};

export default Cart;
