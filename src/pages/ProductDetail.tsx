
import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { slug } = useParams();
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Product Details</h1>
      <p>Product: {slug}</p>
    </div>
  );
};

export default ProductDetail;
