import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';

import env from '../src/config/env.js';
import User from '../src/models/User.js';
import Case from '../src/models/Case.js';
import Document from '../src/models/Document.js';
import DocumentVersion from '../src/models/DocumentVersion.js';
import AuditLog from '../src/models/AuditLog.js';

dotenv.config();

/**
 * Calculates SHA-256 hash for sample text content.
 * @param {string} text 
 * @returns {string}
 */
const computeHash = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Seed] Connected to database.');

    // Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Case.deleteMany({}),
      Document.deleteMany({}),
      DocumentVersion.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('[Seed] Existing collections cleared.');

    // 1. Create Demo Users
    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Demo@2026', salt);

    const usersData = [
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

    const users = await User.insertMany(usersData);
    const [adminUser, investigatorUser, forensicUser, legalUser] = users;
    console.log(`[Seed] Created ${users.length} demo users.`);

    // 2. Create Demo Cases
    console.log('[Seed] Creating demo cases...');
    const casesData = [
      {
        caseId: 'CASE-2026-10492',
        title: 'Operation Iron Vault - Multi-Tier Cyber Embezzlement',
        description: 'Investigation into fraudulent unauthorized SWIFT transfers bypassing secondary approval gateways in Metropolitan Banking Corp.',
        caseType: 'cybercrime',
        priority: 'critical',
        status: 'active',
        assignedUsers: [investigatorUser._id, forensicUser._id, legalUser._id],
        createdBy: investigatorUser._id,
      },
      {
        caseId: 'CASE-2026-20831',
        title: 'State vs. Apex Dynamics - Corporate Tax Evasion & Shell Syndicate',
        description: 'Comprehensive financial audit tracking 42 bogus offshore intermediary companies laundering corporate revenue.',
        caseType: 'financial',
        priority: 'high',
        status: 'under-review',
        assignedUsers: [investigatorUser._id, legalUser._id],
        createdBy: adminUser._id,
      },
      {
        caseId: 'CASE-2026-30114',
        title: 'Digital Ransomware Breach at City Municipal Infrastructure',
        description: 'Incident response and digital forensic attribution regarding ransomware payload deployed across SCADA electrical sub-stations.',
        caseType: 'forensic',
        priority: 'critical',
        status: 'open',
        assignedUsers: [forensicUser._id, investigatorUser._id],
        createdBy: forensicUser._id,
      },
    ];

    const cases = await Case.insertMany(casesData);
    const [case1, case2, case3] = cases;
    console.log(`[Seed] Created ${cases.length} demo cases.`);

    // 3. Create Demo Documents
    console.log('[Seed] Creating demo documents...');
    const documentsData = [
      // Case 1 Documents
      {
        documentId: 'DOC-2026-10001',
        caseId: case1._id,
        name: 'FIR_Cyber_SWIFT_Breach_001.pdf',
        type: 'fir',
        securityLevel: 'confidential',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/FIR_Cyber_SWIFT_Breach_001.pdf',
        cloudinaryPublicId: 'securedms/FIR_Cyber_SWIFT_Breach_001',
        mimeType: 'application/pdf',
        size: 245800,
        sha256Hash: computeHash('Sample FIR Body: First Information Report regarding SWIFT gateway compromise.'),
        version: 1,
        status: 'verified',
        uploadedBy: investigatorUser._id,
        ocrText: 'FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.) Police Station: Cyber Crime Special Cell. Complainant: Metropolitan Banking Corp. Suspect: Unknown intrusion group leveraging credentials.',
        aiSummary: 'First Information Report lodged by Metropolitan Banking Corp regarding $1.4M SWIFT diversion through credential compromise.',
        aiClassification: {
          type: 'fir',
          confidence: 0.98,
          entities: ['Metropolitan Banking Corp', 'Cyber Crime Cell', 'SWIFT Network'],
          keywords: ['fir', 'swift', 'unauthorized-access', 'cybercrime'],
        },
        metadata: { filingDate: '2026-02-14', investigatingOfficer: 'Arjun Mehta' },
      },
      {
        documentId: 'DOC-2026-10002',
        caseId: case1._id,
        name: 'Forensic_Memory_Dump_Analysis_Report.pdf',
        type: 'forensic-report',
        securityLevel: 'highly-confidential',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Forensic_Memory_Dump_Analysis_Report.pdf',
        cloudinaryPublicId: 'securedms/Forensic_Memory_Dump_Analysis_Report',
        mimeType: 'application/pdf',
        size: 4892000,
        sha256Hash: computeHash('Forensic Lab Report: Injected DLL found inside banking server winlogon process.'),
        version: 2,
        status: 'verified',
        uploadedBy: forensicUser._id,
        ocrText: 'FORENSIC ANALYSIS REPORT v2.0. Lab Ref: FL-2026-88. Volatility memory analysis revealed Cobalt Strike beacon injected into PID 4092.',
        aiSummary: 'Digital forensics report detailing memory artifact analysis, uncovering Cobalt Strike beacon payload and reverse TCP shell at 185.220.101.44.',
        aiClassification: {
          type: 'forensic-report',
          confidence: 0.96,
          entities: ['Riya Sharma', 'Forensic Evidence Lab', 'IP 185.220.101.44'],
          keywords: ['memory-dump', 'cobalt-strike', 'forensics', 'chain-of-custody'],
        },
        metadata: { labId: 'FL-2026-88', hashAlgorithm: 'SHA-256' },
      },
      {
        documentId: 'DOC-2026-10003',
        caseId: case1._id,
        name: 'Witness_Deposition_Database_Admin.docx',
        type: 'witness-statement',
        securityLevel: 'confidential',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Witness_Deposition_Database_Admin.docx',
        cloudinaryPublicId: 'securedms/Witness_Deposition_Database_Admin',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 92400,
        sha256Hash: computeHash('Witness Deposition: Lead DBA testifies regarding unauthorized SSH key addition in PAM.'),
        version: 1,
        status: 'verified',
        uploadedBy: investigatorUser._id,
        ocrText: 'STATEMENT OF WITNESS UNDER SECTION 161 CrPC. Deponent: Rajiv Nambiar, Senior DBA. Witness affirms observing anomalous SSH login at 02:41 AM UTC.',
        aiSummary: 'Deposition statement of senior DBA describing unexpected privileges escalation and access logs alteration on core banking server.',
        aiClassification: {
          type: 'witness-statement',
          confidence: 0.92,
          entities: ['Rajiv Nambiar', 'PAM Gateway', 'Metropolitan Banking Corp'],
          keywords: ['witness-statement', 'deposition', 'ssh-keys', 'pam'],
        },
        metadata: { swornBefore: 'Arjun Mehta', notaryStatus: 'Notarized' },
      },
      {
        documentId: 'DOC-2026-10004',
        caseId: case1._id,
        name: 'Draft_Indictment_ChargeSheet_v1.pdf',
        type: 'charge-sheet',
        securityLevel: 'highly-confidential',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Draft_Indictment_ChargeSheet_v1.pdf',
        cloudinaryPublicId: 'securedms/Draft_Indictment_ChargeSheet_v1',
        mimeType: 'application/pdf',
        size: 382000,
        sha256Hash: computeHash('Final Charge Sheet draft filed under IT Act Sec 66 and IPC 420/409.'),
        version: 1,
        status: 'review-required',
        uploadedBy: legalUser._id,
        ocrText: 'FINAL POLICE REPORT / CHARGE SHEET (Section 173 Cr.P.C.). Accused charged under Information Technology Act 2000 Section 66, 66C and Indian Penal Code Section 420.',
        aiSummary: 'Prosecution charge sheet outlining criminal conspiracy, unauthorized computer access, and digital embezzlement counts.',
        aiClassification: {
          type: 'charge-sheet',
          confidence: 0.95,
          entities: ['Chief Judicial Magistrate', 'Directorate of Public Prosecution', 'Kabir Verma'],
          keywords: ['charge-sheet', 'it-act', 'criminal-conspiracy', 'legal'],
        },
        metadata: { courtForum: 'Sessions Court Room 4' },
      },

      // Case 2 Documents
      {
        documentId: 'DOC-2026-20001',
        caseId: case2._id,
        name: 'Forensic_Audit_Ledger_Shell_Accounts.xlsx',
        type: 'evidence-record',
        securityLevel: 'confidential',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Forensic_Audit_Ledger_Shell_Accounts.xlsx',
        cloudinaryPublicId: 'securedms/Forensic_Audit_Ledger_Shell_Accounts',
        mimeType: 'application/octet-stream',
        size: 1540000,
        sha256Hash: computeHash('Excel forensic ledger tracking 42 fake company bank accounts and wire trails.'),
        version: 2,
        status: 'verified',
        uploadedBy: investigatorUser._id,
        ocrText: 'FORENSIC AUDIT SPREADSHEET EXHIBIT EX-2026-44B. Ledger entries tracking INR 45,00,000 across Apex Dynamics subsidiaries in Mauritius and Singapore.',
        aiSummary: 'Financial trail exhibit cross-referencing multi-jurisdictional shell entity transfers totaling INR 45 Crores.',
        aiClassification: {
          type: 'evidence-record',
          confidence: 0.94,
          entities: ['Apex Dynamics', 'State Enforcement Directorate', 'Mauritius Financial Unit'],
          keywords: ['money-laundering', 'shell-companies', 'evidence', 'wire-transfer'],
        },
        metadata: { exhibitCode: 'EX-44B', seizureDate: '2026-01-20' },
      },
      {
        documentId: 'DOC-2026-20002',
        caseId: case2._id,
        name: 'Statutory_Summons_Notice_to_Directors.pdf',
        type: 'legal-notice',
        securityLevel: 'internal',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Statutory_Summons_Notice_to_Directors.pdf',
        cloudinaryPublicId: 'securedms/Statutory_Summons_Notice_to_Directors',
        mimeType: 'application/pdf',
        size: 198000,
        sha256Hash: computeHash('Statutory Legal Notice requiring director attendance for financial inspection.'),
        version: 1,
        status: 'verified',
        uploadedBy: legalUser._id,
        ocrText: 'FORMAL STATUTORY NOTICE UNDER SECTION 131. To: Board of Directors, Apex Dynamics Ltd. You are hereby ordered to appear with audited financial books.',
        aiSummary: 'Statutory summon requiring managing directors to produce books of account and beneficial ownership disclosures.',
        aiClassification: {
          type: 'legal-notice',
          confidence: 0.97,
          entities: ['Apex Dynamics Ltd', 'Directorate of Enforcement', 'Kabir Verma'],
          keywords: ['legal-notice', 'statutory-demand', 'summons', 'compliance'],
        },
        metadata: { noticeTrackingId: 'SUM-2026-0091' },
      },
      {
        documentId: 'DOC-2026-20003',
        caseId: case2._id,
        name: 'High_Court_Writ_Petition_Interim_Stay.pdf',
        type: 'court-filing',
        securityLevel: 'public',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/High_Court_Writ_Petition_Interim_Stay.pdf',
        cloudinaryPublicId: 'securedms/High_Court_Writ_Petition_Interim_Stay',
        mimeType: 'application/pdf',
        size: 610000,
        sha256Hash: computeHash('High Court Writ Petition defense submission claiming lack of jurisdiction.'),
        version: 1,
        status: 'verified',
        uploadedBy: legalUser._id,
        ocrText: 'IN THE HIGH COURT OF JUDICATURE. Writ Petition No. 1109 of 2026. In re: Apex Dynamics Ltd versus Union of India and Anr. Petition for interim relief.',
        aiSummary: 'High Court filing seeking relief against provisional bank account attachment orders pending ongoing inquiry.',
        aiClassification: {
          type: 'court-filing',
          confidence: 0.93,
          entities: ['High Court Bench', 'Apex Dynamics Ltd', 'Union of India'],
          keywords: ['court-filing', 'writ-petition', 'interim-stay', 'legal'],
        },
        metadata: { bench: 'Division Commercial Bench' },
      },

      // Case 3 Documents
      {
        documentId: 'DOC-2026-30001',
        caseId: case3._id,
        name: 'SCADA_Industrial_Gateway_Malware_Dump.bin.pdf',
        type: 'forensic-report',
        securityLevel: 'highly-confidential',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/SCADA_Industrial_Gateway_Malware_Dump.pdf',
        cloudinaryPublicId: 'securedms/SCADA_Industrial_Gateway_Malware_Dump',
        mimeType: 'application/pdf',
        size: 7820000,
        sha256Hash: computeHash('Forensic Disassembly of Stuxnet-derivative ICS ransomware payload.'),
        version: 1,
        status: 'verified',
        uploadedBy: forensicUser._id,
        ocrText: 'ICS/SCADA FORENSIC DISASSEMBLY REPORT. Binary decompilation showed embedded Modbus TCP instructions targeting PLC firmware rewrite at port 502.',
        aiSummary: 'Forensic static disassembly of ransomware binary targeting industrial programmable logic controllers via Modbus protocol.',
        aiClassification: {
          type: 'forensic-report',
          confidence: 0.99,
          entities: ['City Municipal Substation 4', 'Riya Sharma', 'Modbus Controller'],
          keywords: ['scada', 'malware', 'ics-forensics', 'sha256', 'plc'],
        },
        metadata: { architecture: 'x86_64 / ARMv7', cveReference: 'CVE-2025-4921' },
      },
      {
        documentId: 'DOC-2026-30002',
        caseId: case3._id,
        name: 'Preliminary_Incident_Response_Brief.pdf',
        type: 'investigation-report',
        securityLevel: 'internal',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Preliminary_Incident_Response_Brief.pdf',
        cloudinaryPublicId: 'securedms/Preliminary_Incident_Response_Brief',
        mimeType: 'application/pdf',
        size: 420000,
        sha256Hash: computeHash('Initial containment, isolation and remediation brief for SCADA incident.'),
        version: 1,
        status: 'verified',
        uploadedBy: investigatorUser._id,
        ocrText: 'INCIDENT RESPONSE TIMELINE & CONTAINMENT BRIEF. Substation OT network isolated from corporate LAN within 18 minutes of ransom note generation.',
        aiSummary: 'Summary of emergency mitigation protocols deployed, preventing blackout cascade across municipal power grid.',
        aiClassification: {
          type: 'investigation-report',
          confidence: 0.95,
          entities: ['Municipal Power Authority', 'Arjun Mehta', 'CERT Coordination Desk'],
          keywords: ['incident-response', 'containment', 'investigation-report'],
        },
        metadata: { severity: 'Level 1 - National Infrastructure Critical' },
      },
    ];

    const documents = await Document.insertMany(documentsData);
    console.log(`[Seed] Created ${documents.length} demo documents.`);

    // 4. Create Document Versions (For multi-version documents)
    console.log('[Seed] Creating document version history records...');
    const doc2 = documents.find((d) => d.documentId === 'DOC-2026-10002');
    const doc5 = documents.find((d) => d.documentId === 'DOC-2026-20001');

    const versionsData = [
      // Version 1 of doc2
      {
        documentId: doc2._id,
        versionNumber: 1,
        fileUrl: doc2.fileUrl.replace('.pdf', '_v1.pdf'),
        cloudinaryPublicId: `${doc2.cloudinaryPublicId}_v1`,
        sha256Hash: computeHash('Initial draft memory dump before volatility plugin updates.'),
        size: 3200000,
        createdBy: forensicUser._id,
        changeDescription: 'Initial raw memory telemetry dump',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      // Version 2 of doc2 (current)
      {
        documentId: doc2._id,
        versionNumber: 2,
        fileUrl: doc2.fileUrl,
        cloudinaryPublicId: doc2.cloudinaryPublicId,
        sha256Hash: doc2.sha256Hash,
        size: doc2.size,
        createdBy: forensicUser._id,
        changeDescription: 'Included deep disassembled shellcode analysis & C2 IP indicators',
        createdAt: new Date(Date.now() - 3600000 * 6),
      },
      // Version 1 of doc5
      {
        documentId: doc5._id,
        versionNumber: 1,
        fileUrl: doc5.fileUrl.replace('.xlsx', '_v1.xlsx'),
        cloudinaryPublicId: `${doc5.cloudinaryPublicId}_v1`,
        sha256Hash: computeHash('First pass offshore bank records without overseas tax treaty validation.'),
        size: 1100000,
        createdBy: investigatorUser._id,
        changeDescription: 'Initial transaction ledger compilation',
        createdAt: new Date(Date.now() - 86400000 * 4),
      },
      // Version 2 of doc5 (current)
      {
        documentId: doc5._id,
        versionNumber: 2,
        fileUrl: doc5.fileUrl,
        cloudinaryPublicId: doc5.cloudinaryPublicId,
        sha256Hash: doc5.sha256Hash,
        size: doc5.size,
        createdBy: investigatorUser._id,
        changeDescription: 'Merged authenticated financial intelligence unit (FIU) verified statements',
        createdAt: new Date(Date.now() - 86400000 * 1),
      },
    ];

    // Also create v1 for other documents
    for (const doc of documents) {
      if (doc._id.toString() !== doc2._id.toString() && doc._id.toString() !== doc5._id.toString()) {
        versionsData.push({
          documentId: doc._id,
          versionNumber: 1,
          fileUrl: doc.fileUrl,
          cloudinaryPublicId: doc.cloudinaryPublicId,
          sha256Hash: doc.sha256Hash,
          size: doc.size,
          createdBy: doc.uploadedBy,
          changeDescription: 'Initial document ingest and cryptographic notarization',
          createdAt: doc.createdAt,
        });
      }
    }

    await DocumentVersion.insertMany(versionsData);
    console.log(`[Seed] Created ${versionsData.length} document version records.`);

    // 5. Create Realistic Audit Log Entries (18 entries)
    console.log('[Seed] Creating audit trail logs...');
    const auditLogsData = [
      {
        userId: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'USER_LOGIN',
        resourceType: 'user',
        resourceId: adminUser._id.toString(),
        details: 'Admin logged in via multi-factor authentication gateway',
        ipAddress: '192.168.1.10',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
      {
        userId: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'CASE_CREATED',
        resourceType: 'case',
        resourceId: case2.caseId,
        details: `Created Case ${case2.caseId}: ${case2.title}`,
        ipAddress: '192.168.1.10',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 5 + 1800000),
      },
      {
        userId: investigatorUser._id,
        userName: investigatorUser.name,
        userRole: investigatorUser.role,
        action: 'USER_LOGIN',
        resourceType: 'user',
        resourceId: investigatorUser._id.toString(),
        details: 'Investigator authenticated to terminal session',
        ipAddress: '192.168.1.25',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 4),
      },
      {
        userId: investigatorUser._id,
        userName: investigatorUser.name,
        userRole: investigatorUser.role,
        action: 'CASE_CREATED',
        resourceType: 'case',
        resourceId: case1.caseId,
        details: `Created Case ${case1.caseId}: ${case1.title}`,
        ipAddress: '192.168.1.25',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 4 + 1200000),
      },
      {
        userId: investigatorUser._id,
        userName: investigatorUser.name,
        userRole: investigatorUser.role,
        action: 'DOCUMENT_UPLOADED',
        resourceType: 'document',
        resourceId: 'DOC-2026-10001',
        details: 'Uploaded document FIR_Cyber_SWIFT_Breach_001.pdf and generated SHA-256 signature',
        ipAddress: '192.168.1.25',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 4 + 2400000),
      },
      {
        userId: forensicUser._id,
        userName: forensicUser.name,
        userRole: forensicUser.role,
        action: 'USER_LOGIN',
        resourceType: 'user',
        resourceId: forensicUser._id.toString(),
        details: 'Forensics Lead authenticated from forensic lab workstation',
        ipAddress: '192.168.1.42',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        userId: forensicUser._id,
        userName: forensicUser.name,
        userRole: forensicUser.role,
        action: 'DOCUMENT_UPLOADED',
        resourceType: 'document',
        resourceId: 'DOC-2026-10002',
        details: 'Uploaded initial Forensic Memory Dump Analysis Report',
        ipAddress: '192.168.1.42',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 3 + 1800000),
      },
      {
        userId: forensicUser._id,
        userName: forensicUser.name,
        userRole: forensicUser.role,
        action: 'INTEGRITY_VERIFIED',
        resourceType: 'document',
        resourceId: 'DOC-2026-10002',
        details: 'Routine integrity audit: SHA-256 checksum matched cryptographic ledger',
        ipAddress: '192.168.1.42',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 3 + 3600000),
      },
      {
        userId: forensicUser._id,
        userName: forensicUser.name,
        userRole: forensicUser.role,
        action: 'DOCUMENT_VERSION_CREATED',
        resourceType: 'document',
        resourceId: 'DOC-2026-10002',
        details: 'Created Version 2 with shellcode reverse engineering telemetry',
        ipAddress: '192.168.1.42',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        userId: legalUser._id,
        userName: legalUser.name,
        userRole: legalUser.role,
        action: 'USER_LOGIN',
        resourceType: 'user',
        resourceId: legalUser._id.toString(),
        details: 'Public Prosecutor logged in',
        ipAddress: '192.168.1.60',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 2 + 1000000),
      },
      {
        userId: legalUser._id,
        userName: legalUser.name,
        userRole: legalUser.role,
        action: 'DOCUMENT_VIEWED',
        resourceType: 'document',
        resourceId: 'DOC-2026-10001',
        details: 'Viewed FIR_Cyber_SWIFT_Breach_001.pdf for statutory indictment formulation',
        ipAddress: '192.168.1.60',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 2 + 1500000),
      },
      {
        userId: legalUser._id,
        userName: legalUser.name,
        userRole: legalUser.role,
        action: 'DOCUMENT_UPLOADED',
        resourceType: 'document',
        resourceId: 'DOC-2026-10004',
        details: 'Uploaded draft Indictment ChargeSheet for review',
        ipAddress: '192.168.1.60',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 1),
      },
      {
        userId: investigatorUser._id,
        userName: investigatorUser.name,
        userRole: investigatorUser.role,
        action: 'SEARCH_PERFORMED',
        resourceType: 'system',
        resourceId: '',
        details: 'Executed search query: "SWIFT OR shell company" across active dossiers',
        ipAddress: '192.168.1.25',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000 * 1 + 2000000),
      },
      {
        userId: forensicUser._id,
        userName: forensicUser.name,
        userRole: forensicUser.role,
        action: 'CASE_CREATED',
        resourceType: 'case',
        resourceId: case3.caseId,
        details: `Created Case ${case3.caseId}: ${case3.title}`,
        ipAddress: '192.168.1.42',
        status: 'success',
        createdAt: new Date(Date.now() - 3600000 * 18),
      },
      {
        userId: forensicUser._id,
        userName: forensicUser.name,
        userRole: forensicUser.role,
        action: 'DOCUMENT_UPLOADED',
        resourceType: 'document',
        resourceId: 'DOC-2026-30001',
        details: 'Uploaded SCADA Industrial Gateway Malware dump with SHA-256 validation',
        ipAddress: '192.168.1.42',
        status: 'success',
        createdAt: new Date(Date.now() - 3600000 * 16),
      },
      {
        userId: forensicUser._id,
        userName: forensicUser.name,
        userRole: forensicUser.role,
        action: 'AI_ANALYSIS_REQUESTED',
        resourceType: 'document',
        resourceId: 'DOC-2026-30001',
        details: 'Ran AI NLP classification and entity extractor on SCADA decompilation report',
        ipAddress: '192.168.1.42',
        status: 'success',
        createdAt: new Date(Date.now() - 3600000 * 15),
      },
      {
        userId: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'INTEGRITY_VERIFIED',
        resourceType: 'document',
        resourceId: 'DOC-2026-20001',
        details: 'System integrity verification pass completed: 100% hash consistency',
        ipAddress: '192.168.1.10',
        status: 'success',
        createdAt: new Date(Date.now() - 3600000 * 4),
      },
      {
        userId: investigatorUser._id,
        userName: investigatorUser.name,
        userRole: investigatorUser.role,
        action: 'CASE_VIEWED',
        resourceType: 'case',
        resourceId: case1.caseId,
        details: 'Investigator reviewed full evidentiary index for Operation Iron Vault',
        ipAddress: '192.168.1.25',
        status: 'success',
        createdAt: new Date(Date.now() - 3600000 * 1),
      },
    ];

    await AuditLog.insertMany(auditLogsData);
    console.log(`[Seed] Created ${auditLogsData.length} audit log entries.`);

    console.log('\n======================================================');
    console.log('✅ SECUREDMS DEMO DATA SEEDED SUCCESSFULLY');
    console.log('======================================================');
    console.log('DEMO ACCOUNTS (Password: "Demo@2026"):');
    console.log('1. Admin:         admin@securedms.demo    (Role: admin)');
    console.log('2. Investigator:  officer@securedms.demo  (Role: investigator)');
    console.log('3. Forensic:      forensic@securedms.demo (Role: forensic)');
    console.log('4. Legal:         legal@securedms.demo    (Role: legal)');
    console.log('======================================================\n');

    await mongoose.disconnect();
    console.log('[Seed] Database disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase();
}

export default seedDatabase;
