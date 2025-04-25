
import { useState } from "react";
import { Edit, MoreVertical, Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSubcategories, useSubcategoryCRUD } from "@/hooks/useSubcategories";
import SubcategoryDialog from "./SubcategoryDialog";

interface SubcategoriesTableProps {
  categoryId: string;
  categoryName: string;
}

export default function SubcategoriesTable({
  categoryId,
  categoryName,
}: SubcategoriesTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { data: subcategories, isLoading } = useSubcategories(categoryId);
  const { deleteSubcategory } = useSubcategoryCRUD();

  const handleAddSubcategory = () => {
    setIsEditing(false);
    setSelectedSubcategory(null);
    setIsDialogOpen(true);
  };

  const handleEditSubcategory = (subcategory: any) => {
    setIsEditing(true);
    setSelectedSubcategory(subcategory);
    setIsDialogOpen(true);
  };

  const handleDeleteSubcategory = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedSubcategory) {
      deleteSubcategory.mutate({
        id: selectedSubcategory.id,
        category_id: categoryId,
      });
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subcategories for {categoryName}</CardTitle>
            <CardDescription>
              Manage subcategories for this category
            </CardDescription>
          </div>
          <Button onClick={handleAddSubcategory}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subcategory
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : subcategories && subcategories.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.map((subcategory) => (
                    <TableRow key={subcategory.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {subcategory.image_url ? (
                            <img
                              src={subcategory.image_url}
                              alt={subcategory.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="font-medium">{subcategory.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{subcategory.slug}</TableCell>
                      <TableCell>
                        <div className="truncate max-w-[300px]">
                          {subcategory.description || "-"}
                        </div>
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
                            <DropdownMenuItem onClick={() => handleEditSubcategory(subcategory)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteSubcategory(subcategory)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No subcategories found for this category.
              <div className="mt-4">
                <Button onClick={handleAddSubcategory} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Subcategory
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <SubcategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categoryId={categoryId}
        subcategory={selectedSubcategory}
        isEditing={isEditing}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSubcategory?.name}"? This action cannot be undone and may affect products assigned to this subcategory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteSubcategory.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
