
import React from 'react';
import { useParams } from 'react-router-dom';

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <p>Editing product ID: {id}</p>
    </div>
  );
};

export default ProductEditPage;
