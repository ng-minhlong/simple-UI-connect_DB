import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import { Calendar, Package, RefreshCw, Factory } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const stages = [{ code: 'CAT', name: 'Cắt' }, { code: 'MAY', name: 'May' }, { code: 'HOAN_THIEN', name: 'Hoàn thiện' }];
const linesMap = {
    CAT: ['TO_CAT'],
    MAY: ['LINE_01', 'LINE_02', 'LINE_03'],
    HOAN_THIEN: ['TO_HT']
};

export default function PlanScreen() {
    const [filter, setFilter] = useState({ date: '2026-06-26', product: 'SP001', stage: 'MAY' });
    const [slots, setSlots] = useState([]);
    const [gridData, setGridData] = useState({});
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        axios.get('http://localhost:5000/api/timeslots/' + filter.stage)
            .then(res => setSlots(res.data))
            .catch(err => console.error('Error fetching timeslots:', err));
    }, [filter.stage]);

    useEffect(() => {
        if (slots.length === 0) return;
        axios.get(`http://localhost:5000/api/production?date=${filter.date}&productCode=${filter.product}&stageCode=${filter.stage}`)
            .then(res => {
                let dataMap = {};
                res.data.forEach(item => { dataMap[`${item.LineCode}-${item.SlotCode}`] = item.PlanQuantity; });
                setGridData(dataMap);
            })
            .catch(err => console.error('Error fetching production:', err));
    }, [filter, slots, refresh]);

    const handlePlanChange = (line, slotCode, value) => {
        const intValue = parseInt(value) || 0;
        setGridData(prev => ({ ...prev, [`${line}-${slotCode}`]: intValue }));
        
        axios.post('http://localhost:5000/api/production/save', {
            date: filter.date, productCode: filter.product, stageCode: filter.stage,
            lineCode: line, slotCode: slotCode, planQty: intValue, actualQty: null, user: 'P_KE_HOACH'
        }).catch(err => console.error('Error saving:', err));
    };

    const currentLines = linesMap[filter.stage] || [];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>Lập Kế Hoạch Sản Xuất</Text>
                    <Text style={styles.subtitle}>Giao chỉ tiêu sản xuất cho các chuyền/tổ</Text>
                </View>

                <View style={styles.filterSection}>
                    <View style={styles.filterRow}>
                        <View style={styles.filterItem}>
                            <Text style={styles.label}>Công đoạn</Text>
                            <View style={styles.pickerContainer}>
                                <Factory size={16} color="#000" />
                                <Text style={styles.pickerText}>{stages.find(s => s.code === filter.stage)?.name}</Text>
                            </View>
                        </View>
                        <View style={styles.filterItem}>
                            <Text style={styles.label}>Mã hàng</Text>
                            <TextInput
                                style={styles.input}
                                value={filter.product}
                                onChangeText={text => setFilter({ ...filter, product: text.toUpperCase() })}
                                placeholder="Nhập mã hàng..."
                            />
                        </View>
                    </View>
                    <View style={styles.filterRow}>
                        <View style={styles.filterItem}>
                            <Text style={styles.label}>Ngày chạy</Text>
                            <TextInput
                                style={styles.input}
                                value={filter.date}
                                onChangeText={text => setFilter({ ...filter, date: text })}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>
                        <View style={styles.filterItem}>
                            <Text style={styles.label}> </Text>
                            <View style={styles.refreshButton} onStartShouldSetResponder={() => setRefresh(p => p + 1)}>
                                <RefreshCw size={16} color="#fff" />
                                <Text style={styles.refreshButtonText}>Tải lại</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderText}>Bộ phận / Chuyền</Text>
                        {slots.map(s => (
                            <Text key={s.SlotCode} style={styles.tableHeaderText}>{s.SlotName}</Text>
                        ))}
                    </View>
                    {currentLines.map((line, index) => (
                        <View key={line} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
                            <Text style={styles.tableCellText}>{line.replace('LINE_0', 'Chuyền ').replace('TO_', 'Tổ ')}</Text>
                            {slots.map(s => (
                                <View key={s.SlotCode} style={styles.tableCell}>
                                    <TextInput
                                        style={styles.tableInput}
                                        placeholder="0"
                                        value={gridData[`${line}-${s.SlotCode}`] || ''}
                                        onChangeText={text => handlePlanChange(line, s.SlotCode, text)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    filterSection: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    filterRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    filterItem: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 8,
    },
    pickerText: {
        fontSize: 14,
        color: '#000',
    },
    input: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 8,
        fontSize: 14,
        color: '#000',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        backgroundColor: '#000',
        borderRadius: 8,
    },
    refreshButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    tableContainer: {
        padding: 16,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#000',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    tableHeaderText: {
        flex: 1,
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableRowEven: {
        backgroundColor: '#f9f9f9',
    },
    tableRowOdd: {
        backgroundColor: '#fff',
    },
    tableCell: {
        flex: 1,
        paddingHorizontal: 4,
    },
    tableCellText: {
        flex: 1,
        fontWeight: '600',
        fontSize: 12,
        color: '#000',
    },
    tableInput: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 4,
        textAlign: 'center',
        fontSize: 14,
        color: '#000',
    },
});
