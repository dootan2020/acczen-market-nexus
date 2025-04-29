
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

const CheckoutEmpty = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-3xl mx-auto text-center">
      <Card>
        <CardHeader>
          <CardTitle>Your cart is empty</CardTitle>
          <CardDescription>Add items to your cart to proceed with checkout</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate('/')}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CheckoutEmpty;
