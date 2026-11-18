import { API_URL } from "./api";

export const RESTAURANT_IMAGES = [
  "/assets/generated/restaurant-italian.png",
  "/assets/generated/restaurant-burger.png",
  "/assets/generated/restaurant-pizza.png",
];

export const FOOD_IMAGES = [
  "/assets/generated/food-pasta.png",
  "/assets/generated/food-pizza.png",
  "/assets/generated/food-burger.png",
];

export const USER_IMAGE = "/Logo-eslogan.png";

const pickById = (items, id) => {
  const safeId = Number.isFinite(Number(id)) ? Number(id) : 0;
  return items[Math.abs(safeId) % items.length];
};

const firstImage = (images) => {
  if (!Array.isArray(images)) return null;
  return images.find((image) => typeof image === "string" && image.trim());
};

export const resolveProductUpload = (image) => {
  if (!image) return null;
  try {
    const url = new URL(image, API_URL + "/");
    if (url.pathname.startsWith("/uploads/product-images/")) {
      return new URL(url.pathname + url.search, API_URL + "/").href;
    }
    return image;
  } catch {
    return null;
  }
};

export const getRestaurantImage = (restaurant, index = 0) =>
  resolveProductUpload(firstImage(restaurant?.images) || restaurant?.imageUrl) ||
  pickById(RESTAURANT_IMAGES, restaurant?.id ?? index);

export const getFoodImage = (food, index = 0) =>
  resolveProductUpload(firstImage(food?.images) || food?.imageUrl) ||
  pickById(FOOD_IMAGES, food?.id ?? index);

export const onImageError = (fallback) => (event) => {
  const img = event.currentTarget;
  if (img.src.endsWith(fallback)) return;
  img.src = fallback;
};
