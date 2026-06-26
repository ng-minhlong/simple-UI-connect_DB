import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PickupHelperWidget from './PickupHelperWidget';

const stages = [{ code: 'CAT', name: 'Cắt' }, { code: 'MAY', name: 'May' }, { code: 'HOAN_THIEN', name: 'Hoàn thiện' }];
const linesMap = { CAT: ['TO_CAT'], MAY: ['LINE_01', 'LINE_02', 'LINE_03'], HOAN_THIEN: ['TO_HT'] };

export default function ActualPage() {
    const [filter, setFilter] = useState({ date: '2026-06-26', product: 'SP001', stage: 'MAY', line: 'LINE_01' });
    const [slots, setSlots] = useState([]);
    const [rows, setRows] = useState([]);
    const [refresh, setRefresh] = useState(0);

    // 1. Tự động lấy khung giờ riêng biệt của công đoạn tổ đang làm
    useEffect(() => {
        axios.get(`http://localhost:5000/api/timeslots/${filter.stage}`).then(res => setSlots(res.data));
    }, [filter.stage]);

    // 2. Trộn dữ liệu Kế hoạch (lấy từ trang 1) và Thực tế để hiển thị đối chiếu cho tổ trưởng thấy
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

    // 3. Hàm ghi nhận sản lượng thực tế sản xuất được dưới chuyền
    const handleActualChange = (slotCode, value) => {
        const intValue = parseInt(value) || 0;
        setRows(prev => prev.map(r => r.slotCode === slotCode ? { ...r, actualQty: intValue } : r));

        axios.post('http://localhost:5000/api/production/save', {
            date: filter.date, productCode: filter.product, stageCode: filter.stage,
            lineCode: filter.line, slotCode: slotCode, planQty: null, actualQty: intValue, user: 'TO_TRUONG'
        }).then(() => setRefresh(p => p + 1)); // Cập nhật lại Widget tiến độ tổng ngay lập tức
    };

    return (
        <div style={{ padding: '15px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <PickupHelperWidget productCode={filter.product} stageCode={filter.stage} refreshTrigger={refresh} />
            
            <h3 style={{ color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '6px', marginTop: 0 }}>
                📱 TRANG NHẬP SẢN LƯỢNG THỰC TẾ (DÀNH CHO CHUYỀN/TỔ)
            </h3>
            
            {/* Bộ chọn Chuyền/Bộ phận làm việc */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Bộ phận:</label>
                    <select value={filter.stage} onChange={e => { const st = e.target.value; setFilter({ ...filter, stage: st, line: linesMap[st][0] }); }} style={{ padding: '8px', width: '100%', marginTop: '4px' }}>
                        {stages.map(st => <option key={st.code} value={st.code}>{st.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Tên Chuyền/Tổ:</label>
                    <select value={filter.line} onChange={e => setFilter({ ...filter, line: e.target.value })} style={{ padding: '8px', width: '100%', marginTop: '4px' }}>
                        {(linesMap[filter.stage] || []).map(li => <option key={li} value={li}>{li.replace('LINE_0', 'Chuyền ').replace('TO_', 'Tổ ')}</option>)}
                    </select>
                </div>
            </div>

            {/* Danh sách nhập liệu dạng thẻ (Card) tương thích điện thoại */}
            {rows.map(row => {
                const diff = row.actualQty - row.planQty;
                return (
                    <div key={row.slotCode} style={{ border: '1px solid #ccc', borderRadius: '6px', padding: '15px', marginBottom: '12px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '10px', fontSize: '15px' }}>
                            <span>⏰ Khung giờ: {row.slotName}</span>
                            <span style={{ color: '#555' }}>Chỉ tiêu KH giao: <b style={{ color: '#0056b3' }}>{row.planQty}</b></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '3px' }}>Sản lượng thực tế đếm được:</label>
                                <input 
                                    type="number" 
                                    placeholder="Gõ số lượng..." 
                                    value={row.actualQty || ''} 
                                    onChange={e => handleActualChange(row.slotCode, e.target.value)} 
                                    style={{ width: '90%', padding: '10px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', borderRadius: '4px', border: '1px solid #bbb' }} 
                                />
                            </div>
                            <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>Chênh lệch</span>
                                <strong style={{ color: diff >= 0 ? 'green' : 'red', fontSize: '20px' }}>
                                    {diff >= 0 ? `+${diff}` : diff}
                                </strong>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
