export function isValid(cartItems) {
  const restaurantId = cartItems[0]?.food?.restaurant?.id;
  return restaurantId != null && cartItems.every(
    (item) => item.food?.restaurant?.id === restaurantId
  );
}
