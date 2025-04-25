
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubcategoryCRUD } from "@/hooks/useSubcategories";
import { FolderTree } from "lucide-react";

interface SubcategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  subcategory?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    category_id: string;
  };
  isEditing?: boolean;
}

const subcategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image_url: z.string().optional(),
});

type FormData = z.infer<typeof subcategorySchema>;

export default function SubcategoryDialog({
  open,
  onOpenChange,
  categoryId,
  subcategory,
  isEditing = false,
}: SubcategoryDialogProps) {
  const { createSubcategory, updateSubcategory } = useSubcategoryCRUD();

  const form = useForm<FormData>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: subcategory?.name || "",
      slug: subcategory?.slug || "",
      description: subcategory?.description || "",
      image_url: subcategory?.image_url || "",
    },
  });

  // Reset form when dialog opens/closes or subcategory changes
  useEffect(() => {
    if (open && subcategory) {
      form.reset({
        name: subcategory.name,
        slug: subcategory.slug,
        description: subcategory.description || "",
        image_url: subcategory.image_url || "",
      });
    } else if (open && !subcategory) {
      form.reset({
        name: "",
        slug: "",
        description: "",
        image_url: "",
      });
    }
  }, [open, subcategory, form]);

  // Generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!form.getValues("slug") || !isEditing) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-");
      form.setValue("slug", slug);
    }
  };

  const onSubmit = (data: FormData) => {
    if (isEditing && subcategory) {
      updateSubcategory.mutate({
        id: subcategory.id,
        name: data.name,
        slug: data.slug,
        category_id: categoryId,
        description: data.description,
        image_url: data.image_url,
      });
    } else {
      createSubcategory.mutate({
        name: data.name,
        slug: data.slug,
        category_id: categoryId,
        description: data.description,
        image_url: data.image_url,
      });
    }

    if (!updateSubcategory.isPending && !createSubcategory.isPending) {
      onOpenChange(false);
    }
  };

  const isPending = createSubcategory.isPending || updateSubcategory.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Subcategory" : "Add New Subcategory"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edit the subcategory details below."
              : "Fill in the subcategory details to add a new subcategory."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/image.jpg" />
                  </FormControl>
                  <FormMessage />
                  {field.value && (
                    <div className="mt-2 relative w-20 h-20">
                      <img
                        src={field.value}
                        alt="Subcategory preview"
                        className="rounded object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/400x400?text=Invalid+Image";
                        }}
                      />
                    </div>
                  )}
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                    Saving...
                  </>
                ) : isEditing ? (
                  "Update Subcategory"
                ) : (
                  "Add Subcategory"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
