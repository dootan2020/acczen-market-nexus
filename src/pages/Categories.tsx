
import React from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useProductCountByCategory } from '@/hooks/useProductCountByCategory';
import CategoryCard from '@/components/CategoryCard';
import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Folder, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const CategoriesContent = () => {
  const { handleError, clearError } = useErrorHandler();
  
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories 
  } = useCategories({
    onError: (err) => handleError(err, { 
      showToast: true,
      logToConsole: true
    })
  });
  
  const { 
    counts: productCounts, 
    isLoading: countsLoading, 
    error: countsError,
    refetch: refetchCounts
  } = useProductCountByCategory({
    onError: (err) => handleError(err, { 
      showToast: false, // Don't show toast for this secondary data
      logToConsole: true
    })
  });
  
  const isLoading = categoriesLoading || countsLoading;
  const error = categoriesError || countsError;
  
  // Handle retry for both data sources
  const handleRetry = () => {
    clearError();
    refetchCategories();
    refetchCounts();
  };
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <Container className="py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="space-y-6">
          <div>
            <Skeleton className="h-12 w-64 mb-3" />
            <Skeleton className="h-6 w-full max-w-xl mb-8" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-64" />
            ))}
          </div>
        </div>
      </Container>
    );
  }

  // Render error state with retry option
  if (error) {
    return (
      <Container className="py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load categories</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : String(error)}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center my-8">
          <Button 
            onClick={handleRetry} 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </Container>
    );
  }

  // Render empty state
  if (!categories || categories.length === 0) {
    return (
      <Container className="py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Folder className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium">No categories available</h2>
          <p className="text-muted-foreground mt-2">
            We currently don't have any product categories. Please check back later.
          </p>
        </div>
      </Container>
    );
  }

  // Render categories grid
  return (
    <Container className="py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Categories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Product Categories</h1>
        <p className="text-muted-foreground max-w-xl">
          Browse our selection of digital products by category. We offer a wide range of digital items for all your needs.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <CategoryCard 
            key={category.id} 
            category={category} 
            productCount={productCounts[category.id] || 0}
            colorIndex={index}
          />
        ))}
      </div>
    </Container>
  );
};

// Wrapper component with ErrorBoundary
const Categories = () => {
  return (
    <ErrorBoundary>
      <CategoriesContent />
    </ErrorBoundary>
  );
};

export default Categories;
