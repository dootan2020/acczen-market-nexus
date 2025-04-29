
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoyaltyTier, LoyaltyTransaction, UserLoyaltyInfo } from '@/types/loyalty';
import { Badge } from '@/components/ui/badge';
import { Award, Users, Star, PlusCircle, Pencil, Trash, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const AdminLoyaltyManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tiers');
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for new/edited tier
  const [tierForm, setTierForm] = useState<{
    name: string;
    min_points: number;
    discount_percentage: number;
    special_perks: string;
    icon_url: string;
  }>({
    name: '',
    min_points: 0,
    discount_percentage: 0,
    special_perks: '',
    icon_url: ''
  });

  // Fetch all loyalty tiers
  const { data: loyaltyTiers, isLoading: isLoadingTiers } = useQuery({
    queryKey: ['admin-loyalty-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .order('min_points', { ascending: true });
      
      if (error) throw error;
      return data as LoyaltyTier[];
    },
  });

  // Fetch all users with their loyalty information
  const { data: usersWithLoyalty, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users-loyalty'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          email,
          full_name,
          loyalty_points,
          current_tier_id,
          loyalty_tiers (
            name,
            min_points,
            discount_percentage
          )
        `)
        .order('loyalty_points', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: activeTab === 'users'
  });

  // Add loyalty tier mutation
  const addTierMutation = useMutation({
    mutationFn: async (tier: Omit<LoyaltyTier, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('loyalty_tiers')
        .insert([tier])
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Thành công!', description: 'Đã thêm cấp độ thành viên mới' });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-loyalty-tiers'] });
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: 'Lỗi', 
        description: `Không thể thêm cấp độ thành viên: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // Update loyalty tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async ({ 
      id, 
      ...tier 
    }: { id: string } & Omit<LoyaltyTier, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('loyalty_tiers')
        .update(tier)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Thành công!', description: 'Đã cập nhật cấp độ thành viên' });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-loyalty-tiers'] });
      setEditingTier(null);
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: 'Lỗi', 
        description: `Không thể cập nhật cấp độ thành viên: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // Delete loyalty tier mutation
  const deleteTierMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loyalty_tiers')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Thành công!', description: 'Đã xóa cấp độ thành viên' });
      queryClient.invalidateQueries({ queryKey: ['admin-loyalty-tiers'] });
    },
    onError: (error) => {
      toast({ 
        title: 'Lỗi', 
        description: `Không thể xóa cấp độ thành viên: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  // Reset form
  const resetForm = () => {
    setTierForm({
      name: '',
      min_points: 0,
      discount_percentage: 0,
      special_perks: '',
      icon_url: ''
    });
  };

  // Handle form open for editing
  const handleEditTier = (tier: LoyaltyTier) => {
    setEditingTier(tier);
    setTierForm({
      name: tier.name,
      min_points: tier.min_points,
      discount_percentage: tier.discount_percentage,
      special_perks: tier.special_perks.join(', '),
      icon_url: tier.icon_url || ''
    });
    setIsDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert comma-separated perks to array
    const formattedPerks = tierForm.special_perks
      .split(',')
      .map(perk => perk.trim())
      .filter(Boolean);
    
    if (editingTier) {
      updateTierMutation.mutate({
        id: editingTier.id,
        name: tierForm.name,
        min_points: tierForm.min_points,
        discount_percentage: tierForm.discount_percentage,
        special_perks: formattedPerks,
        icon_url: tierForm.icon_url
      });
    } else {
      addTierMutation.mutate({
        name: tierForm.name,
        min_points: tierForm.min_points,
        discount_percentage: tierForm.discount_percentage,
        special_perks: formattedPerks,
        icon_url: tierForm.icon_url
      });
    }
  };

  // Filter users based on search
  const filteredUsers = usersWithLoyalty?.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics for dashboard
  const tierDistribution = loyaltyTiers?.map(tier => {
    const count = usersWithLoyalty?.filter(user => 
      user.loyalty_tiers?.name === tier.name
    ).length || 0;

    return {
      tier: tier.name,
      count,
      percentage: usersWithLoyalty ? (count / usersWithLoyalty.length) * 100 : 0
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Quản lý chương trình thành viên</h1>
      </div>

      <Tabs defaultValue="tiers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tiers" className="flex items-center">
            <Award className="mr-2 h-4 w-4" />
            Cấp độ thành viên
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center">
            <Star className="mr-2 h-4 w-4" />
            Thống kê
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Tiers Tab */}
          <TabsContent value="tiers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Danh sách cấp độ thành viên</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setEditingTier(null);
                      resetForm();
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Thêm cấp độ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingTier ? 'Chỉnh sửa cấp độ' : 'Thêm cấp độ mới'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="name">Tên cấp độ</label>
                        <Input
                          id="name"
                          placeholder="Bronze, Silver, Gold, ..."
                          value={tierForm.name}
                          onChange={(e) => setTierForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="min_points">Điểm tối thiểu</label>
                        <Input
                          id="min_points"
                          type="number"
                          placeholder="0"
                          value={tierForm.min_points}
                          onChange={(e) => setTierForm(prev => ({ ...prev, min_points: parseInt(e.target.value) }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="discount">% Giảm giá</label>
                        <Input
                          id="discount"
                          type="number"
                          placeholder="0"
                          value={tierForm.discount_percentage}
                          onChange={(e) => setTierForm(prev => ({ ...prev, discount_percentage: parseFloat(e.target.value) }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="perks">Đặc quyền (phân cách bằng dấu phẩy)</label>
                        <Input
                          id="perks"
                          placeholder="Free shipping, Priority support, ..."
                          value={tierForm.special_perks}
                          onChange={(e) => setTierForm(prev => ({ ...prev, special_perks: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="icon_url">URL Icon</label>
                        <Input
                          id="icon_url"
                          placeholder="/images/loyalty/bronze.png"
                          value={tierForm.icon_url}
                          onChange={(e) => setTierForm(prev => ({ ...prev, icon_url: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button 
                        type="submit"
                        disabled={addTierMutation.isPending || updateTierMutation.isPending}
                      >
                        {addTierMutation.isPending || updateTierMutation.isPending ? 
                          'Đang xử lý...' : 
                          editingTier ? 'Lưu' : 'Thêm'
                        }
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingTiers ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-muted">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tên cấp độ</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Điểm tối thiểu</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">% Giảm giá</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Đặc quyền</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loyaltyTiers?.map((tier) => (
                      <tr key={tier.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Badge className="mr-2">{tier.name}</Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{tier.min_points}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{tier.discount_percentage}%</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {tier.special_perks.map((perk, idx) => (
                              <Badge key={idx} variant="outline">{perk}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditTier(tier)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc muốn xóa cấp độ ${tier.name}?`)) {
                                  deleteTierMutation.mutate(tier.id);
                                }
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Người dùng và điểm thành viên</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm người dùng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full md:w-60"
                />
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-muted">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Người dùng</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Điểm thành viên</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cấp độ</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">% Giảm giá</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers?.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium">{user.full_name || user.username}</div>
                            <div className="text-gray-500 text-sm">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {user.loyalty_points || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.loyalty_tiers ? (
                            <Badge>{user.loyalty_tiers.name}</Badge>
                          ) : (
                            <span className="text-gray-500">Chưa có</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.loyalty_tiers?.discount_percentage || 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Phân bổ thành viên theo cấp độ</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers || isLoadingTiers ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tierDistribution?.map((item) => (
                        <div key={item.tier} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Badge className="mr-2">{item.tier}</Badge>
                              <span className="text-sm text-muted-foreground">{item.count} người dùng</span>
                            </div>
                            <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Thống kê tổng quan</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="divide-y">
                      <div className="py-4">
                        <div className="text-sm text-muted-foreground">Tổng số người dùng tham gia</div>
                        <div className="text-3xl font-bold">
                          {usersWithLoyalty?.filter(user => user.loyalty_points && user.loyalty_points > 0).length || 0}
                        </div>
                      </div>
                      <div className="py-4">
                        <div className="text-sm text-muted-foreground">Trung bình điểm mỗi người dùng</div>
                        <div className="text-3xl font-bold">
                          {usersWithLoyalty && usersWithLoyalty.length > 0 
                            ? Math.round(usersWithLoyalty.reduce((sum, user) => sum + (user.loyalty_points || 0), 0) / usersWithLoyalty.length)
                            : 0}
                        </div>
                      </div>
                      <div className="py-4">
                        <div className="text-sm text-muted-foreground">Tổng điểm trong hệ thống</div>
                        <div className="text-3xl font-bold">
                          {usersWithLoyalty?.reduce((sum, user) => sum + (user.loyalty_points || 0), 0) || 0}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
