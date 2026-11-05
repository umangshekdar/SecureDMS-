import { AuditLog, AuditAction, Case, Document, DocumentVersion, User, UserRole } from '../types';

// ──────────────────────────────────────────────────────────────
// Valid Demo User Registry for session verification
// ──────────────────────────────────────────────────────────────
export const VALID_DEMO_ACCOUNTS: Record<string, { role: UserRole; name: string; department: string }> = {
  'admin@securedms.demo': {
    role: 'admin',
    name: 'System Administrator',
    department: 'Information Security & Compliance',
  },
  'officer@securedms.demo': {
    role: 'investigator',
    name: 'Arjun Mehta',
    department: 'Cyber Financial Crimes Wing',
  },
  'forensic@securedms.demo': {
    role: 'forensic',
    name: 'Riya Sharma',
    department: 'Digital Forensics & Evidence Lab',
  },
  'legal@securedms.demo': {
    role: 'legal',
    name: 'Kabir Verma',
    department: 'Directorate of Public Prosecution',
  },
};

export const DEMO_USERS: User[] = [
  {
    _id: 'usr-admin',
    name: 'System Administrator',
    email: 'admin@securedms.demo',
    role: 'admin',
    department: 'Information Security & Compliance',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    _id: 'usr-investigator',
    name: 'Arjun Mehta',
    email: 'officer@securedms.demo',
    role: 'investigator',
    department: 'Cyber Financial Crimes Wing',
    status: 'active',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
  },
  {
    _id: 'usr-forensic',
    name: 'Riya Sharma',
    email: 'forensic@securedms.demo',
    role: 'forensic',
    department: 'Digital Forensics & Evidence Lab',
    status: 'active',
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-08T00:00:00Z',
  },
  {
    _id: 'usr-legal',
    name: 'Kabir Verma',
    email: 'legal@securedms.demo',
    role: 'legal',
    department: 'Directorate of Public Prosecution',
    status: 'active',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
];

// ──────────────────────────────────────────────────────────────
// Canonical Demonstration Cases
// ──────────────────────────────────────────────────────────────
export const DEMO_CASES: Case[] = [
  {
    _id: 'case-10492',
    caseId: 'CASE-2026-10492',
    title: 'Operation Iron Vault - Multi-Tier Cyber Embezzlement',
    description: 'Investigation into fraudulent unauthorized SWIFT transfers bypassing secondary approval gateways in Metropolitan Banking Corp.',
    caseType: 'cybercrime',
    priority: 'critical',
    status: 'active',
    assignedUsers: [DEMO_USERS[1], DEMO_USERS[2], DEMO_USERS[3]],
    createdBy: DEMO_USERS[1],
    documentCount: 4,
    createdAt: '2026-02-14T08:30:00Z',
    updatedAt: '2026-03-20T11:45:00Z',
  },
  {
    _id: 'case-20831',
    caseId: 'CASE-2026-20831',
    title: 'State vs. Apex Dynamics - Corporate Tax Evasion & Shell Syndicate',
    description: 'Comprehensive financial audit tracking 42 bogus offshore intermediary companies laundering corporate revenue.',
    caseType: 'financial',
    priority: 'high',
    status: 'under-review',
    assignedUsers: [DEMO_USERS[1], DEMO_USERS[3]],
    createdBy: DEMO_USERS[0],
    documentCount: 3,
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-03-18T16:20:00Z',
  },
  {
    _id: 'case-30114',
    caseId: 'CASE-2026-30114',
    title: 'Digital Ransomware Breach at City Municipal Infrastructure',
    description: 'Incident response and digital forensic attribution regarding ransomware payload deployed across SCADA electrical sub-stations.',
    caseType: 'forensic',
    priority: 'critical',
    status: 'open',
    assignedUsers: [DEMO_USERS[2], DEMO_USERS[1]],
    createdBy: DEMO_USERS[2],
    documentCount: 2,
    createdAt: '2026-03-01T09:15:00Z',
    updatedAt: '2026-03-22T14:10:00Z',
  },
  {
    _id: 'case-101',
    caseId: 'CASE-2026-EOW-081',
    title: 'State vs. Meridian Financial - Cyber Fraud & Diversion',
    description: 'Primary investigation docket: Illegal diversion of funds via shell entities in Mauritius and Cyprus with ledger tampering.',
    caseType: 'financial',
    priority: 'high',
    status: 'active',
    assignedUsers: [DEMO_USERS[1], DEMO_USERS[3]],
    createdBy: DEMO_USERS[1],
    documentCount: 2,
    createdAt: '2026-03-14T09:00:00Z',
    updatedAt: '2026-03-14T09:30:00Z',
  },
];

// ──────────────────────────────────────────────────────────────
// Canonical Demonstration Documents
// ──────────────────────────────────────────────────────────────
export const DEMO_DOCUMENTS: Document[] = [
  // Documents for CASE-2026-10492
  {
    _id: 'doc-10001',
    documentId: 'DOC-2026-10001',
    caseId: DEMO_CASES[0],
    name: 'FIR_Cyber_SWIFT_Breach_001.pdf',
    type: 'fir',
    securityLevel: 'confidential',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/FIR_Cyber_SWIFT_Breach_001.pdf',
    cloudinaryPublicId: 'securedms/FIR_Cyber_SWIFT_Breach_001',
    mimeType: 'application/pdf',
    size: 245800,
    sha256Hash: '9f8a846c829b35b13b1a8d949b291d9ef0f0c0f833503b2f567498c8c2780287',
    version: 1,
    status: 'verified',
    uploadedBy: DEMO_USERS[1],
    ocrText: 'FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.) Police Station: Cyber Crime Special Cell. Complainant: Metropolitan Banking Corp. Suspect: Unknown intrusion group leveraging stolen SWIFT credentials.',
    aiSummary: 'First Information Report lodged by Metropolitan Banking Corp regarding $1.4M SWIFT diversion through credential compromise and unauthorized gateway access.',
    aiClassification: {
      type: 'First Information Report (FIR)',
      confidence: 0.98,
      entities: [
        { label: 'Complainant', value: 'Metropolitan Banking Corp' },
        { label: 'Agency', value: 'Cyber Crime Special Cell' },
        { label: 'Statute', value: 'Section 154 CrPC / IT Act 66' },
      ],
      keywords: ['fir', 'swift', 'unauthorized-access', 'cybercrime'],
    },
    metadata: { filingDate: '2026-02-14', investigatingOfficer: 'Arjun Mehta' },
    createdAt: '2026-02-14T09:30:00Z',
    updatedAt: '2026-02-14T09:30:00Z',
  },
  {
    _id: 'doc-10002',
    documentId: 'DOC-2026-10002',
    caseId: DEMO_CASES[0],
    name: 'Forensic_Memory_Dump_Analysis_Report.pdf',
    type: 'forensic-report',
    securityLevel: 'highly-confidential',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Forensic_Memory_Dump_Analysis_Report.pdf',
    cloudinaryPublicId: 'securedms/Forensic_Memory_Dump_Analysis_Report',
    mimeType: 'application/pdf',
    size: 4892000,
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    version: 2,
    status: 'verified',
    uploadedBy: DEMO_USERS[2],
    ocrText: 'FORENSIC ANALYSIS REPORT v2.0. Lab Ref: FL-2026-88. Volatility memory analysis revealed Cobalt Strike beacon injected into PID 4092 with reverse TCP connection to C2 server.',
    aiSummary: 'Digital forensics report detailing memory artifact analysis, uncovering Cobalt Strike beacon payload and reverse TCP shell at 185.220.101.44.',
    aiClassification: {
      type: 'Forensic Extraction Report',
      confidence: 0.96,
      entities: [
        { label: 'Examiner', value: 'Riya Sharma' },
        { label: 'Lab Reference', value: 'FL-2026-88' },
        { label: 'C2 IP', value: '185.220.101.44' },
      ],
      keywords: ['memory-dump', 'cobalt-strike', 'forensics', 'chain-of-custody'],
    },
    metadata: { labId: 'FL-2026-88', hashAlgorithm: 'SHA-256' },
    createdAt: '2026-02-18T14:15:00Z',
    updatedAt: '2026-02-20T16:20:00Z',
  },
  {
    _id: 'doc-10003',
    documentId: 'DOC-2026-10003',
    caseId: DEMO_CASES[0],
    name: 'Witness_Deposition_Database_Admin.docx',
    type: 'witness-statement',
    securityLevel: 'confidential',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Witness_Deposition_Database_Admin.docx',
    cloudinaryPublicId: 'securedms/Witness_Deposition_Database_Admin',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 92400,
    sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    version: 1,
    status: 'verified',
    uploadedBy: DEMO_USERS[1],
    ocrText: 'STATEMENT OF WITNESS UNDER SECTION 161 CrPC. Deponent: Rajiv Nambiar, Senior DBA. Witness affirms observing anomalous SSH login at 02:41 AM UTC bypassing PAM policy.',
    aiSummary: 'Deposition statement of senior DBA describing unexpected privileges escalation and access logs alteration on core banking server.',
    aiClassification: {
      type: 'Witness Deposition',
      confidence: 0.92,
      entities: [
        { label: 'Deponent', value: 'Rajiv Nambiar (Senior DBA)' },
        { label: 'Section', value: '161 CrPC' },
        { label: 'Institution', value: 'Metropolitan Banking Corp' },
      ],
      keywords: ['witness-statement', 'deposition', 'ssh-keys', 'pam'],
    },
    metadata: { swornBefore: 'Arjun Mehta', notaryStatus: 'Notarized' },
    createdAt: '2026-02-22T11:00:00Z',
    updatedAt: '2026-02-22T11:00:00Z',
  },
  {
    _id: 'doc-10004',
    documentId: 'DOC-2026-10004',
    caseId: DEMO_CASES[0],
    name: 'Draft_Indictment_ChargeSheet_v1.pdf',
    type: 'charge-sheet',
    securityLevel: 'highly-confidential',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Draft_Indictment_ChargeSheet_v1.pdf',
    cloudinaryPublicId: 'securedms/Draft_Indictment_ChargeSheet_v1',
    mimeType: 'application/pdf',
    size: 382000,
    sha256Hash: 'd41d8cd98f00b204e9800998ecf8427e00000000000000000000000000000000',
    version: 1,
    status: 'review-required',
    uploadedBy: DEMO_USERS[3],
    ocrText: 'FINAL POLICE REPORT / CHARGE SHEET (Section 173 Cr.P.C.). Accused charged under Information Technology Act 2000 Section 66, 66C and Indian Penal Code Section 420.',
    aiSummary: 'Prosecution charge sheet outlining criminal conspiracy, unauthorized computer access, and digital embezzlement counts.',
    aiClassification: {
      type: 'Charge Sheet',
      confidence: 0.95,
      entities: [
        { label: 'Prosecutor', value: 'Kabir Verma' },
        { label: 'Forum', value: 'Chief Judicial Magistrate Court' },
        { label: 'Statute', value: 'IT Act 66 / IPC 420' },
      ],
      keywords: ['charge-sheet', 'it-act', 'criminal-conspiracy', 'legal'],
    },
    metadata: { courtForum: 'Sessions Court Room 4' },
    createdAt: '2026-02-28T17:45:00Z',
    updatedAt: '2026-02-28T17:45:00Z',
  },

  // Documents for CASE-2026-20831
  {
    _id: 'doc-20001',
    documentId: 'DOC-2026-20001',
    caseId: DEMO_CASES[1],
    name: 'Forensic_Audit_Ledger_Shell_Accounts.xlsx',
    type: 'evidence-record',
    securityLevel: 'confidential',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Forensic_Audit_Ledger_Shell_Accounts.xlsx',
    cloudinaryPublicId: 'securedms/Forensic_Audit_Ledger_Shell_Accounts',
    mimeType: 'application/octet-stream',
    size: 1540000,
    sha256Hash: 'c7b2a95f928e4e71360812e967a50892a0149f8b417e26892e8605335191bf88',
    version: 2,
    status: 'verified',
    uploadedBy: DEMO_USERS[1],
    ocrText: 'FORENSIC AUDIT SPREADSHEET EXHIBIT EX-2026-44B. Ledger entries tracking INR 45,00,000 across Apex Dynamics subsidiaries in Mauritius and Singapore.',
    aiSummary: 'Financial trail exhibit cross-referencing multi-jurisdictional shell entity transfers totaling INR 45 Crores.',
    aiClassification: {
      type: 'Evidence Record',
      confidence: 0.94,
      entities: [
        { label: 'Target', value: 'Apex Dynamics Ltd' },
        { label: 'Jurisdiction', value: 'Mauritius / Singapore' },
        { label: 'Total Tracked', value: 'INR 45,00,00,000' },
      ],
      keywords: ['money-laundering', 'shell-companies', 'evidence', 'wire-transfer'],
    },
    metadata: { exhibitCode: 'EX-44B', seizureDate: '2026-01-20' },
    createdAt: '2026-01-22T10:15:00Z',
    updatedAt: '2026-01-25T14:00:00Z',
  },
  {
    _id: 'doc-20002',
    documentId: 'DOC-2026-20002',
    caseId: DEMO_CASES[1],
    name: 'Statutory_Summons_Notice_to_Directors.pdf',
    type: 'legal-notice',
    securityLevel: 'internal',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Statutory_Summons_Notice_to_Directors.pdf',
    cloudinaryPublicId: 'securedms/Statutory_Summons_Notice_to_Directors',
    mimeType: 'application/pdf',
    size: 198000,
    sha256Hash: 'b45c389146f827e19036f882a938174928174928374928374928374928374928',
    version: 1,
    status: 'verified',
    uploadedBy: DEMO_USERS[3],
    ocrText: 'FORMAL STATUTORY NOTICE UNDER SECTION 131. To: Board of Directors, Apex Dynamics Ltd. You are hereby ordered to appear with audited financial books.',
    aiSummary: 'Statutory summon requiring managing directors to produce books of account and beneficial ownership disclosures.',
    aiClassification: {
      type: 'Legal Notice',
      confidence: 0.97,
      entities: [
        { label: 'Recipient', value: 'Board of Directors, Apex Dynamics' },
        { label: 'Authority', value: 'Directorate of Enforcement' },
      ],
      keywords: ['legal-notice', 'statutory-demand', 'summons', 'compliance'],
    },
    metadata: { noticeTrackingId: 'SUM-2026-0091' },
    createdAt: '2026-01-28T12:00:00Z',
    updatedAt: '2026-01-28T12:00:00Z',
  },
  {
    _id: 'doc-20003',
    documentId: 'DOC-2026-20003',
    caseId: DEMO_CASES[1],
    name: 'High_Court_Writ_Petition_Interim_Stay.pdf',
    type: 'court-filing',
    securityLevel: 'public',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/High_Court_Writ_Petition_Interim_Stay.pdf',
    cloudinaryPublicId: 'securedms/High_Court_Writ_Petition_Interim_Stay',
    mimeType: 'application/pdf',
    size: 610000,
    sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    version: 1,
    status: 'verified',
    uploadedBy: DEMO_USERS[3],
    ocrText: 'IN THE HIGH COURT OF JUDICATURE. Writ Petition No. 1109 of 2026. In re: Apex Dynamics Ltd versus Union of India and Anr. Petition for interim relief.',
    aiSummary: 'High Court filing seeking relief against provisional bank account attachment orders pending ongoing inquiry.',
    aiClassification: {
      type: 'Court Filing',
      confidence: 0.93,
      entities: [
        { label: 'Bench', value: 'Division Commercial Bench' },
        { label: 'Petition No', value: 'WP-1109/2026' },
      ],
      keywords: ['court-filing', 'writ-petition', 'interim-stay', 'legal'],
    },
    metadata: { bench: 'Division Commercial Bench' },
    createdAt: '2026-02-05T15:30:00Z',
    updatedAt: '2026-02-05T15:30:00Z',
  },

  // Documents for CASE-2026-30114
  {
    _id: 'doc-30001',
    documentId: 'DOC-2026-30001',
    caseId: DEMO_CASES[2],
    name: 'SCADA_Industrial_Gateway_Malware_Dump.bin.pdf',
    type: 'forensic-report',
    securityLevel: 'highly-confidential',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/SCADA_Industrial_Gateway_Malware_Dump.pdf',
    cloudinaryPublicId: 'securedms/SCADA_Industrial_Gateway_Malware_Dump',
    mimeType: 'application/pdf',
    size: 7820000,
    sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    version: 1,
    status: 'verified',
    uploadedBy: DEMO_USERS[2],
    ocrText: 'ICS/SCADA FORENSIC DISASSEMBLY REPORT. Binary decompilation showed embedded Modbus TCP instructions targeting PLC firmware rewrite at port 502.',
    aiSummary: 'Forensic static disassembly of ransomware binary targeting industrial programmable logic controllers via Modbus protocol.',
    aiClassification: {
      type: 'Forensic Report',
      confidence: 0.99,
      entities: [
        { label: 'Site', value: 'City Municipal Substation 4' },
        { label: 'Protocol', value: 'Modbus TCP Port 502' },
        { label: 'CVE', value: 'CVE-2025-4921' },
      ],
      keywords: ['scada', 'malware', 'ics-forensics', 'sha256', 'plc'],
    },
    metadata: { architecture: 'x86_64 / ARMv7', cveReference: 'CVE-2025-4921' },
    createdAt: '2026-03-02T16:00:00Z',
    updatedAt: '2026-03-02T16:00:00Z',
  },
  {
    _id: 'doc-30002',
    documentId: 'DOC-2026-30002',
    caseId: DEMO_CASES[2],
    name: 'Preliminary_Incident_Response_Brief.pdf',
    type: 'investigation-report',
    securityLevel: 'internal',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Preliminary_Incident_Response_Brief.pdf',
    cloudinaryPublicId: 'securedms/Preliminary_Incident_Response_Brief',
    mimeType: 'application/pdf',
    size: 420000,
    sha256Hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    version: 1,
    status: 'verified',
    uploadedBy: DEMO_USERS[1],
    ocrText: 'INCIDENT RESPONSE TIMELINE & CONTAINMENT BRIEF. Substation OT network isolated from corporate LAN within 18 minutes of ransom note generation.',
    aiSummary: 'Summary of emergency mitigation protocols deployed, preventing blackout cascade across municipal power grid.',
    aiClassification: {
      type: 'Investigation Report',
      confidence: 0.95,
      entities: [
        { label: 'Entity', value: 'Municipal Power Authority' },
        { label: 'Lead', value: 'Arjun Mehta' },
      ],
      keywords: ['incident-response', 'containment', 'investigation-report'],
    },
    metadata: { severity: 'Level 1 - National Infrastructure Critical' },
    createdAt: '2026-03-04T11:20:00Z',
    updatedAt: '2026-03-04T11:20:00Z',
  },

  // Search Demo Documents (Aliased so Search and DocumentDetail stay 100% interoperable)
  {
    _id: 'doc-search-01',
    documentId: 'DOC-2026-FIR-8831',
    caseId: DEMO_CASES[3],
    name: 'State vs. Meridian Financial - Initial FIR & Forensic Audit.pdf',
    type: 'fir',
    securityLevel: 'confidential',
    fileUrl: '#',
    mimeType: 'application/pdf',
    size: 4892011,
    sha256Hash: '9f8a846c829b35b13b1a8d949b291d9ef0f0c0f833503b2f567498c8c2780287',
    version: 1,
    status: 'verified',
    uploadedBy: DEMO_USERS[1],
    ocrText: 'First Information Report registered under Section 420, 120-B IPC regarding illegal diversion of 42.5 Crore INR via shell entities in Mauritius and Cyprus.',
    aiSummary: 'Primary FIR filed detailing unauthorized wire transfers totaling ₹42.5 Cr executed through fictitious invoice claims between 2024 and 2026.',
    aiClassification: {
      type: 'First Information Report (FIR)',
      confidence: 0.98,
      entities: [
        { label: 'Accused', value: 'Meridian Capital Ltd' },
        { label: 'Statute', value: 'IPC Section 420 / 120-B' },
        { label: 'Amount', value: 'INR 42,50,00,000' },
      ],
      keywords: ['FIR', 'Financial Fraud', 'Money Laundering', 'Shell Companies'],
    },
    createdAt: '2026-03-14T09:30:00Z',
    updatedAt: '2026-03-14T09:30:00Z',
  },
  {
    _id: 'doc-search-02',
    documentId: 'DOC-2026-FOR-9042',
    caseId: DEMO_CASES[3],
    name: 'Forensic Hardware Extraction & Memory Dump Analysis.pdf',
    type: 'forensic-report',
    securityLevel: 'highly-confidential',
    fileUrl: '#',
    mimeType: 'application/pdf',
    size: 15728640,
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    version: 2,
    status: 'verified',
    uploadedBy: DEMO_USERS[2],
    ocrText: 'Bitstream disk image analysis of Lenovo ThinkStation SSD. SHA-256 match validated with custody bag #8821. Recovered encrypted Outlook PST containers.',
    aiSummary: 'Forensic disk acquisition confirming cryptographic integrity of recovered encrypted database containing illicit communication logs.',
    aiClassification: {
      type: 'Digital Forensics Extraction Report',
      confidence: 0.96,
      entities: [
        { label: 'Device', value: 'Lenovo ThinkStation SSD 1TB' },
        { label: 'Evidence Bag', value: '#8821-CFSL' },
      ],
      keywords: ['Disk Image', 'SHA-256', 'PST Archive', 'Deleted Artifacts'],
    },
    createdAt: '2026-04-02T14:15:00Z',
    updatedAt: '2026-04-02T16:20:00Z',
  },
  {
    _id: 'doc-search-03',
    documentId: 'DOC-2026-WIT-4109',
    caseId: DEMO_CASES[1],
    name: 'Deposition & Sworn Witness Statement - Mr. Rajesh K..pdf',
    type: 'witness-statement',
    securityLevel: 'confidential',
    fileUrl: '#',
    mimeType: 'application/pdf',
    size: 2097152,
    sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    version: 1,
    status: 'verified',
    uploadedBy: DEMO_USERS[3],
    ocrText:
      'Statement recorded under Section 164 CrPC before the Metropolitan Magistrate. Witness confirms unauthorized server access logs recorded during midnight shift at Mumbai data center.',
    aiSummary:
      'Sworn eyewitness statement affirming credential sharing and unauthorized physical server room entry on 18th February 2026.',
    aiClassification: {
      type: 'Sworn Witness Deposition',
      confidence: 0.94,
      entities: [
        { label: 'Deponent', value: 'Rajesh K. (Chief Systems Admin)' },
        { label: 'Location', value: 'BKC Data Center, Mumbai' },
      ],
      keywords: ['Witness Statement', 'CrPC 164', 'Unauthorized Access'],
    },
    createdAt: '2026-05-18T11:00:00Z',
    updatedAt: '2026-05-18T11:00:00Z',
  },
  {
    _id: 'doc-search-04',
    documentId: 'DOC-2026-CHG-1088',
    caseId: DEMO_CASES[2],
    name: 'Special Court Formal Chargesheet & Annexures - Case 09.pdf',
    type: 'charge-sheet',
    securityLevel: 'internal',
    fileUrl: '#',
    mimeType: 'application/pdf',
    size: 8945632,
    sha256Hash: 'd41d8cd98f00b204e9800998ecf8427e00000000000000000000000000000000',
    version: 1,
    status: 'verified',
    uploadedBy: DEMO_USERS[0],
    ocrText:
      'IN THE COURT OF SPECIAL SESSIONS JUDGE, ECONOMIC OFFENCES. Formal indictment filed under Prevention of Corruption Act and IPC 409/477A. Forensic exhibits A1-G14 attached.',
    aiSummary:
      'Judicial prosecution docket consolidating 14 evidentiary exhibits into final formal charge sheet awaiting trial scheduling.',
    aiClassification: {
      type: 'Criminal Court Formal Indictment',
      confidence: 0.97,
      entities: [
        { label: 'Court', value: 'Special Sessions Judge (EOW)' },
        { label: 'Sections', value: 'PCA Sec 13 / IPC 409, 477A' },
      ],
      keywords: ['Chargesheet', 'Indictment', 'Judicial Docket'],
    },
    createdAt: '2026-06-01T15:00:00Z',
    updatedAt: '2026-06-01T15:00:00Z',
  },
];

// ──────────────────────────────────────────────────────────────
// Demonstration Document Versions
// ──────────────────────────────────────────────────────────────
export const DEMO_DOCUMENT_VERSIONS: Record<string, DocumentVersion[]> = {
  'doc-10002': [
    {
      _id: 'ver-10002-1',
      documentId: 'doc-10002',
      versionNumber: 1,
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Forensic_Memory_Dump_Analysis_Report_v1.pdf',
      sha256Hash: '3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855a',
      size: 3200000,
      createdBy: DEMO_USERS[2],
      changeDescription: 'Initial raw memory telemetry dump',
      createdAt: '2026-02-18T14:15:00Z',
    },
    {
      _id: 'ver-10002-2',
      documentId: 'doc-10002',
      versionNumber: 2,
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Forensic_Memory_Dump_Analysis_Report.pdf',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      size: 4892000,
      createdBy: DEMO_USERS[2],
      changeDescription: 'Included deep disassembled shellcode analysis & C2 IP indicators',
      createdAt: '2026-02-20T16:20:00Z',
    },
  ],
  'doc-20001': [
    {
      _id: 'ver-20001-1',
      documentId: 'doc-20001',
      versionNumber: 1,
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Forensic_Audit_Ledger_Shell_Accounts_v1.xlsx',
      sha256Hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      size: 1100000,
      createdBy: DEMO_USERS[1],
      changeDescription: 'First pass transaction ledger compilation without overseas tax treaty validation',
      createdAt: '2026-01-22T10:15:00Z',
    },
    {
      _id: 'ver-20001-2',
      documentId: 'doc-20001',
      versionNumber: 2,
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1710000000/securedms/Forensic_Audit_Ledger_Shell_Accounts.xlsx',
      sha256Hash: 'c7b2a95f928e4e71360812e967a50892a0149f8b417e26892e8605335191bf88',
      size: 1540000,
      createdBy: DEMO_USERS[1],
      changeDescription: 'Merged authenticated financial intelligence unit (FIU) verified statements',
      createdAt: '2026-01-25T14:00:00Z',
    },
  ],
  'doc-search-02': [
    {
      _id: 'ver-9042-1',
      documentId: 'doc-search-02',
      versionNumber: 1,
      fileUrl: '#',
      sha256Hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      size: 10485760,
      createdBy: DEMO_USERS[2],
      changeDescription: 'Initial raw disk image acquisition',
      createdAt: '2026-04-01T10:00:00Z',
    },
    {
      _id: 'ver-9042-2',
      documentId: 'doc-search-02',
      versionNumber: 2,
      fileUrl: '#',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      size: 15728640,
      createdBy: DEMO_USERS[2],
      changeDescription: 'Appended forensic addendum with extracted PST container metadata',
      createdAt: '2026-04-02T16:20:00Z',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// Helper Functions
// ──────────────────────────────────────────────────────────────

/**
 * Checks whether an error is caused by a network disconnection or server unavailability.
 * Returns false for genuine HTTP client/auth errors (400, 401, 403, 404, 422).
 */
export function isNetworkOrServerError(error: unknown): boolean {
  if (!error) return false;
  const err = error as { code?: string; message?: string; response?: { status?: number } };

  // Explicit network failure (e.g., backend server not running)
  if (!err.response) return true;
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') return true;

  // Server-side unavailability (e.g. gateway down / service unavailable)
  const status = err.response.status;
  if (status === 502 || status === 503 || status === 504) {
    return true;
  }

  return false;
}

/**
 * Retrieve demo cases with optional filtering.
 */
export function getDemoCases(params?: {
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  page?: number;
  limit?: number;
}): { cases: Case[]; total: number; pages: number } {
  let list = [...DEMO_CASES];

  if (params?.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.caseId.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  if (params?.status && params.status !== 'all') {
    list = list.filter((c) => c.status === params.status);
  }

  if (params?.priority && params.priority !== 'all') {
    list = list.filter((c) => c.priority === params.priority);
  }

  if (params?.type && params.type !== 'all') {
    list = list.filter((c) => c.caseType === params.type);
  }

  const total = list.length;
  const limit = params?.limit || 10;
  const page = params?.page || 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  const paginated = list.slice((page - 1) * limit, page * limit);

  return { cases: paginated, total, pages };
}

/**
 * Retrieve a single demo case by ID or caseId code.
 */
export function getDemoCase(id: string): Case | null {
  const normalized = id.trim().toLowerCase();
  return (
    DEMO_CASES.find(
      (c) =>
        c._id.toLowerCase() === normalized ||
        c.caseId.toLowerCase() === normalized
    ) || null
  );
}

/**
 * Register a newly created demo case in memory so it can be navigated to.
 */
export function addDemoCase(newCase: Case): void {
  const existingIdx = DEMO_CASES.findIndex((c) => c._id === newCase._id);
  if (existingIdx >= 0) {
    DEMO_CASES[existingIdx] = newCase;
  } else {
    DEMO_CASES.unshift(newCase);
  }
}

/**
 * Retrieve demo documents with optional filtering.
 */
export function getDemoDocuments(params?: {
  search?: string;
  type?: string;
  securityLevel?: string;
  status?: string;
  caseId?: string;
  page?: number;
  limit?: number;
}): { documents: Document[]; total: number; pages: number } {
  let list = [...DEMO_DOCUMENTS];

  if (params?.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.documentId.toLowerCase().includes(q) ||
        (d.ocrText && d.ocrText.toLowerCase().includes(q)) ||
        (d.aiSummary && d.aiSummary.toLowerCase().includes(q))
    );
  }

  if (params?.type) {
    list = list.filter((d) => d.type === params.type);
  }

  if (params?.securityLevel) {
    list = list.filter((d) => d.securityLevel === params.securityLevel);
  }

  if (params?.status) {
    list = list.filter((d) => d.status === params.status);
  }

  if (params?.caseId) {
    const cid = params.caseId.toLowerCase();
    list = list.filter((d) => {
      if (typeof d.caseId === 'string') {
        return d.caseId.toLowerCase() === cid;
      }
      return (
        d.caseId._id.toLowerCase() === cid ||
        d.caseId.caseId.toLowerCase() === cid
      );
    });
  }

  const total = list.length;
  const limit = params?.limit || 10;
  const page = params?.page || 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  const paginated = list.slice((page - 1) * limit, page * limit);

  return { documents: paginated, total, pages };
}

/**
 * Retrieve a single demo document by ID or documentId.
 */
export function getDemoDocument(id: string): Document | null {
  const normalized = id.trim().toLowerCase();
  return (
    DEMO_DOCUMENTS.find(
      (d) =>
        d._id.toLowerCase() === normalized ||
        d.documentId.toLowerCase() === normalized
    ) || null
  );
}

/**
 * Register a newly uploaded demo document in memory so it can be viewed and verified.
 */
export function addDemoDocument(newDoc: Document): void {
  const existingIdx = DEMO_DOCUMENTS.findIndex((d) => d._id === newDoc._id);
  if (existingIdx >= 0) {
    DEMO_DOCUMENTS[existingIdx] = newDoc;
  } else {
    DEMO_DOCUMENTS.unshift(newDoc);
  }
}

/**
 * Retrieve demo versions for a document.
 */
export function getDemoDocumentVersions(documentId: string): DocumentVersion[] {
  const normalized = documentId.trim().toLowerCase();
  const key = Object.keys(DEMO_DOCUMENT_VERSIONS).find((k) => k.toLowerCase() === normalized);
  if (key && DEMO_DOCUMENT_VERSIONS[key]) {
    return DEMO_DOCUMENT_VERSIONS[key];
  }

  // Also check if document exists and provide at least version 1
  const doc = getDemoDocument(documentId);
  if (doc) {
    return [
      {
        _id: `ver-${doc._id}-1`,
        documentId: doc._id,
        versionNumber: doc.version || 1,
        fileUrl: doc.fileUrl,
        sha256Hash: doc.sha256Hash,
        size: doc.size,
        createdBy: doc.uploadedBy,
        changeDescription: 'Initial document upload with SHA-256 seal',
        createdAt: doc.createdAt,
      },
    ];
  }

  return [];
}

// ──────────────────────────────────────────────────────────────
// Demonstration Audit Logs
// ──────────────────────────────────────────────────────────────
export const DEMO_AUDIT_LOGS: AuditLog[] = [
  // Live / Recent events
  {
    _id: 'log-101',
    userId: 'usr-01',
    userName: 'Special Agent Vikram Rao',
    userRole: 'investigator',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-FIR-8831',
    details: 'SHA-256 integrity validation succeeded — hash matched stored fingerprint.',
    ipAddress: '10.240.12.84',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
  {
    _id: 'log-102',
    userId: 'usr-02',
    userName: 'Dr. Neha Sharma',
    userRole: 'forensic',
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-FOR-9042',
    details: 'Uploaded forensic disk acquisition image (15.0 MB).',
    ipAddress: '10.240.15.112',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
  },
  {
    _id: 'log-103',
    userId: 'usr-03',
    userName: 'Adv. Ananya Iyer',
    userRole: 'legal',
    action: 'DOCUMENT_VIEWED',
    resourceType: 'document',
    resourceId: 'DOC-2026-WIT-4109',
    details: 'Viewed Section 164 CrPC witness statement.',
    ipAddress: '192.168.1.45',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    _id: 'log-104',
    userId: 'usr-01',
    userName: 'Special Agent Vikram Rao',
    userRole: 'investigator',
    action: 'DOCUMENT_DOWNLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-FIR-8831',
    details: 'Downloaded verified PDF for court submission.',
    ipAddress: '10.240.12.84',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    _id: 'log-105',
    userId: 'usr-04',
    userName: 'System Administrator',
    userRole: 'admin',
    action: 'USER_LOGIN',
    resourceType: 'user',
    resourceId: 'USR-ADMIN-01',
    details: 'Successful login via JWT authentication.',
    ipAddress: '10.10.0.5',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    _id: 'log-106',
    userId: 'usr-02',
    userName: 'Dr. Neha Sharma',
    userRole: 'forensic',
    action: 'DOCUMENT_VERSION_CREATED',
    resourceType: 'document',
    resourceId: 'DOC-2026-FOR-9042',
    details: 'Created version 2 — added forensic addendum with PST metadata.',
    ipAddress: '10.240.15.112',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    _id: 'log-107',
    userId: 'usr-99',
    userName: 'Unknown IP Endpoint',
    userRole: 'investigator',
    action: 'INTEGRITY_FAILED',
    resourceType: 'document',
    resourceId: 'DOC-2026-RAW-0019',
    details: 'SHA-256 hash mismatch — current file does not match the stored fingerprint.',
    ipAddress: '198.51.100.44',
    status: 'failure',
    createdAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
  },
  {
    _id: 'log-108',
    userId: 'usr-01',
    userName: 'Special Agent Vikram Rao',
    userRole: 'investigator',
    action: 'CASE_CREATED',
    resourceType: 'case',
    resourceId: 'CASE-2026-EOW-081',
    details: 'Created new high-priority case: Cyber trespass & wire fraud investigation.',
    ipAddress: '10.240.12.84',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
  },
  {
    _id: 'log-109',
    userId: 'usr-04',
    userName: 'System Administrator',
    userRole: 'admin',
    action: 'USER_CREATED',
    resourceType: 'user',
    resourceId: 'USR-LEGAL-88',
    details: 'Created new legal counsel account.',
    ipAddress: '10.10.0.5',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
  },
  {
    _id: 'log-110',
    userId: 'usr-03',
    userName: 'Adv. Ananya Iyer',
    userRole: 'legal',
    action: 'DOCUMENT_UPDATED',
    resourceType: 'document',
    resourceId: 'DOC-2026-WIT-4109',
    details: 'Updated classification metadata — security level set to Confidential.',
    ipAddress: '192.168.1.45',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 1100).toISOString(),
  },
  {
    _id: 'log-111',
    userId: 'usr-04',
    userName: 'System Administrator',
    userRole: 'admin',
    action: 'DOCUMENT_DELETED',
    resourceType: 'document',
    resourceId: 'DOC-2026-TMP-0044',
    details: 'Removed temporary draft after investigative sign-off.',
    ipAddress: '10.10.0.5',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 1400).toISOString(),
  },
  {
    _id: 'log-112',
    userId: 'usr-01',
    userName: 'Special Agent Vikram Rao',
    userRole: 'investigator',
    action: 'CASE_UPDATED',
    resourceType: 'case',
    resourceId: 'CASE-2026-EOW-081',
    details: 'Elevated case priority from Medium to High following forensic findings.',
    ipAddress: '10.240.12.84',
    status: 'success',
    createdAt: new Date(Date.now() - 1000 * 60 * 1800).toISOString(),
  },

  // Canonical Repository Documents:
  // --- DOC-2026-10001 (FIR_Cyber_SWIFT_Breach_001.pdf) ---
  {
    _id: 'log-10001-1',
    userId: 'usr-01',
    userName: 'Special Agent Vikram Rao',
    userRole: 'investigator',
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10001',
    details: 'Uploaded FIR_Cyber_SWIFT_Breach_001.pdf and sealed initial SHA-256 fingerprint.',
    ipAddress: '192.168.1.25',
    status: 'success',
    createdAt: '2026-02-15T09:30:00Z',
  },
  {
    _id: 'log-10001-2',
    userId: 'usr-00',
    userName: 'Automated Neural Pipeline',
    userRole: 'system',
    action: 'AI_ANALYSIS_REQUESTED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10001',
    details: 'Extracted OCR text and NLP legal entities for SWIFT transaction records. Confidence: 98%.',
    ipAddress: '127.0.0.1',
    status: 'success',
    createdAt: '2026-02-15T09:42:00Z',
  },
  {
    _id: 'log-10001-3',
    userId: 'usr-02',
    userName: 'Dr. Neha Sharma',
    userRole: 'forensic',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10001',
    details: 'Cryptographic SHA-256 checksum matched digital ledger: e7f9b8c3412a...',
    ipAddress: '192.168.1.42',
    status: 'success',
    createdAt: '2026-02-15T11:15:00Z',
  },
  {
    _id: 'log-10001-4',
    userId: 'usr-03',
    userName: 'Adv. Ananya Iyer',
    userRole: 'legal',
    action: 'DOCUMENT_VIEWED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10001',
    details: 'Viewed FIR_Cyber_SWIFT_Breach_001.pdf for statutory indictment formulation.',
    ipAddress: '192.168.1.60',
    status: 'success',
    createdAt: '2026-02-16T14:20:00Z',
  },

  // --- DOC-2026-10002 (Forensic_Memory_Dump_Analysis_Report.pdf) ---
  {
    _id: 'log-10002-1',
    userId: 'usr-02',
    userName: 'Dr. Neha Sharma',
    userRole: 'forensic',
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10002',
    details: 'Uploaded raw memory telemetry dump (Forensic_Memory_Dump_Analysis_Report_v1.pdf).',
    ipAddress: '192.168.1.42',
    status: 'success',
    createdAt: '2026-02-18T14:15:00Z',
  },
  {
    _id: 'log-10002-2',
    userId: 'usr-02',
    userName: 'Dr. Neha Sharma',
    userRole: 'forensic',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10002',
    details: 'Bitwise hash verification passed: 3b0c44298fc1c149afbf4c8996fb92427ae41e46...',
    ipAddress: '192.168.1.42',
    status: 'success',
    createdAt: '2026-02-18T16:00:00Z',
  },
  {
    _id: 'log-10002-3',
    userId: 'usr-02',
    userName: 'Dr. Neha Sharma',
    userRole: 'forensic',
    action: 'DOCUMENT_VERSION_CREATED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10002',
    details: 'Created Version 2: Included deep disassembled shellcode analysis & C2 IP indicators.',
    ipAddress: '192.168.1.42',
    status: 'success',
    createdAt: '2026-02-20T16:20:00Z',
  },
  {
    _id: 'log-10002-4',
    userId: 'usr-01',
    userName: 'Special Agent Vikram Rao',
    userRole: 'investigator',
    action: 'DOCUMENT_VIEWED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10002',
    details: 'Investigator reviewed shellcode disassembly findings and C2 telemetry.',
    ipAddress: '192.168.1.25',
    status: 'success',
    createdAt: '2026-02-21T10:05:00Z',
  },

  // --- DOC-2026-10003 (Sworn_Witness_Statement_Chief_SecOps.pdf) ---
  {
    _id: 'log-10003-1',
    userId: 'usr-03',
    userName: 'Adv. Ananya Iyer',
    userRole: 'legal',
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10003',
    details: 'Uploaded Sworn Witness Statement under Section 164 CrPC of Chief SecOps Officer.',
    ipAddress: '192.168.1.60',
    status: 'success',
    createdAt: '2026-02-22T10:00:00Z',
  },
  {
    _id: 'log-10003-2',
    userId: 'usr-02',
    userName: 'Dr. Neha Sharma',
    userRole: 'forensic',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10003',
    details: 'Evidentiary seal verified: SHA-256 fingerprint 88f4b593674d8...',
    ipAddress: '192.168.1.42',
    status: 'success',
    createdAt: '2026-02-22T11:30:00Z',
  },
  {
    _id: 'log-10003-3',
    userId: 'usr-01',
    userName: 'Special Agent Vikram Rao',
    userRole: 'investigator',
    action: 'DOCUMENT_VIEWED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10003',
    details: 'Cross-referenced witness timeline with perimeter firewall logs.',
    ipAddress: '192.168.1.25',
    status: 'success',
    createdAt: '2026-02-23T08:45:00Z',
  },

  // --- DOC-2026-10004 (Formal_Indictment_ChargeSheet_Draft.pdf) ---
  {
    _id: 'log-10004-1',
    userId: 'usr-03',
    userName: 'Adv. Ananya Iyer',
    userRole: 'legal',
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10004',
    details: 'Uploaded statutory draft indictment chargesheet for judicial filing.',
    ipAddress: '192.168.1.60',
    status: 'success',
    createdAt: '2026-02-28T16:00:00Z',
  },
  {
    _id: 'log-10004-2',
    userId: 'usr-01',
    userName: 'Special Agent Vikram Rao',
    userRole: 'investigator',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-10004',
    details: 'Verified SHA-256 integrity signature before forwarding to Sessions Court.',
    ipAddress: '192.168.1.25',
    status: 'success',
    createdAt: '2026-03-01T09:10:00Z',
  },

  // --- DOC-2026-20001 (Forensic_Audit_Ledger_Shell_Accounts.xlsx) ---
  {
    _id: 'log-20001-1',
    userId: 'usr-01',
    userName: 'Special Agent Vikram Rao',
    userRole: 'investigator',
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-20001',
    details: 'Uploaded forensic transaction ledger tracking 42 offshore shell entities.',
    ipAddress: '192.168.1.25',
    status: 'success',
    createdAt: '2026-01-22T10:15:00Z',
  },
  {
    _id: 'log-20001-2',
    userId: 'usr-01',
    userName: 'Special Agent Vikram Rao',
    userRole: 'investigator',
    action: 'DOCUMENT_VERSION_CREATED',
    resourceType: 'document',
    resourceId: 'DOC-2026-20001',
    details: 'Version 2 created: Merged authenticated financial intelligence unit (FIU) verified statements.',
    ipAddress: '192.168.1.25',
    status: 'success',
    createdAt: '2026-01-25T14:00:00Z',
  },
  {
    _id: 'log-20001-3',
    userId: 'usr-04',
    userName: 'System Administrator',
    userRole: 'admin',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-20001',
    details: 'System integrity verification pass completed: 100% hash consistency.',
    ipAddress: '192.168.1.10',
    status: 'success',
    createdAt: '2026-01-26T12:00:00Z',
  },
  {
    _id: 'log-20001-4',
    userId: 'usr-03',
    userName: 'Adv. Ananya Iyer',
    userRole: 'legal',
    action: 'DOCUMENT_DOWNLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-20001',
    details: 'Downloaded authenticated ledger for economic offences court exhibits.',
    ipAddress: '192.168.1.60',
    status: 'success',
    createdAt: '2026-01-28T15:30:00Z',
  },

  // --- DOC-2026-20002 (Section_131_Statutory_Summons_Notice.pdf) ---
  {
    _id: 'log-20002-1',
    userId: 'usr-03',
    userName: 'Adv. Ananya Iyer',
    userRole: 'legal',
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-20002',
    details: 'Uploaded Section 131 Statutory Summons notice served upon corporate directors.',
    ipAddress: '192.168.1.60',
    status: 'success',
    createdAt: '2026-01-29T11:00:00Z',
  },
  {
    _id: 'log-20002-2',
    userId: 'usr-01',
    userName: 'Special Agent Vikram Rao',
    userRole: 'investigator',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-20002',
    details: 'SHA-256 seal confirmed intact. No modifications found.',
    ipAddress: '192.168.1.25',
    status: 'success',
    createdAt: '2026-01-30T10:20:00Z',
  },

  // --- DOC-2026-20003 (High_Court_Interim_Injunction_Writ.pdf) ---
  {
    _id: 'log-20003-1',
    userId: 'usr-03',
    userName: 'Adv. Ananya Iyer',
    userRole: 'legal',
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-20003',
    details: 'Uploaded High Court interim injunction writ petition filed by respondents.',
    ipAddress: '192.168.1.60',
    status: 'success',
    createdAt: '2026-02-05T15:30:00Z',
  },
  {
    _id: 'log-20003-2',
    userId: 'usr-03',
    userName: 'Adv. Ananya Iyer',
    userRole: 'legal',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-20003',
    details: 'SHA-256 checksum matched judicial notarization ledger.',
    ipAddress: '192.168.1.60',
    status: 'success',
    createdAt: '2026-02-06T09:15:00Z',
  },

  // --- DOC-2026-30001 (SCADA_Industrial_Gateway_Malware_Dump.bin.pdf) ---
  {
    _id: 'log-30001-1',
    userId: 'usr-02',
    userName: 'Dr. Neha Sharma',
    userRole: 'forensic',
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-30001',
    details: 'Uploaded SCADA Industrial Gateway Malware dump with SHA-256 validation.',
    ipAddress: '192.168.1.42',
    status: 'success',
    createdAt: '2026-03-02T16:00:00Z',
  },
  {
    _id: 'log-30001-2',
    userId: 'usr-02',
    userName: 'Dr. Neha Sharma',
    userRole: 'forensic',
    action: 'AI_ANALYSIS_REQUESTED',
    resourceType: 'document',
    resourceId: 'DOC-2026-30001',
    details: 'Ran AI NLP classification and entity extractor on SCADA decompilation report.',
    ipAddress: '192.168.1.42',
    status: 'success',
    createdAt: '2026-03-02T16:15:00Z',
  },
  {
    _id: 'log-30001-3',
    userId: 'usr-02',
    userName: 'Dr. Neha Sharma',
    userRole: 'forensic',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-30001',
    details: 'Cryptographic ledger match confirmed: 4b227777d4dd1fc61c6f884f48641d02...',
    ipAddress: '192.168.1.42',
    status: 'success',
    createdAt: '2026-03-03T11:40:00Z',
  },

  // --- DOC-2026-30002 (Preliminary_Incident_Response_Brief.pdf) ---
  {
    _id: 'log-30002-1',
    userId: 'usr-01',
    userName: 'Special Agent Vikram Rao',
    userRole: 'investigator',
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-30002',
    details: 'Uploaded Preliminary Incident Response Brief for municipal grid containment.',
    ipAddress: '192.168.1.25',
    status: 'success',
    createdAt: '2026-03-04T11:20:00Z',
  },
  {
    _id: 'log-30002-2',
    userId: 'usr-02',
    userName: 'Dr. Neha Sharma',
    userRole: 'forensic',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-30002',
    details: 'SHA-256 integrity validation succeeded against vault record.',
    ipAddress: '192.168.1.42',
    status: 'success',
    createdAt: '2026-03-04T14:00:00Z',
  },

  // --- DOC-2026-CHG-1088 (Special Court Formal Chargesheet & Annexures - Case 09.pdf) ---
  {
    _id: 'log-chg-1',
    userId: 'usr-00',
    userName: 'System Administrator',
    userRole: 'admin',
    action: 'DOCUMENT_UPLOADED',
    resourceType: 'document',
    resourceId: 'DOC-2026-CHG-1088',
    details: 'Formal indictment filed under Prevention of Corruption Act and IPC 409/477A.',
    ipAddress: '10.10.0.5',
    status: 'success',
    createdAt: '2026-06-01T15:00:00Z',
  },
  {
    _id: 'log-chg-2',
    userId: 'usr-03',
    userName: 'Adv. Ananya Iyer',
    userRole: 'legal',
    action: 'INTEGRITY_VERIFIED',
    resourceType: 'document',
    resourceId: 'DOC-2026-CHG-1088',
    details: 'Judicial docket cryptographically sealed and verified with Sessions Court clerk.',
    ipAddress: '192.168.1.60',
    status: 'success',
    createdAt: '2026-06-02T10:30:00Z',
  },
];

/**
 * Retrieve demo audit logs for a specific document or system query.
 * If no matching records exist for a document, dynamically generates an authentic
 * lifecycle history (ingest, AI extraction, hash verification, review).
 */
export function getDemoAuditLogs(params?: {
  documentId?: string;
  resourceId?: string;
  docName?: string;
  action?: string;
  resourceType?: string;
  search?: string;
  limit?: number;
}): AuditLog[] {
  let list = [...DEMO_AUDIT_LOGS];

  if (params?.documentId || params?.resourceId || params?.docName) {
    const docId = (params.documentId || '').toLowerCase().trim();
    const resId = (params.resourceId || '').toLowerCase().trim();
    const docName = (params.docName || '').toLowerCase().trim();

    const matches = list.filter((log) => {
      const rId = (log.resourceId || '').toLowerCase();
      const details = (log.details || '').toLowerCase();
      return (
        (docId && (rId === docId || details.includes(docId))) ||
        (resId && (rId === resId || details.includes(resId))) ||
        (docName && details.includes(docName))
      );
    });

    if (matches.length > 0) {
      return matches.slice(0, params.limit || 50);
    }

    // If no existing logs matched, dynamically generate and register lifecycle logs for this document
    const targetDoc = getDemoDocument(params.documentId || params.resourceId || '');
    if (targetDoc) {
      const uploaderName =
        typeof targetDoc.uploadedBy === 'object' && targetDoc.uploadedBy !== null
          ? targetDoc.uploadedBy.name
          : 'Special Agent Vikram Rao';
      const uploaderRole =
        typeof targetDoc.uploadedBy === 'object' && targetDoc.uploadedBy !== null
          ? targetDoc.uploadedBy.role
          : 'investigator';

      const uploadTime = new Date(targetDoc.createdAt).getTime();
      const generated: AuditLog[] = [
        {
          _id: `log-dyn-upl-${targetDoc._id}`,
          userId: 'usr-01',
          userName: uploaderName,
          userRole: uploaderRole,
          action: 'DOCUMENT_UPLOADED',
          resourceType: 'document',
          resourceId: targetDoc.documentId,
          details: `Evidentiary record ${targetDoc.name} ingested. Cryptographic SHA-256 seal notarized: ${targetDoc.sha256Hash.slice(0, 16)}...`,
          ipAddress: '192.168.1.25',
          status: 'success',
          createdAt: targetDoc.createdAt,
        },
        {
          _id: `log-dyn-ai-${targetDoc._id}`,
          userId: 'usr-00',
          userName: 'Automated Neural Pipeline',
          userRole: 'system',
          action: 'AI_ANALYSIS_REQUESTED',
          resourceType: 'document',
          resourceId: targetDoc.documentId,
          details: `Extracted OCR text and NLP legal entities for ${targetDoc.name}. Evidentiary classification: ${targetDoc.type}.`,
          ipAddress: '127.0.0.1',
          status: 'success',
          createdAt: new Date(uploadTime + 1000 * 60 * 12).toISOString(),
        },
        {
          _id: `log-dyn-ver-${targetDoc._id}`,
          userId: 'usr-02',
          userName: 'Dr. Neha Sharma',
          userRole: 'forensic',
          action: 'INTEGRITY_VERIFIED',
          resourceType: 'document',
          resourceId: targetDoc.documentId,
          details: `SHA-256 fingerprint matched ledger seal (${targetDoc.sha256Hash.slice(0, 16)}...). No tampering detected.`,
          ipAddress: '192.168.1.42',
          status: 'success',
          createdAt: new Date(uploadTime + 1000 * 60 * 75).toISOString(),
        },
        {
          _id: `log-dyn-vw-${targetDoc._id}`,
          userId: 'usr-03',
          userName: 'Adv. Ananya Iyer',
          userRole: 'legal',
          action: 'DOCUMENT_VIEWED',
          resourceType: 'document',
          resourceId: targetDoc.documentId,
          details: `Inspected evidentiary record ${targetDoc.documentId} for court filing preparation.`,
          ipAddress: '192.168.1.60',
          status: 'success',
          createdAt: new Date(uploadTime + 1000 * 60 * 180).toISOString(),
        },
      ];

      // Add version log if version > 1
      if (targetDoc.version && targetDoc.version > 1) {
        generated.unshift({
          _id: `log-dyn-ver2-${targetDoc._id}`,
          userId: 'usr-02',
          userName: 'Dr. Neha Sharma',
          userRole: 'forensic',
          action: 'DOCUMENT_VERSION_CREATED',
          resourceType: 'document',
          resourceId: targetDoc.documentId,
          details: `Created version ${targetDoc.version}.0 — sealed and archived with updated checksum.`,
          ipAddress: '192.168.1.42',
          status: 'success',
          createdAt: targetDoc.updatedAt || new Date(uploadTime + 1000 * 60 * 300).toISOString(),
        });
      }

      // Add to DEMO_AUDIT_LOGS so they are indexed for subsequent queries
      DEMO_AUDIT_LOGS.unshift(...generated);
      return generated;
    }
  }

  // General filtering
  if (params?.action) {
    list = list.filter((l) => l.action === params.action);
  }
  if (params?.resourceType) {
    list = list.filter((l) => l.resourceType.toLowerCase() === params.resourceType!.toLowerCase());
  }
  if (params?.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (l) =>
        l.userName.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.resourceId && l.resourceId.toLowerCase().includes(q))
    );
  }

  return list.slice(0, params?.limit || 50);
}

/**
 * Register a live audit event in memory so real-time actions (verification, download, versioning)
 * immediately appear in the document's audit trail and central audit log table.
 */
export function addDemoAuditLog(entry: {
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details: string;
  userName?: string;
  userRole?: string;
  status?: 'success' | 'failure';
  ipAddress?: string;
}): AuditLog {
  const newLog: AuditLog = {
    _id: `log-live-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: 'usr-current',
    userName: entry.userName || 'Special Agent Vikram Rao',
    userRole: entry.userRole || 'investigator',
    action: entry.action,
    resourceType: entry.resourceType,
    resourceId: entry.resourceId || '',
    details: entry.details,
    ipAddress: entry.ipAddress || '192.168.1.25 (Active Session)',
    status: entry.status || 'success',
    createdAt: new Date().toISOString(),
  };

  DEMO_AUDIT_LOGS.unshift(newLog);
  return newLog;
}
