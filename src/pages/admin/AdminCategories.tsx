
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, MoreVertical, Search, Edit, Trash2, FolderTree, ListTree } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubcategories } from '@/hooks/useSubcategories';
import SubcategoriesTable from '@/components/admin/subcategories/SubcategoriesTable';
import { Badge } from '@/components/ui/badge';

interface CategoryFormData {
  name: string;
  description: string;
  image_url: string;
  slug: string;
}

interface SubcategoryCount {
  categoryId: string;
  count: number;
}

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    image_url: '',
    slug: '',
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('categories');

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all subcategories to get counts
  const { data: allSubcategories } = useQuery({
    queryKey: ['all-subcategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('id, category_id');
      
      if (error) throw error;
      return data;
    }
  });
  
  // Calculate subcategory counts for each category
  const subcategoryCounts: Record<string, number> = {};
  if (allSubcategories) {
    allSubcategories.forEach(subcategory => {
      if (!subcategoryCounts[subcategory.category_id]) {
        subcategoryCounts[subcategory.category_id] = 0;
      }
      subcategoryCounts[subcategory.category_id]++;
    });
  }

  // Create/Update category mutation
  const categoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = data.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }

      if (isEditing && currentCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: data.name,
            description: data.description,
            image_url: data.image_url,
            slug: data.slug,
          })
          .eq('id', currentCategory.id);
        
        if (error) throw error;
        return { success: true, action: 'updated' };
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({
            name: data.name,
            description: data.description,
            image_url: data.image_url,
            slug: data.slug,
          });
        
        if (error) throw error;
        return { success: true, action: 'created' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: `Category ${result.action}`,
        description: `The category has been successfully ${result.action}.`,
      });
      setIsCategoryDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save category',
      });
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Category deleted',
        description: 'The category has been successfully deleted.',
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete category',
      });
    },
  });

  // Handle category dialog open
  const handleAddCategory = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      slug: '',
    });
    setIsCategoryDialogOpen(true);
  };

  // Handle edit category
  const handleEditCategory = (category: any) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      slug: category.slug,
    });
    setIsCategoryDialogOpen(true);
  };

  // Handle delete category
  const handleDeleteCategory = (category: any) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Handle manage subcategories
  const handleManageSubcategories = (category: any) => {
    setSelectedCategoryId(category.id);
    setActiveTab('subcategories');
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    categoryMutation.mutate(formData);
  };

  // Filter categories by search query
  const filteredCategories = categories?.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get subcategory count for a category
  const getSubcategoryCount = (categoryId: string): number => {
    return subcategoryCounts[categoryId] || 0;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          {selectedCategoryId && (
            <TabsTrigger value="subcategories">
              Subcategories for {categories?.find(c => c.id === selectedCategoryId)?.name}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="categories">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                className="pl-10" 
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
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
                      {filteredCategories?.length ? (
                        filteredCategories.map((category) => (
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
                                  <DropdownMenuItem onClick={() => handleManageSubcategories(category)}>
                                    <ListTree className="h-4 w-4 mr-2" />
                                    Manage Subcategories
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteCategory(category)}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcategories">
          {selectedCategoryId && categories && (
            <div className="mb-4">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('categories')}
              >
                ← Back to Categories
              </Button>
              
              <SubcategoriesTable 
                categoryId={selectedCategoryId} 
                categoryName={categories.find(c => c.id === selectedCategoryId)?.name || ''}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Category Dialog (Add/Edit) */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Edit the category details below.'
                : 'Fill in the category details to add a new category.'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="auto-generated-if-empty"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-2 relative w-20 h-20">
                    <img 
                      src={formData.image_url} 
                      alt="Category preview" 
                      className="rounded object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Invalid+Image';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit"
                disabled={categoryMutation.isPending}
              >
                {categoryMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  isEditing ? 'Update Category' : 'Add Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentCategory?.name}"? This action cannot be undone and may affect products in this category.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              onClick={() => currentCategory && deleteMutation.mutate(currentCategory.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                  Deleting...
                </>
              ) : 'Delete Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
