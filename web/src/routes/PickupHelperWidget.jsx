import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Calendar, AlertCircle, TrendingUp } from 'lucide-react';

export default function PickupHelperWidget({ productCode, stageCode, refreshTrigger }) {
    const [productInfo, setProductInfo] = useState(null);
    const [totalPlan, setTotalPlan] = useState(0);
    const [totalActual, setTotalActual] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const productRes = await axios.get(`http://localhost:5000/api/product/${productCode}`);
                setProductInfo(productRes.data);

                const productionRes = await axios.get(
                    `http://localhost:5000/api/production?date=${new Date().toISOString().split('T')[0]}&productCode=${productCode}&stageCode=${stageCode}`
                );
                
                const data = productionRes.data;
                const planSum = data.reduce((sum, item) => sum + (item.PlanQuantity || 0), 0);
                const actualSum = data.reduce((sum, item) => sum + (item.ActualQuantity || 0), 0);
                
                setTotalPlan(planSum);
                setTotalActual(actualSum);
            } catch (err) {
                setError('Không thể tải dữ liệu');
                console.error('Error fetching widget data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (productCode && stageCode) {
            fetchData();
        }
    }, [productCode, stageCode, refreshTrigger]);

    if (loading) {
        return (
            <div className="bg-gray-50 border border-black rounded-lg p-6 mb-6 text-center">
                Đang tải dữ liệu...
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border-2 border-black rounded-lg p-6 mb-6">
                <div className="flex items-center gap-2 text-black">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    const daysUntilPickup = productInfo?.CustomerPickupDate 
        ? Math.ceil((new Date(productInfo.CustomerPickupDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const progress = totalPlan > 0 ? Math.round((totalActual / totalPlan) * 100) : 0;
    const isUrgent = daysUntilPickup !== null && daysUntilPickup <= 3;

    return (
        <div className={`
            border-2 rounded-lg p-6 mb-6
            ${isUrgent ? 'bg-white border-black' : 'bg-white border-black'}
        `}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Thông tin sản phẩm
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Mã hàng:</span> {productCode}</div>
                        <div><span className="font-medium">Tổng số lượng:</span> {productInfo?.TotalQuantity || 0} cái</div>
                        {productInfo?.CustomerPickupDate && (
                            <div className={`
                                font-bold mt-3
                                ${isUrgent ? 'text-black' : 'text-gray-700'}
                            `}>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Ngày khách lấy: {new Date(productInfo.CustomerPickupDate).toLocaleDateString('vi-VN')}</span>
                                </div>
                                {daysUntilPickup !== null && (
                                    <div className="text-xs mt-1">
                                        ({daysUntilPickup > 0 ? `còn ${daysUntilPickup} ngày` : 'đã đến hạn'})
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Tiến độ sản xuất
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Kế hoạch:</span> {totalPlan}</div>
                        <div><span className="font-medium">Thực tế:</span> {totalActual}</div>
                        <div className="mt-4">
                            <div className="bg-gray-200 rounded-full h-4 border border-black overflow-hidden">
                                <div 
                                    className="bg-black h-full transition-all duration-300"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                            <div className="text-center mt-2 font-bold text-lg">
                                {progress}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
