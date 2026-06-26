# 🏭 Hệ Thống Quản Lý Sản Xuất

Hệ thống quản lý lập kế hoạch và theo dõi sản lượng thực tế sản xuất cho dây chuyền may mặc.

## 📋 Mục Lục

- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cài đặt môi trường](#cài-đặt-môi-trường)
- [Cấu hình Database](#cấu-hình-database)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Quản lý Database](#quản-lý-database)
- [Cấu trúc API](#cấu-trúc-api)

## 🏗️ Kiến trúc hệ thống

```
Connect_Database/
├── backend/                 # Backend API (Node.js + Express + Prisma)
│   ├── db/
│   │   └── prisma/
│   │       └── schema.prisma    # Schema database
│   ├── .env                   # Cấu hình môi trường
│   ├── index.js               # Server Express
│   └── package.json           # Dependencies backend
├── web/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── PlanPage.jsx        # Trang lập kế hoạch
│   │   │   ├── thuchien.jsx        # Trang nhập thực tế
│   │   │   └── PickupHelperWidget.jsx  # Widget hiển thị tiến độ
│   │   ├── App.jsx              # Main App với routing
│   │   └── main.tsx             # Entry point
│   └── package.json           # Dependencies frontend
└── README.md                # Tài liệu dự án
```

### Các thành phần chính

- **Backend**: Express.js server với Prisma ORM để kết nối PostgreSQL
- **Frontend**: React với Vite, sử dụng Axios để gọi API
- **Database**: PostgreSQL với schema quản lý sản xuất

## 🛠️ Cài đặt môi trường

### Yêu cầu

- Node.js (v18 trở lên)
- PostgreSQL (v14 trở lên)
- npm hoặc pnpm

### Cài đặt Backend

```bash
cd backend
npm install
```

### Cài đặt Frontend

```bash
cd web
npm install
# hoặc
pnpm install
```

## 🗄️ Cấu hình Database

### 1. Tạo Database PostgreSQL

```bash
# Đăng nhập vào PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE production_db;

# Thoát
\q
```

### 2. Cấu hình kết nối trong `backend/.env`

Mở file `backend/.env` và cập nhật thông tin kết nối:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/production_db?schema=public"

# Server Configuration
PORT=5000

# Environment
NODE_ENV=development
```

**Thay thế:**
- `username`: Tên user PostgreSQL của bạn
- `password`: Mật khẩu PostgreSQL của bạn
- `localhost`: Địa chỉ server PostgreSQL (nếu khác localhost)
- `5432`: Port PostgreSQL (nếu khác port mặc định)

### 3. Khởi tạo Prisma Client

```bash
cd backend
npx prisma generate
```

## 🚀 Chạy ứng dụng

### 1. Migrate Database (Lần đầu tiên)

```bash
cd backend
npx prisma migrate dev --name init
```

Lệnh này sẽ:
- Tạo các bảng trong database theo schema
- Tạo file migration trong `backend/db/prisma/migrations`

### 2. Seed dữ liệu mẫu (Tùy chọn)

Tạo file `backend/db/prisma/seed.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Tạo Stages
  await prisma.stage.createMany({
    data: [
      { StageCode: 'CAT', StageName: 'Cắt' },
      { StageCode: 'MAY', StageName: 'May' },
      { StageCode: 'HOAN_THIEN', StageName: 'Hoàn thiện' }
    ],
    skipDuplicates: true
  });

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

  // Tạo TimeSlots
  await prisma.timeSlot.createMany({
    data: [
      { SlotCode: 'S1', SlotName: 'Ca 1 (7:00-11:00)' },
      { SlotCode: 'S2', SlotName: 'Ca 2 (13:00-17:00)' },
      { SlotCode: 'S3', SlotName: 'Ca 3 (18:00-21:00)' }
    ],
    skipDuplicates: true
  });

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

  // Tạo Product mẫu
  await prisma.product.createMany({
    data: [
      { 
        ProductCode: 'SP001', 
        TotalQuantity: 1000,
        CustomerPickupDate: new Date('2026-07-01')
      }
    ],
    skipDuplicates: true
  });

  console.log('Seed data completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Chạy seed:

```bash
node db/prisma/seed.js
```

### 3. Khởi động Backend

```bash
cd backend
npm run dev
# hoặc
npm start
```

Backend sẽ chạy tại `http://localhost:5000`

### 4. Khởi động Frontend

Mở terminal mới:

```bash
cd web
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

## 📊 Quản lý Database

### Xem Database với Prisma Studio

```bash
cd backend
npx prisma studio
```

Prisma Studio sẽ mở tại `http://localhost:5555` để bạn có thể xem và chỉnh sửa dữ liệu trực tiếp.

### Tạo Migration mới

Khi bạn thay đổi schema trong `backend/db/prisma/schema.prisma`:

```bash
cd backend
npx prisma migrate dev --name ten_migration
```

### Reset Database (Cẩn thận - Xóa toàn bộ dữ liệu)

```bash
cd backend
npx prisma migrate reset
```

### Push schema trực tiếp (Không tạo migration file)

```bash
cd backend
npx prisma db push
```

Lưu ý: Chỉ dùng trong development, không nên dùng trong production.

### Sửa schema Database

1. Mở file `backend/db/prisma/schema.prisma`
2. Thay đổi schema theo nhu cầu
3. Chạy migration:

```bash
npx prisma migrate dev --name mo_ta_thay_doi
```

Ví dụ thêm field mới:

```prisma
model Product {
    ProductCode         String   @id @db.VarChar(50)
    TotalQuantity       Int
    CustomerPickupDate  DateTime
    ProductName         String?  @db.VarChar(200)  // Field mới thêm
    Description         String?  @db.Text          // Field mới thêm

    ProductionData      ProductionData[]
}
```

### Xóa dữ liệu cũ

```bash
# Xóa toàn bộ dữ liệu trong bảng
npx prisma migrate reset

# Hoặc dùng Prisma Studio để xóa thủ công
npx prisma studio
```

## 🔌 Cấu trúc API

### Endpoints

#### Health Check
- `GET /api/health` - Kiểm tra trạng thái server

#### Time Slots
- `GET /api/timeslots/:stageCode` - Lấy danh sách khung giờ theo công đoạn

#### Production Data
- `GET /api/production?date={date}&productCode={code}&stageCode={code}` - Lấy dữ liệu sản xuất
- `POST /api/production/save` - Lưu/cập nhật dữ liệu sản xuất

#### Product
- `GET /api/product/:productCode` - Lấy thông tin sản phẩm

#### Stages & Lines
- `GET /api/stages` - Lấy danh sách công đoạn
- `GET /api/lines/:stageCode` - Lấy danh sách chuyền theo công đoạn

### Ví dụ gọi API

```javascript
// Lấy khung giờ
axios.get('http://localhost:5000/api/timeslots/MAY')

// Lấy dữ liệu sản xuất
axios.get('http://localhost:5000/api/production?date=2026-06-26&productCode=SP001&stageCode=MAY')

// Lưu dữ liệu
axios.post('http://localhost:5000/api/production/save', {
  date: '2026-06-26',
  productCode: 'SP001',
  stageCode: 'MAY',
  lineCode: 'LINE_01',
  slotCode: 'S1',
  planQty: 100,
  actualQty: null,
  user: 'P_KE_HOACH'
})
```

## 🎨 Tính năng Frontend

### Trang Lập Kế Hoạch (`/`)
- Chọn công đoạn sản xuất (Cắt, May, Hoàn thiện)
- Nhập mã hàng và ngày chạy kế hoạch
- Giao chỉ tiêu sản xuất cho các chuyền/tổ theo khung giờ
- Xem tiến độ tổng và hạn khách lấy hàng

### Trang Nhập Thực Tế (`/actual`)
- Chọn bộ phận và chuyền/tổ làm việc
- Nhập sản lượng thực tế sản xuất được
- Xem so sánh với kế hoạch
- Hiển thị chênh lệch (dương/âm)

### Widget Pickup Helper
- Hiển thị thông tin sản phẩm
- Cảnh báo hạn khách lấy hàng
- Hiển thị tiến độ tổng theo % hoàn thành

## 📝 Lưu ý quan trọng

1. **Database URL**: Đảm bảo cấu hình đúng `DATABASE_URL` trong file `.env`
2. **Port**: Backend mặc định port 5000, Frontend mặc định port 5173
3. **Migration**: Luôn tạo migration khi thay đổi schema trong production
4. **Seed**: Chạy seed data để có dữ liệu mẫu test
5. **CORS**: Backend đã cấu hình CORS để cho phép frontend gọi API

## 🐛 Xử lý lỗi thường gặp

### Lỗi kết nối Database
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra `DATABASE_URL` trong `.env`
- Đảm bảo database đã được tạo

### Lỗi Prisma Client
- Chạy `npx prisma generate` sau khi thay đổi schema
- Chạy `npx prisma migrate dev` để đồng bộ database

### Lỗi Frontend không gọi được API
- Kiểm tra backend đang chạy
- Kiểm tra CORS configuration
- Xác nhận port backend (5000)

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs của backend và frontend
2. Kết nối database với Prisma Studio
3. Documentation của Prisma: https://www.prisma.io/docs