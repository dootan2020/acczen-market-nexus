
import React from 'react';
import { useParams } from 'react-router-dom';

const CategoryEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Category</h1>
      <p>Editing category ID: {id}</p>
    </div>
  );
};

export default CategoryEditPage;
