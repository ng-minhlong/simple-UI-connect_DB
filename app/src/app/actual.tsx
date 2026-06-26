import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import { Factory, Users, Clock, TrendingUp, TrendingDown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const stages = [{ code: 'CAT', name: 'Cắt' }, { code: 'MAY', name: 'May' }, { code: 'HOAN_THIEN', name: 'Hoàn thiện' }];
const linesMap = { CAT: ['TO_CAT'], MAY: ['LINE_01', 'LINE_02', 'LINE_03'], HOAN_THIEN: ['TO_HT'] };

export default function ActualScreen() {
    const [filter, setFilter] = useState({ date: '2026-06-26', product: 'SP001', stage: 'MAY', line: 'LINE_01' });
    const [slots, setSlots] = useState([]);
    const [rows, setRows] = useState([]);
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
            })
            .catch(err => console.error('Error fetching production:', err));
    }, [filter, slots, refresh]);

    const handleActualChange = (slotCode, value) => {
        const intValue = parseInt(value) || 0;
        setRows(prev => prev.map(r => r.slotCode === slotCode ? { ...r, actualQty: intValue } : r));

        axios.post('http://localhost:5000/api/production/save', {
            date: filter.date, productCode: filter.product, stageCode: filter.stage,
            lineCode: filter.line, slotCode: slotCode, planQty: null, actualQty: intValue, user: 'TO_TRUONG'
        }).then(() => setRefresh(p => p + 1))
        .catch(err => console.error('Error saving:', err));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>Nhập Sản Lượng Thực Tế</Text>
                    <Text style={styles.subtitle}>Dành cho Chuyền/Tổ nhập sản lượng</Text>
                </View>

                <View style={styles.filterSection}>
                    <View style={styles.filterRow}>
                        <View style={styles.filterItem}>
                            <Text style={styles.label}>Bộ phận</Text>
                            <View style={styles.pickerContainer}>
                                <Factory size={16} color="#000" />
                                <Text style={styles.pickerText}>{stages.find(s => s.code === filter.stage)?.name}</Text>
                            </View>
                        </View>
                        <View style={styles.filterItem}>
                            <Text style={styles.label}>Chuyền/Tổ</Text>
                            <View style={styles.pickerContainer}>
                                <Users size={16} color="#000" />
                                <Text style={styles.pickerText}>{filter.line.replace('LINE_0', 'Chuyền ').replace('TO_', 'Tổ ')}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.cardsContainer}>
                    {rows.map(row => {
                        const diff = row.actualQty - row.planQty;
                        const isPositive = diff >= 0;
                        return (
                            <View key={row.slotCode} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardHeaderLeft}>
                                        <Clock size={20} color="#000" />
                                        <Text style={styles.cardTitle}>{row.slotName}</Text>
                                    </View>
                                    <View style={styles.planBadge}>
                                        <Text style={styles.planText}>Chỉ tiêu: {row.planQty}</Text>
                                    </View>
                                </View>
                                <View style={styles.cardBody}>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Sản lượng thực tế</Text>
                                        <TextInput
                                            style={styles.cardInput}
                                            placeholder="Gõ số lượng..."
                                            value={row.actualQty || ''}
                                            onChangeText={text => handleActualChange(row.slotCode, text)}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={[styles.diffBadge, isPositive ? styles.diffPositive : styles.diffNegative]}>
                                        <Text style={styles.diffLabel}>Chênh lệch</Text>
                                        <View style={styles.diffValue}>
                                            {isPositive ? <TrendingUp size={20} color="#000" /> : <TrendingDown size={20} color="#fff" />}
                                            <Text style={[styles.diffNumber, isPositive ? styles.diffNumberPositive : styles.diffNumberNegative]}>
                                                {diff >= 0 ? `+${diff}` : diff}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
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
    cardsContainer: {
        padding: 16,
        gap: 16,
    },
    card: {
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#fff',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    planBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    planText: {
        fontWeight: '600',
        color: '#000',
    },
    cardBody: {
        flexDirection: 'row',
        gap: 16,
    },
    inputContainer: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        fontWeight: '600',
    },
    cardInput: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 8,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
    },
    diffBadge: {
        minWidth: 100,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
    },
    diffPositive: {
        backgroundColor: '#fff',
    },
    diffNegative: {
        backgroundColor: '#000',
    },
    diffLabel: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '600',
    },
    diffValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    diffNumber: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    diffNumberPositive: {
        color: '#000',
    },
    diffNumberNegative: {
        color: '#fff',
    },
});
