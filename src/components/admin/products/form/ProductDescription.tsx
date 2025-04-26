
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProductDescriptionProps {
  description: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ProductDescription = ({ description, onChange }: ProductDescriptionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        name="description"
        value={description}
        onChange={onChange}
        rows={3}
      />
    </div>
  );
};

export default ProductDescription;
