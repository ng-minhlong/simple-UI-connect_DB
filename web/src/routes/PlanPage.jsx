import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PickupHelperWidget from './PickupHelperWidget'; // Widget hiển thị ngày khách lấy hàng

const stages = [{ code: 'CAT', name: 'Cắt' }, { code: 'MAY', name: 'May' }, { code: 'HOAN_THIEN', name: 'Hoàn thiện' }];
const linesMap = {
    CAT: ['TO_CAT'],
    MAY: ['LINE_01', 'LINE_02', 'LINE_03'],
    HOAN_THIEN: ['TO_HT']
};

export default function PlanPage() {
    const [filter, setFilter] = useState({ date: '2026-06-26', product: 'SP001', stage: 'MAY' });
    const [slots, setSlots] = useState([]); // Khung giờ của công đoạn được chọn
    const [gridData, setGridData] = useState({});
    const [refresh, setRefresh] = useState(0);

    // 1. Tự động lấy khung giờ riêng biệt khi đổi Công đoạn
    useEffect(() => {
        axios.get(`http://localhost:5000/api/timeslots/${filter.stage}`)
            .then(res => setSlots(res.data));
    }, [filter.stage]);

    // 2. Lấy dữ liệu kế hoạch đã lập
    useEffect(() => {
        if (slots.length === 0) return;
        axios.get(`http://localhost:5000/api/production?date=${filter.date}&productCode=${filter.product}&stageCode=${filter.stage}`)
            .then(res => {
                let dataMap = {};
                res.data.forEach(item => { dataMap[`${item.LineCode}-${item.SlotCode}`] = item.PlanQuantity; });
                setGridData(dataMap);
            });
    }, [filter, slots, refresh]);

    // 3. Hàm lưu số lượng kế hoạch khi nhân viên gõ vào ô nhập liệu
    const handlePlanChange = (line, slotCode, value) => {
        const intValue = parseInt(value) || 0;
        setGridData(prev => ({ ...prev, [`${line}-${slotCode}`]: intValue }));
        
        axios.post('http://localhost:5000/api/production/save', {
            date: filter.date, productCode: filter.product, stageCode: filter.stage,
            lineCode: line, slotCode: slotCode, planQty: intValue, actualQty: null, user: 'P_KE_HOACH'
        });
    };

    const currentLines = linesMap[filter.stage] || [];

    return (
        <div style={{ padding: '25px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ color: '#0056b3', borderBottom: '2px solid #0056b3', paddingBottom: '10px' }}>
                💻 MÀN HÌNH QUẢN LÝ LẬP KẾ HOẠCH SẢN XUẤT
            </h2>
            
            {/* Thanh hiển thị cảnh báo hạn khách lấy và tiến độ dự kiến */}
            <PickupHelperWidget productCode={filter.product} stageCode={filter.stage} refreshTrigger={refresh} />

            {/* Bộ lọc công việc đầu ca */}
            <div style={{ display: 'flex', gap: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ddd' }}>
                <div>
                    <label style={{ fontWeight: 'bold', fontSize: '13px' }}>1. Chọn Công đoạn sản xuất:</label><br />
                    <select value={filter.stage} onChange={e => setFilter({ ...filter, stage: e.target.value })} style={{ padding: '6px', width: '200px', marginTop: '5px' }}>
                        {stages.map(st => <option key={st.code} value={st.code}>{st.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontWeight: 'bold', fontSize: '13px' }}>2. Mã hàng:</label><br />
                    <input type="text" value={filter.product} onChange={e => setFilter({ ...filter, product: e.target.value.toUpperCase() })} style={{ padding: '5px', marginTop: '5px' }} />
                </div>
                <div>
                    <label style={{ fontWeight: 'bold', fontSize: '13px' }}>3. Ngày chạy kế hoạch:</label><br />
                    <input type="date" value={filter.date} onChange={e => setFilter({ ...filter, date: e.target.value })} style={{ padding: '5px', marginTop: '5px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button onClick={() => setRefresh(p => p + 1)} style={{ padding: '7px 15px', cursor: 'pointer', fontWeight: 'bold' }}>Tải lại dữ liệu</button>
                </div>
            </div>

            {/* Bảng ma trận giao chỉ tiêu */}
            <table border="1" cellPadding="12" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#0056b3', color: '#fff' }}>
                        <th style={{ width: '200px' }}>Bộ phận / Chuyền nhận chỉ tiêu</th>
                        {slots.map(s => <th key={s.SlotCode}>Khung giờ: {s.SlotName}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {currentLines.map(line => (
                        <tr key={line}>
                            <td style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                                {line.replace('LINE_0', 'Chuyền ').replace('TO_', 'Tổ ')}
                            </td>
                            {slots.map(s => (
                                <td key={s.SlotCode}>
                                    <input 
                                        type="number" 
                                        placeholder="Giao số lượng..."
                                        value={gridData[`${line}-${s.SlotCode}`] || ''} 
                                        onChange={e => handlePlanChange(line, s.SlotCode, e.target.value)} 
                                        style={{ width: '85%', padding: '8px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' }} 
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
