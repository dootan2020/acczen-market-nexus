
import React from 'react';
import { useLoyalty } from '@/hooks/useLoyalty';
import { LoyaltyStatusCard } from '@/components/loyalty/LoyaltyStatusCard';
import { LoyaltyTierProgress } from '@/components/loyalty/LoyaltyTierProgress';
import { LoyaltyBenefits } from '@/components/loyalty/LoyaltyBenefits';
import { LoyaltyTransactionHistory } from '@/components/loyalty/LoyaltyTransactionHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BadgePercent, Award, History } from 'lucide-react';

const LoyaltyPage: React.FC = () => {
  const { 
    loyaltyDetails, 
    transactions, 
    isLoadingLoyaltyInfo, 
    allTiers 
  } = useLoyalty();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Chương trình thành viên</h1>
        <p className="text-muted-foreground">Theo dõi cấp độ thành viên và các đặc quyền của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LoyaltyStatusCard
            loyaltyInfo={loyaltyDetails} 
            isLoading={isLoadingLoyaltyInfo} 
          />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tiến trình thành viên</CardTitle>
              <CardDescription>
                Tiến độ đạt các cấp độ thành viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoyaltyTierProgress 
                loyaltyInfo={loyaltyDetails}
                allTiers={allTiers}
                isLoading={isLoadingLoyaltyInfo}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="benefits" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="benefits" className="flex items-center">
            <Award className="mr-2 h-4 w-4" />
            Lợi ích & đặc quyền
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <History className="mr-2 h-4 w-4" />
            Lịch sử giao dịch
          </TabsTrigger>
        </TabsList>
        <TabsContent value="benefits">
          <LoyaltyBenefits 
            allTiers={allTiers}
            currentTierName={loyaltyDetails?.current_tier_name || null}
            isLoading={isLoadingLoyaltyInfo}
          />
        </TabsContent>
        <TabsContent value="history">
          <LoyaltyTransactionHistory
            transactions={transactions}
            isLoading={isLoadingLoyaltyInfo}
          />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-lg">Cách tích điểm</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Mua sản phẩm</span>
                <span className="font-medium">1 điểm/$1</span>
              </li>
              <li className="flex justify-between">
                <span>Đánh giá sản phẩm</span>
                <span className="font-medium">5 điểm</span>
              </li>
              <li className="flex justify-between">
                <span>Giới thiệu bạn bè</span>
                <span className="font-medium">50 điểm</span>
              </li>
              <li className="flex justify-between">
                <span>Đăng ký newsletter</span>
                <span className="font-medium">10 điểm</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <BadgePercent className="h-4 w-4 text-green-500" />
              <CardTitle className="text-lg">Điểm của bạn</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Tổng điểm đã tích lũy:</span>
                <span className="font-medium">{loyaltyDetails?.loyalty_points || 0}</span>
              </div>
              {loyaltyDetails?.next_tier_name && (
                <div className="flex justify-between">
                  <span className="text-sm">Còn thiếu để lên {loyaltyDetails.next_tier_name}:</span>
                  <span className="font-medium">{loyaltyDetails.points_to_next_tier} điểm</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm">Giảm giá hiện tại:</span>
                <span className="font-medium">{loyaltyDetails?.current_tier_discount || 0}%</span>
              </div>
              {loyaltyDetails?.next_tier_name && (
                <div className="flex justify-between">
                  <span className="text-sm">Giảm giá tiếp theo:</span>
                  <span className="font-medium">
                    {allTiers.find(t => t.name === loyaltyDetails.next_tier_name)?.discount_percentage || 0}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-lg">Thống kê</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Tổng số giao dịch:</span>
                <span className="font-medium">{transactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Điểm cao nhất nhận được:</span>
                <span className="font-medium">
                  {transactions.length > 0 
                    ? Math.max(...transactions
                        .filter(t => t.transaction_type === 'earned')
                        .map(t => t.points)) 
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Giao dịch gần nhất:</span>
                <span className="font-medium">
                  {transactions.length > 0 
                    ? new Date(transactions[0].created_at).toLocaleDateString('vi-VN') 
                    : 'Chưa có'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Thành viên từ:</span>
                <span className="font-medium">
                  {transactions.length > 0 
                    ? new Date(transactions[transactions.length - 1].created_at).toLocaleDateString('vi-VN')
                    : new Date().toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoyaltyPage;
