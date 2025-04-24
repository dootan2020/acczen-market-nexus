
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <Package className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
        <Link to="/products">
          <Button variant="outline">Browse Products</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
