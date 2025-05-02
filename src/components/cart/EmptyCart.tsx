
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const EmptyCart: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
      <p className="mb-6">It looks like you haven't added any products to your cart yet.</p>
      <Button asChild>
        <Link to="/products">View Products</Link>
      </Button>
    </div>
  );
};

export default EmptyCart;
