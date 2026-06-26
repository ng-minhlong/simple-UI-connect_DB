'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Package, RefreshCw, Factory } from 'lucide-react';
import PickupHelperWidget from '@/components/PickupHelperWidget';

const stages = [{ code: 'CAT', name: 'Cắt' }, { code: 'MAY', name: 'May' }, { code: 'HOAN_THIEN', name: 'Hoàn thiện' }];
const linesMap = {
    CAT: ['TO_CAT'],
    MAY: ['LINE_01', 'LINE_02', 'LINE_03'],
    HOAN_THIEN: ['TO_HT']
};

export default function PlanPage() {
    const [filter, setFilter] = useState({ date: '2026-06-26', product: 'SP001', stage: 'MAY' });
    const [slots, setSlots] = useState<any[]>([]);
    const [gridData, setGridData] = useState<Record<string, number>>({});
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        fetch(`/api/timeslots/${filter.stage}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => setSlots(data));
    }, [filter.stage]);

    useEffect(() => {
        if (slots.length === 0) return;
        fetch(`/api/production?date=${filter.date}&productCode=${filter.product}&stageCode=${filter.stage}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                let dataMap: Record<string, number> = {};
                data.forEach((item: any) => { dataMap[`${item.LineCode}-${item.SlotCode}`] = item.PlanQuantity; });
                setGridData(dataMap);
            });
    }, [filter, slots, refresh]);

    const handlePlanChange = (line: string, slotCode: string, value: string) => {
        const intValue = parseInt(value) || 0;
        setGridData((prev: Record<string, number>) => ({ ...prev, [`${line}-${slotCode}`]: intValue }));
        
        fetch('/api/production/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: filter.date, productCode: filter.product, stageCode: filter.stage,
                lineCode: line, slotCode: slotCode, planQty: intValue, actualQty: null, user: 'P_KE_HOACH'
            })
        });
    };

    const currentLines = linesMap[filter.stage as keyof typeof linesMap] || [];

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Lập Kế Hoạch Sản Xuất</h1>
                <p className="text-gray-600">Giao chỉ tiêu sản xuất cho các chuyền/tổ theo khung giờ</p>
            </div>
            
            <PickupHelperWidget productCode={filter.product} stageCode={filter.stage} refreshTrigger={refresh} />

            <div className="bg-white border border-black rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Factory className="w-4 h-4" />
                            Công đoạn
                        </label>
                        <select 
                            value={filter.stage} 
                            onChange={e => setFilter({ ...filter, stage: e.target.value })}
                            className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            {stages.map(st => <option key={st.code} value={st.code}>{st.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Mã hàng
                        </label>
                        <input 
                            type="text" 
                            value={filter.product} 
                            onChange={e => setFilter({ ...filter, product: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Nhập mã hàng..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Ngày chạy
                        </label>
                        <input 
                            type="date" 
                            value={filter.date} 
                            onChange={e => setFilter({ ...filter, date: e.target.value })}
                            className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                    <div className="flex items-end">
                        <button 
                            onClick={() => setRefresh((p: number) => p + 1)}
                            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Tải lại
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-black rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="px-6 py-4 text-left font-semibold">Bộ phận / Chuyền</th>
                                {slots.map(s => (
                                    <th key={s.SlotCode} className="px-6 py-4 text-left font-semibold">{s.SlotName}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentLines.map((line, index) => (
                                <tr key={line} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="px-6 py-4 font-medium border-b border-black">
                                        {line.replace('LINE_0', 'Chuyền ').replace('TO_', 'Tổ ')}
                                    </td>
                                    {slots.map((s: any) => (
                                        <td key={s.SlotCode} className="px-6 py-4 border-b border-black">
                                            <input 
                                                type="number" 
                                                placeholder="0"
                                                value={gridData[`${line}-${s.SlotCode}`] || ''} 
                                                onChange={e => handlePlanChange(line, s.SlotCode, e.target.value)} 
                                                className="w-full px-4 py-2 border border-black rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-black"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
