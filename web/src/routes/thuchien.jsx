import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Factory, Users, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import PickupHelperWidget from './PickupHelperWidget';

const stages = [{ code: 'CAT', name: 'Cắt' }, { code: 'MAY', name: 'May' }, { code: 'HOAN_THIEN', name: 'Hoàn thiện' }];
const linesMap = { CAT: ['TO_CAT'], MAY: ['LINE_01', 'LINE_02', 'LINE_03'], HOAN_THIEN: ['TO_HT'] };

export default function ActualPage() {
    const [filter, setFilter] = useState({ date: '2026-06-26', product: 'SP001', stage: 'MAY', line: 'LINE_01' });
    const [slots, setSlots] = useState([]);
    const [rows, setRows] = useState([]);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/timeslots/${filter.stage}`).then(res => setSlots(res.data));
    }, [filter.stage]);

    useEffect(() => {
        if (slots.length === 0) return;
        axios.get(`http://localhost:5000/api/production?date=${filter.date}&productCode=${filter.product}&stageCode=${filter.stage}`)
            .then(res => {
                const lineData = res.data.filter(item => item.LineCode === filter.line);
                const combined = slots.map(slot => {
                    const match = lineData.find(d => d.SlotCode === slot.SlotCode);
                    return {
                        slotCode: slot.SlotCode,
                        slotName: slot.SlotName,
                        planQty: match ? match.PlanQuantity : 0,
                        actualQty: match ? match.ActualQuantity : 0
                    };
                });
                setRows(combined);
            });
    }, [filter, slots, refresh]);

    const handleActualChange = (slotCode, value) => {
        const intValue = parseInt(value) || 0;
        setRows(prev => prev.map(r => r.slotCode === slotCode ? { ...r, actualQty: intValue } : r));

        axios.post('http://localhost:5000/api/production/save', {
            date: filter.date, productCode: filter.product, stageCode: filter.stage,
            lineCode: filter.line, slotCode: slotCode, planQty: null, actualQty: intValue, user: 'TO_TRUONG'
        }).then(() => setRefresh(p => p + 1));
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Nhập Sản Lượng Thực Tế</h1>
                <p className="text-gray-600">Dành cho Chuyền/Tổ nhập sản lượng thực tế sản xuất</p>
            </div>

            <PickupHelperWidget productCode={filter.product} stageCode={filter.stage} refreshTrigger={refresh} />
            
            <div className="bg-white border border-black rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Factory className="w-4 h-4" />
                            Bộ phận
                        </label>
                        <select 
                            value={filter.stage} 
                            onChange={e => { const st = e.target.value; setFilter({ ...filter, stage: st, line: linesMap[st][0] }); }}
                            className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            {stages.map(st => <option key={st.code} value={st.code}>{st.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Tên Chuyền/Tổ
                        </label>
                        <select 
                            value={filter.line} 
                            onChange={e => setFilter({ ...filter, line: e.target.value })}
                            className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            {(linesMap[filter.stage] || []).map(li => <option key={li} value={li}>{li.replace('LINE_0', 'Chuyền ').replace('TO_', 'Tổ ')}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {rows.map(row => {
                    const diff = row.actualQty - row.planQty;
                    const isPositive = diff >= 0;
                    return (
                        <div 
                            key={row.slotCode} 
                            className="bg-white border border-black rounded-lg p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-6 h-6" />
                                    <span className="text-lg font-semibold">{row.slotName}</span>
                                </div>
                                <div className="bg-gray-100 px-4 py-2 rounded-lg font-semibold">
                                    Chỉ tiêu KH: {row.planQty}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium mb-2">Sản lượng thực tế</label>
                                    <input 
                                        type="number" 
                                        placeholder="Gõ số lượng..." 
                                        value={row.actualQty || ''} 
                                        onChange={e => handleActualChange(row.slotCode, e.target.value)} 
                                        className="w-full px-4 py-3 border border-black rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                                <div className={`
                                    text-center min-w-[120px] px-6 py-4 rounded-lg border-2 font-bold
                                    ${isPositive ? 'bg-white border-black text-black' : 'bg-black border-black text-white'}
                                `}>
                                    <div className="text-xs mb-1">Chênh lệch</div>
                                    <div className="text-3xl flex items-center justify-center gap-2">
                                        {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                                        {diff >= 0 ? `+${diff}` : diff}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
