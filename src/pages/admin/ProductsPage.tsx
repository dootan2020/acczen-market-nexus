
import React from 'react';
import AdminProducts from '@/components/admin/products/AdminProducts';
import AdminLayout from '@/components/AdminLayout';

const ProductsPage: React.FC = () => {
  return (
    <AdminLayout>
      <AdminProducts />
    </AdminLayout>
  );
};

export default ProductsPage;
