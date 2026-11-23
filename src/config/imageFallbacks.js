import { API_URL } from "./api";

export const RESTAURANT_IMAGES = [
  "/assets/photos/burger.jpg",
  "/assets/photos/pizza.jpg",
  "/assets/photos/sandwich.jpg",
];

const foodPhotos = {
  hamburguesa: "burger",
  burger: "burger",
  pizza: "pizza",
  sandwich: "sandwich",
  arroz: "rice",
};

export const getFoodFallback = (food) => {
  const name = food?.name?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(foodPhotos, name)) {
    return `/assets/photos/${foodPhotos[name]}.jpg`;
  }
  return "/Logo-eslogan.png";
};

export const resolveProductUpload = (image) => {
  if (typeof image !== "string" || !image.trim()) return null;
  try {
    const url = new URL(image, API_URL + "/");
    if (url.pathname.startsWith("/assets/generated/")) return null;
    if (url.pathname.startsWith("/uploads/product-images/")) {
      return new URL(url.pathname + url.search, API_URL + "/").href;
    }
    return image;
  } catch {
    return null;
  }
};

const firstImage = (item) => {
  const images = Array.isArray(item?.images) ? item.images : [];
  return images.map(resolveProductUpload).find(Boolean) || resolveProductUpload(item?.imageUrl);
};

export const getRestaurantImage = (restaurant) =>
  firstImage(restaurant) || RESTAURANT_IMAGES[0];

export const getFoodImage = (food) => firstImage(food) || getFoodFallback(food);

export const onImageError = (fallback) => (event) => {
  const img = event.currentTarget;
  if (img.src.endsWith(fallback)) return;
  img.src = fallback;
};
