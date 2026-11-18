import { Button, Card } from "@mui/material";
import React from "react";
import formatCurrency from '../../../config/formatCurrency'
import { FOOD_IMAGES, getFoodImage, onImageError } from "../../../config/imageFallbacks";

const OrderCard = ({order,status}) => {
  return (
    <Card className="flex justify-between items-center p-5 ">
      <div className="flex items-center space-x-5">
        <img
          className="h-16 w-16"
          src={getFoodImage(order.food)}
          onError={onImageError(FOOD_IMAGES[0])}
          alt={order.food.name}
        />
        <div>
          <p>{order.food.name}</p>
          <p className="text-gray-400">{formatCurrency(order.food.price)}</p>
        </div>
      </div>
      <div>
        <Button className="cursor-not-allowed" variant="contained">{status}</Button>
      </div>
    </Card>
  );
};

export default OrderCard;
