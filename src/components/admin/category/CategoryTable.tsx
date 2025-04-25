
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, ListTree, Edit, Trash2, FolderTree } from 'lucide-react';

interface CategoryTableProps {
  categories: any[] | undefined;
  getSubcategoryCount: (categoryId: string) => number;
  onEdit: (category: any) => void;
  onDelete: (category: any) => void;
  onManageSubcategories: (category: any) => void;
  isLoading: boolean;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  getSubcategoryCount,
  onEdit,
  onDelete,
  onManageSubcategories,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Subcategories</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories?.length ? (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name} 
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <FolderTree className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="font-medium">{category.name}</div>
                  </div>
                </TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>
                  <div className="truncate max-w-[300px]">
                    {category.description || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-sm">
                    {getSubcategoryCount(category.id)} subcategories
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onManageSubcategories(category)}>
                        <ListTree className="h-4 w-4 mr-2" />
                        Manage Subcategories
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(category)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(category)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                No categories found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryTable;
