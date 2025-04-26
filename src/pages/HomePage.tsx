
import React from 'react';
import Layout from '../components/Layout';
import { Outlet } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default HomePage;
