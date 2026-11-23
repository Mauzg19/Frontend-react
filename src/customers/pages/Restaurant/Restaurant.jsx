import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Backdrop,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import MenuItemCard from "../../components/MenuItem/MenuItemCard";
import { useDispatch, useSelector } from "react-redux";
import { getRestaurantById, getRestaurantsCategory } from "../../../State/Customers/Restaurant/restaurant.action";
import { getMenuItemsByRestaurantId } from "../../../State/Customers/Menu/menu.action";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TodayIcon from '@mui/icons-material/Today';
import { getRestaurantImage, onImageError, resolveProductUpload, RESTAURANT_IMAGES } from "../../../config/imageFallbacks";



const foodTypes = [
  {label:"All",value:"all"},
  { label: "Vegetarian Only", value: "vegetarian" },
  { label: "Non-Vegetarian Only", value: "non_vegetarian" },
  {label:"Seasonal",value:"seasonal"},

];
const Restaurant = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams();
  const { restaurant, menu } = useSelector((store) => store);
  const navigate = useNavigate();

  const decodedQueryString = decodeURIComponent(location.search);
  const searchParams = new URLSearchParams(decodedQueryString);
  const foodType = searchParams.get("food_type");
  const foodCategory = searchParams.get("food_category");
  const jwt=localStorage.getItem("jwt")
  const currentRestaurant = restaurant.restaurant;
  const secondPhoto = resolveProductUpload(currentRestaurant?.images?.[1]);
  const thirdPhoto = resolveProductUpload(currentRestaurant?.images?.[2]);

  useEffect(() => {
    dispatch(
      getRestaurantById({
        jwt: localStorage.getItem("jwt"),
        restaurantId: id,
      })
    );
    dispatch(
      getMenuItemsByRestaurantId({
        jwt: localStorage.getItem("jwt"),
        restaurantId: id,
        seasonal: foodType==="seasonal",
        vegetarian: foodType==="vegetarian",
        nonveg: foodType==="non_vegetarian",
        foodCategory: foodCategory || ""
      })
    );
    dispatch(getRestaurantsCategory({restaurantId:id,jwt}))
  }, [dispatch,id,foodType,foodCategory,jwt]);

  const handleFilter = (e, value) => {
    const searchParams = new URLSearchParams(location.search);

    if(value==="all"){
      searchParams.delete(e.target.name);
      searchParams.delete("food_category");
    }
    else searchParams.set(e.target.name, e.target.value);

    const query = searchParams.toString();
    navigate({ search: `?${query}` });
  };

  return (
    <><div className="px-5 lg:px-20 ">
      <section>
        <h3 className="text-gray-500 py-2 mt-10">
          Home/{currentRestaurant?.address?.country || "Colombia"}/
          {currentRestaurant?.name}/{currentRestaurant?.id}/Order Online
        </h3>
        <div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-[7fr_5fr] lg:grid-rows-2">
            <img
              className="col-span-2 w-full aspect-[4/3] object-cover lg:col-span-1 lg:row-span-2 lg:aspect-auto lg:h-[432px]"
              src={getRestaurantImage(currentRestaurant)}
              onError={onImageError(RESTAURANT_IMAGES[0])}
              alt={currentRestaurant?.name || "Restaurante"}
            />
            <img
              className="w-full aspect-[4/3] object-cover lg:aspect-auto lg:h-[208px]"
              src={secondPhoto || RESTAURANT_IMAGES[1]}
              onError={onImageError(RESTAURANT_IMAGES[1])}
              alt={secondPhoto ? "Segunda foto del restaurante" : "Pizza de referencia"}
            />
            <img
              className="w-full aspect-[4/3] object-cover lg:aspect-auto lg:h-[208px]"
              src={thirdPhoto || RESTAURANT_IMAGES[2]}
              onError={onImageError(RESTAURANT_IMAGES[2])}
              alt={thirdPhoto ? "Tercera foto del restaurante" : "Sándwich de referencia"}
            />
          </div>
        </div>
        <div className="pt-3 pb-5">
          <h1 className="text-4xl font-semibold">
            {currentRestaurant?.name}
          </h1>
          <p className="text-gray-500 mt-1">{currentRestaurant?.description}</p>
          <div className="space-y-3 mt-3">
              <p className="text-gray-500 flex items-center gap-3">
            <LocationOnIcon/> <span>{currentRestaurant?.address?.streetAddress || currentRestaurant?.address?.city || "Dirección no registrada"}
              </span>
          </p>
          <p className="flex items-center gap-3 text-gray-500">
           <TodayIcon/> <span className=" text-orange-300"> {currentRestaurant?.openingHours || "Horario no registrado"} (Today)</span>
          </p>
          </div>

        </div>
      </section>
      <Divider />

      <section className="pt-[2rem] lg:flex relative ">
        <div className="space-y-10 lg:w-[20%] filter">
          <div className="box space-y-5 lg:sticky top-28">

            <div className="">
              <Typography sx={{ paddingBottom: "1rem" }} variant="h5">
                Food Type
              </Typography>
              <FormControl className="py-10 space-y-5" component="fieldset">
                <RadioGroup
                  name="food_type"
                  value={foodType || "all"}
                  onChange={handleFilter}
                >
                  {foodTypes?.map((item, index) => (
                    <FormControlLabel
                      key={index}
                      value={item.value}
                      control={<Radio />}
                      label={item.label}
                      sx={{ color: "gray" }}
                    />
                  ))}
                </RadioGroup>
                <Divider/>
                <Typography sx={{ paddingBottom: "1rem" }} variant="h5">
                Food Category
              </Typography>
                <RadioGroup
                  name="food_category"
                  value={foodCategory || "all"}
                  onChange={handleFilter}
                >
                   <FormControlLabel

                      value={"all"}
                      control={<Radio />}
                      label={"All"}
                      sx={{ color: "gray" }}
                    />
                  {restaurant?.categories.map((item, index) => (
                    <FormControlLabel
                      key={index}
                      value={item.name}
                      control={<Radio />}
                      label={item.name}
                      sx={{ color: "gray" }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </div>
          </div>
        </div>
        <div className="lg:w-[80%] space-y-5 lg:pl-10">
          {menu?.menuItems.map((item) => (
            <MenuItemCard item={item} />
            // <p>ashok</p>
          ))}
        </div>
      </section>
    </div>
    <Backdrop
  sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
  open={menu.loading || restaurant.loading}

>
  <CircularProgress color="inherit" />
</Backdrop>
    </>

  );
};

export default Restaurant;
