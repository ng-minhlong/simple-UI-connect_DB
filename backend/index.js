require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Get time slots by stage
app.get('/api/timeslots/:stageCode', async (req, res) => {
  try {
    const { stageCode } = req.params;
    
    const lineTimeSlots = await prisma.lineTimeSlot.findMany({
      where: {
        line: {
          StageCode: stageCode
        }
      },
      include: {
        timeSlot: true,
        line: true
      },
      orderBy: {
        SortOrder: 'asc'
      }
    });

    // Get unique time slots for this stage
    const uniqueSlots = [];
    const seenCodes = new Set();
    
    lineTimeSlots.forEach(lts => {
      if (!seenCodes.has(lts.SlotCode)) {
        seenCodes.add(lts.SlotCode);
        uniqueSlots.push({
          SlotCode: lts.SlotCode,
          SlotName: lts.timeSlot.SlotName
        });
      }
    });

    res.json(uniqueSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get production data
app.get('/api/production', async (req, res) => {
  try {
    const { date, productCode, stageCode } = req.query;
    
    const productionDate = new Date(date);
    
    const data = await prisma.productionData.findMany({
      where: {
        ProductionDate: productionDate,
        ProductCode: productCode,
        StageCode: stageCode
      },
      include: {
        product: true,
        stage: true,
        lineTimeSlot: {
          include: {
            line: true,
            timeSlot: true
          }
        }
      }
    });

    const formattedData = data.map(item => ({
      Id: item.Id,
      ProductionDate: item.ProductionDate,
      ProductCode: item.ProductCode,
      StageCode: item.StageCode,
      LineCode: item.LineCode,
      SlotCode: item.SlotCode,
      PlanQuantity: item.PlanQuantity,
      ActualQuantity: item.ActualQuantity,
      UpdatedBy: item.UpdatedBy,
      UpdatedAt: item.UpdatedAt
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching production data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save production data
app.post('/api/production/save', async (req, res) => {
  try {
    const { date, productCode, stageCode, lineCode, slotCode, planQty, actualQty, user } = req.body;
    
    const productionDate = new Date(date);
    
    // Check if record exists
    const existing = await prisma.productionData.findUnique({
      where: {
        ProductionDate_ProductCode_StageCode_LineCode_SlotCode: {
          ProductionDate: productionDate,
          ProductCode: productCode,
          StageCode: stageCode,
          LineCode: lineCode,
          SlotCode: slotCode
        }
      }
    });

    let result;
    
    if (existing) {
      // Update existing record
      const updateData = {
        UpdatedBy: user,
        UpdatedAt: new Date()
      };
      
      if (planQty !== null && planQty !== undefined) {
        updateData.PlanQuantity = parseInt(planQty);
      }
      if (actualQty !== null && actualQty !== undefined) {
        updateData.ActualQuantity = parseInt(actualQty);
      }
      
      result = await prisma.productionData.update({
        where: {
          Id: existing.Id
        },
        data: updateData
      });
    } else {
      // Create new record
      result = await prisma.productionData.create({
        data: {
          ProductionDate: productionDate,
          ProductCode: productCode,
          StageCode: stageCode,
          LineCode: lineCode,
          SlotCode: slotCode,
          PlanQuantity: planQty !== null ? parseInt(planQty) : 0,
          ActualQuantity: actualQty !== null ? parseInt(actualQty) : 0,
          UpdatedBy: user,
          UpdatedAt: new Date()
        }
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving production data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product info
app.get('/api/product/:productCode', async (req, res) => {
  try {
    const { productCode } = req.params;
    
    const product = await prisma.product.findUnique({
      where: {
        ProductCode: productCode
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all stages
app.get('/api/stages', async (req, res) => {
  try {
    const stages = await prisma.stage.findMany({
      orderBy: {
        StageCode: 'asc'
      }
    });

    res.json(stages);
  } catch (error) {
    console.error('Error fetching stages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lines by stage
app.get('/api/lines/:stageCode', async (req, res) => {
  try {
    const { stageCode } = req.params;
    
    const lines = await prisma.line.findMany({
      where: {
        StageCode: stageCode
      },
      orderBy: {
        LineCode: 'asc'
      }
    });

    res.json(lines);
  } catch (error) {
    console.error('Error fetching lines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
