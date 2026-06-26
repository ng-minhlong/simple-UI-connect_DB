-- CreateTable
CREATE TABLE "Product" (
    "ProductCode" VARCHAR(50) NOT NULL,
    "TotalQuantity" INTEGER NOT NULL,
    "CustomerPickupDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("ProductCode")
);

-- CreateTable
CREATE TABLE "Stage" (
    "StageCode" VARCHAR(50) NOT NULL,
    "StageName" VARCHAR(100) NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("StageCode")
);

-- CreateTable
CREATE TABLE "Line" (
    "LineCode" VARCHAR(50) NOT NULL,
    "StageCode" VARCHAR(50) NOT NULL,
    "LineName" VARCHAR(100) NOT NULL,

    CONSTRAINT "Line_pkey" PRIMARY KEY ("LineCode")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "SlotCode" VARCHAR(50) NOT NULL,
    "SlotName" VARCHAR(50) NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("SlotCode")
);

-- CreateTable
CREATE TABLE "LineTimeSlot" (
    "LineCode" VARCHAR(50) NOT NULL,
    "SlotCode" VARCHAR(50) NOT NULL,
    "SortOrder" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "LineTimeSlot_pkey" PRIMARY KEY ("LineCode","SlotCode")
);

-- CreateTable
CREATE TABLE "ProductionData" (
    "Id" SERIAL NOT NULL,
    "ProductionDate" TIMESTAMP(3) NOT NULL,
    "ProductCode" VARCHAR(50) NOT NULL,
    "StageCode" VARCHAR(50) NOT NULL,
    "LineCode" VARCHAR(50) NOT NULL,
    "SlotCode" VARCHAR(50) NOT NULL,
    "PlanQuantity" INTEGER NOT NULL DEFAULT 0,
    "Target2Hour" INTEGER NOT NULL DEFAULT 0,
    "ActualQuantity" INTEGER NOT NULL DEFAULT 0,
    "UpdatedBy" VARCHAR(50),
    "UpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductionData_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductionData_ProductionDate_ProductCode_StageCode_LineCod_key" ON "ProductionData"("ProductionDate", "ProductCode", "StageCode", "LineCode", "SlotCode");

-- AddForeignKey
ALTER TABLE "Line" ADD CONSTRAINT "Line_StageCode_fkey" FOREIGN KEY ("StageCode") REFERENCES "Stage"("StageCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineTimeSlot" ADD CONSTRAINT "LineTimeSlot_LineCode_fkey" FOREIGN KEY ("LineCode") REFERENCES "Line"("LineCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineTimeSlot" ADD CONSTRAINT "LineTimeSlot_SlotCode_fkey" FOREIGN KEY ("SlotCode") REFERENCES "TimeSlot"("SlotCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionData" ADD CONSTRAINT "ProductionData_ProductCode_fkey" FOREIGN KEY ("ProductCode") REFERENCES "Product"("ProductCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionData" ADD CONSTRAINT "ProductionData_StageCode_fkey" FOREIGN KEY ("StageCode") REFERENCES "Stage"("StageCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionData" ADD CONSTRAINT "ProductionData_LineCode_fkey" FOREIGN KEY ("LineCode") REFERENCES "Line"("LineCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionData" ADD CONSTRAINT "ProductionData_SlotCode_fkey" FOREIGN KEY ("SlotCode") REFERENCES "TimeSlot"("SlotCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionData" ADD CONSTRAINT "ProductionData_LineCode_SlotCode_fkey" FOREIGN KEY ("LineCode", "SlotCode") REFERENCES "LineTimeSlot"("LineCode", "SlotCode") ON DELETE RESTRICT ON UPDATE CASCADE;
