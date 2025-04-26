
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProductBasicInfoProps {
  name: string;
  slug: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductBasicInfo = ({ name, slug, onChange }: ProductBasicInfoProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={onChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={onChange}
          placeholder="auto-generated-if-empty"
        />
      </div>
    </div>
  );
};

export default ProductBasicInfo;
