
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

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

  const openModal = useCallback((id: string) => {
    console.log("Opening product modal for ID:", id);
    setSelectedProductId(id);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    console.log("Closing product modal");
    setIsModalOpen(false);
    // Only clear the ID after modal animation completes
    setTimeout(() => setSelectedProductId(null), 300);
  }, []);

  const value = {
    selectedProductId,
    setSelectedProductId,
    isModalOpen,
    openModal,
    closeModal
  };

  return (
    <ProductContext.Provider value={value}>
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
