const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');

  // Tạo Stages
  await prisma.stage.createMany({
    data: [
      { StageCode: 'CAT', StageName: 'Cắt' },
      { StageCode: 'MAY', StageName: 'May' },
      { StageCode: 'HOAN_THIEN', StageName: 'Hoàn thiện' }
    ],
    skipDuplicates: true
  });
  console.log('✅ Đã tạo Stages');

  // Tạo Lines
  await prisma.line.createMany({
    data: [
      { LineCode: 'TO_CAT', StageCode: 'CAT', LineName: 'Tổ Cắt' },
      { LineCode: 'LINE_01', StageCode: 'MAY', LineName: 'Chuyền 01' },
      { LineCode: 'LINE_02', StageCode: 'MAY', LineName: 'Chuyền 02' },
      { LineCode: 'LINE_03', StageCode: 'MAY', LineName: 'Chuyền 03' },
      { LineCode: 'TO_HT', StageCode: 'HOAN_THIEN', LineName: 'Tổ Hoàn thiện' }
    ],
    skipDuplicates: true
  });
  console.log('✅ Đã tạo Lines');

  // Tạo TimeSlots
  await prisma.timeSlot.createMany({
    data: [
      { SlotCode: 'S1', SlotName: 'Ca 1 (7:00-11:00)' },
      { SlotCode: 'S2', SlotName: 'Ca 2 (13:00-17:00)' },
      { SlotCode: 'S3', SlotName: 'Ca 3 (18:00-21:00)' }
    ],
    skipDuplicates: true
  });
  console.log('✅ Đã tạo TimeSlots');

  // Tạo LineTimeSlots
  await prisma.lineTimeSlot.createMany({
    data: [
      { LineCode: 'TO_CAT', SlotCode: 'S1', SortOrder: 1 },
      { LineCode: 'TO_CAT', SlotCode: 'S2', SortOrder: 2 },
      { LineCode: 'LINE_01', SlotCode: 'S1', SortOrder: 1 },
      { LineCode: 'LINE_01', SlotCode: 'S2', SortOrder: 2 },
      { LineCode: 'LINE_01', SlotCode: 'S3', SortOrder: 3 },
      { LineCode: 'LINE_02', SlotCode: 'S1', SortOrder: 1 },
      { LineCode: 'LINE_02', SlotCode: 'S2', SortOrder: 2 },
      { LineCode: 'LINE_03', SlotCode: 'S1', SortOrder: 1 },
      { LineCode: 'TO_HT', SlotCode: 'S1', SortOrder: 1 },
      { LineCode: 'TO_HT', SlotCode: 'S2', SortOrder: 2 }
    ],
    skipDuplicates: true
  });
  console.log('✅ Đã tạo LineTimeSlots');

  // Tạo Product mẫu
  await prisma.product.createMany({
    data: [
      { 
        ProductCode: 'SP001', 
        TotalQuantity: 1000,
        CustomerPickupDate: new Date('2026-07-01')
      },
      { 
        ProductCode: 'SP002', 
        TotalQuantity: 500,
        CustomerPickupDate: new Date('2026-06-30')
      }
    ],
    skipDuplicates: true
  });
  console.log('✅ Đã tạo Products');

  console.log('🎉 Seed dữ liệu hoàn tất!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
