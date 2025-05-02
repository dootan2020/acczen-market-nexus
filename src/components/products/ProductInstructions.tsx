
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface ProductInstructionsProps {
  steps: Step[];
}

const ProductInstructions = ({ steps }: ProductInstructionsProps) => {
  if (!steps || steps.length === 0) return null;
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 font-poppins">How It Works</h2>
      <div className="grid gap-4">
        {steps.map((step) => (
          <Card key={step.number} className="border border-gray-200">
            <CardContent className="p-4 flex">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {step.number}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1 font-poppins">{step.title}</h3>
                <p className="text-gray-600 text-sm font-inter">{step.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductInstructions;
