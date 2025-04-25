
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ProductPreviewProps {
  name: string;
  price: number;
  stockQuantity: number;
  kioskToken: string;
}

export default function ImportPreview({
  name,
  price,
  stockQuantity,
  kioskToken,
}: ProductPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Preview</CardTitle>
        <CardDescription>
          Product information fetched from TaphoaMMO
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Property</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Product Name</TableCell>
              <TableCell>{name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Price</TableCell>
              <TableCell>${price.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Stock Quantity</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {stockQuantity}{' '}
                  {stockQuantity > 0 ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Kiosk Token</TableCell>
              <TableCell>
                <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  {kioskToken}
                </code>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
