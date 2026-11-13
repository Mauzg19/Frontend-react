import { Button, Card } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import React from "react";

const AddressCard = ({ handleSelectAddress,item,showButton }) => {
  return (
    
    <Card className="flex space-x-5 w-64 p-5">
      <HomeIcon />

      <div className="space-y-3 text-gray-500">
        <h2 className="font-semibold text-lg text-white">{item.streetAddress}</h2>
        <p>
          {[item.city, item.state, item.postalCode, item.country].filter(Boolean).join(", ")}
        </p>

        {showButton && <Button
          onClick={()=>handleSelectAddress(item)}
          variant="outlined"
          className="w-full"
        >
          select
        </Button>}
      </div>
    </Card>
  );
};

export default AddressCard;
