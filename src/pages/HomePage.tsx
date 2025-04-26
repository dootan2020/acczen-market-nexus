
import React from 'react';
import Layout from '../components/Layout';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Digital Deals Hub</h1>
        <p>Welcome to Digital Deals Hub, your marketplace for digital products.</p>
      </div>
    </Layout>
  );
};

export default HomePage;
