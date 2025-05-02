
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ProductContextType {
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  isModalOpen: boolean;
  openModal: (id: string) => void;
  closeModal: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (id: string) => {
    setSelectedProductId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Only clear the ID after modal animation completes
    setTimeout(() => setSelectedProductId(null), 300);
  };

  return (
    <ProductContext.Provider
      value={{ selectedProductId, setSelectedProductId, isModalOpen, openModal, closeModal }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
