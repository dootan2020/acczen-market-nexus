
import React from 'react';
import { useParams } from 'react-router-dom';

const EditProductPage = () => {
  const { productId } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <p>Editing product ID: {productId}</p>
    </div>
  );
};

export default EditProductPage;
