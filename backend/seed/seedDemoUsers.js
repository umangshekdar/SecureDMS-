import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import env from '../src/config/env.js';
import User from '../src/models/User.js';

export const seedDemoUsers = async () => {
  try {
    console.log('[Seed Demo Users] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed Demo Users] Connected to database successfully.');

    // 1. Generate standard bcrypt hash with 10 salt rounds
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Demo@2026', salt);

    // 2. Define exact demo user records
    const demoUsers = [
      {
        name: 'System Administrator',
        email: 'admin@securedms.demo',
        passwordHash: demoPasswordHash,
        role: 'admin',
        department: 'Information Security & Compliance',
        status: 'active',
        lastLogin: new Date(Date.now() - 3600000 * 2),
      },
      {
        name: 'Arjun Mehta',
        email: 'officer@securedms.demo',
        passwordHash: demoPasswordHash,
        role: 'investigator',
        department: 'Cyber Financial Crimes Wing',
        status: 'active',
        lastLogin: new Date(Date.now() - 3600000 * 5),
      },
      {
        name: 'Riya Sharma',
        email: 'forensic@securedms.demo',
        passwordHash: demoPasswordHash,
        role: 'forensic',
        department: 'Digital Forensics & Evidence Lab',
        status: 'active',
        lastLogin: new Date(Date.now() - 3600000 * 8),
      },
      {
        name: 'Kabir Verma',
        email: 'legal@securedms.demo',
        passwordHash: demoPasswordHash,
        role: 'legal',
        department: 'Directorate of Public Prosecution',
        status: 'active',
        lastLogin: new Date(Date.now() - 3600000 * 12),
      },
    ];

    let createdCount = 0;
    let existingCount = 0;

    // 3. Upsert each user safely without modifying existing records
    for (const user of demoUsers) {
      const result = await User.updateOne(
        { email: user.email },
        { $setOnInsert: user },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        createdCount++;
        console.log(`[Seed Demo Users] Created demo user: ${user.email} (${user.role})`);
      } else {
        existingCount++;
        console.log(`[Seed Demo Users] Demo user already exists, left unchanged: ${user.email} (${user.role})`);
      }
    }

    console.log('\n======================================================');
    console.log('✅ DEMO USERS SEEDING COMPLETED');
    console.log('======================================================');
    console.log(`Total users processed: ${demoUsers.length}`);
    console.log(`Created: ${createdCount}`);
    console.log(`Already existing (unchanged): ${existingCount}`);
    console.log('======================================================\n');

    await mongoose.disconnect();
    console.log('[Seed Demo Users] Database disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Demo Users Error] Failed to seed demo users:', error);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // Ignore disconnect errors during failure cleanup
    }
    process.exit(1);
  }
};

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seedDemoUsers.js')) {
  seedDemoUsers();
}

export default seedDemoUsers;
