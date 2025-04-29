
import React from 'react';

interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: string;
  sku?: string;
  brand?: string;
  ratingValue?: number;
  reviewCount?: number;
}

// Define a proper type for the schema data that includes the optional aggregateRating property
interface SchemaData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  image: string;
  sku?: string;
  brand: {
    '@type': string;
    name: string;
  };
  offers: {
    '@type': string;
    url: string;
    price: number;
    priceCurrency: string;
    availability: string;
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: number;
    reviewCount: number;
  };
}

export const ProductSchema: React.FC<ProductSchemaProps> = ({
  name,
  description,
  image,
  price,
  currency = 'VND',
  availability = 'InStock',
  sku,
  brand = 'AccZen',
  ratingValue,
  reviewCount,
}) => {
  const schemaData: SchemaData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name,
    description,
    image,
    sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      url: window.location.href,
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
    },
  };

  // Add review data if available
  if (ratingValue && reviewCount) {
    schemaData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount,
    };
  }

  return (
    <script type="application/ld+json">
      {JSON.stringify(schemaData)}
    </script>
  );
};

export default ProductSchema;
