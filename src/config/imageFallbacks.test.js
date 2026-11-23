import { getFoodImage, getRestaurantImage, onImageError } from "./imageFallbacks";

jest.mock("./api", () => ({ API_URL: "https://api.example.test" }));

test("keeps the uploaded photo ahead of the local fallback", () => {
  expect(getFoodImage({ name: "Hamburguesa", images: ["/uploads/product-images/photo.jpg"] }))
    .toBe("https://api.example.test/uploads/product-images/photo.jpg");
});

test("skips retired illustrations and chooses a photo for the same dish", () => {
  expect(getFoodImage({ name: "Sándwich", images: ["/assets/generated/food-burger.png"] }))
    .toBe("/assets/photos/sandwich.jpg");
  expect(getFoodImage({ name: "Producto sin foto" })).toBe("/Logo-eslogan.png");
  expect(getRestaurantImage({ images: ["/assets/generated/restaurant-burger.png", "/real.jpg"] }))
    .toBe("/real.jpg");
  expect(getRestaurantImage({ images: [] })).toBe("/assets/photos/burger.jpg");
});

test("does not reassign the backup if that same image fails", () => {
  let assignments = 0;
  const image = {
    get src() { return "https://example.test/assets/photos/pizza.jpg"; },
    set src(value) { if (value) assignments += 1; },
  };
  onImageError("/assets/photos/pizza.jpg")({ currentTarget: image });
  expect(assignments).toBe(0);
});
