import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/itam';

export async function seedDemoUsers() {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    const db = conn.connection.db;
    const usersCol = db.collection('users');
    const assetsCol = db.collection('assets');
    const assignmentsCol = db.collection('assignments');
    const maintenanceCol = db.collection('maintenances');

    const password = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const testUsers = [
      {
        name: 'Primary Administrator',
        email: 'admin@enterprise.corp',
        role: 'ADMIN',
      },
      {
        name: 'Sarah Connor (Asset Manager)',
        email: 'asset.manager@enterprise.corp',
        role: 'ASSET_MANAGER',
      },
      {
        name: 'Alex Rivera (Technician)',
        email: 'technician@enterprise.corp',
        role: 'TECHNICIAN',
      },
      {
        name: 'David Kim (Employee)',
        email: 'employee@enterprise.corp',
        role: 'EMPLOYEE',
      },
    ];

    const userDocs = {};
    for (const u of testUsers) {
      await usersCol.updateOne(
        { email: u.email },
        {
          $set: {
            name: u.name,
            email: u.email,
            passwordHash,
            role: u.role,
            isActive: true,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
      const doc = await usersCol.findOne({ email: u.email });
      userDocs[u.role] = doc;
      console.log(`[Seed] Guaranteed ${u.role}: ${u.email}`);
    }

    // Ensure Employee has an assigned workstation
    const empAssetTag = 'EMP-LAPTOP-2026';
    await assetsCol.updateOne(
      { assetTag: empAssetTag },
      {
        $set: {
          name: 'Apple MacBook Pro 16" (M3 Max / 64GB / 2TB)',
          category: 'HARDWARE',
          brand: 'Apple',
          model: 'MacBook Pro 16 M3 Max',
          serialNumber: 'SN-APL-M3M-9921',
          purchasePrice: 389900,
          purchaseDate: new Date('2024-03-15'),
          usefulLifeYears: 4,
          salvageValue: 50000,
          status: 'ASSIGNED',
          currentAssignee: userDocs.EMPLOYEE._id,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          assetTag: empAssetTag,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    const empAsset = await assetsCol.findOne({ assetTag: empAssetTag });

    await assignmentsCol.updateOne(
      { asset: empAsset._id, user: userDocs.EMPLOYEE._id },
      {
        $set: {
          asset: empAsset._id,
          user: userDocs.EMPLOYEE._id,
          assignedDate: new Date('2024-03-20'),
          status: 'ACTIVE',
          conditionOnAssignment: 'EXCELLENT',
          notes: 'Standard high-performance engineering workstation allocation',
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Ensure Technician has a bench ticket
    const techAssetTag = 'SRV-PRECISION-7780';
    await assetsCol.updateOne(
      { assetTag: techAssetTag },
      {
        $set: {
          name: 'Dell Precision 7780 Workstation (RTX 5000 / 128GB)',
          category: 'HARDWARE',
          brand: 'Dell',
          model: 'Precision 7780',
          serialNumber: 'SN-DLL-P7780-3341',
          purchasePrice: 420000,
          purchaseDate: new Date('2023-11-10'),
          usefulLifeYears: 5,
          salvageValue: 40000,
          status: 'MAINTENANCE',
          updatedAt: new Date(),
        },
        $setOnInsert: {
          assetTag: techAssetTag,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    const techAsset = await assetsCol.findOne({ assetTag: techAssetTag });

    await maintenanceCol.updateOne(
      { asset: techAsset._id },
      {
        $set: {
          asset: techAsset._id,
          assignedTechnician: userDocs.TECHNICIAN._id,
          issueDescription: 'Cooling thermal paste reapplication and battery cycle diagnostics',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          reportedDate: new Date(),
          startedDate: new Date(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log('[Seed] High-vitality demo context provisioned successfully');
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    return false;
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed-demo-users.js')) {
  seedDemoUsers().then(() => process.exit(0));
}
