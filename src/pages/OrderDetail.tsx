
import React from 'react';
import { useParams } from 'react-router-dom';

const OrderDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>
      <p>Order ID: {id}</p>
    </div>
  );
};

export default OrderDetail;
