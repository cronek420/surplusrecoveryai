
export type AgentRole = 'SCOUTER' | 'TRACER' | 'OUTREACH' | 'LEGAL' | 'STRATEGIST' | 'LIEN' | 'FILER';

export type LeadStatus = 'DISCOVERED' | 'TRACED' | 'CONTACTED' | 'LEGAL_REVIEW' | 'FILED' | 'PAID';

export type VerificationStatus = 'YES' | 'NO' | 'PENDING';

/* Define the Agent interface used across the CRM components */
export interface Agent {
  id: AgentRole;
  name: string;
  description: string;
  status: 'IDLE' | 'WORKING' | 'SUCCESS' | 'ERROR';
  color: string;
  isAutomated?: boolean;
  lastAction?: string;
}

export interface SocialMedia {
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  other?: string;
}

export interface PlaybookEntry {
  id: string;
  method: string;
  efficiency: number; // 0-100
  reasoning: string;
  timestamp: Date;
}

export interface EmailMessage {
  id: string;
  timestamp: Date;
  subject: string;
  body: string;
  status: 'DRAFT' | 'SENT' | 'DELIVERED';
  type: 'OUTBOUND' | 'INBOUND';
}

export interface CRMActivity {
  id: string;
  agentId: AgentRole | 'USER';
  timestamp: Date;
  action: string;
  details: string;
}

export interface Lead {
  id: string;
  ownerName: string;
  email?: string;
  phone?: string;
  otherPhone?: string;
  lastKnownAddress: string;
  propertyAddress: string;
  county: string;
  state: string;
  courtCounty: string;
  dateFiled?: string;
  dateContacted?: string;
  verified: VerificationStatus;
  socials: SocialMedia;
  amount: number;
  status: LeadStatus;
  sourceUrl: string;
  notes: string[];
  crmHistory: CRMActivity[];
  emailHistory: EmailMessage[];
  wasSuccessful?: boolean;
  // Attorney Details
  attorneyName?: string;
  attorneyFirm?: string;
  attorneyEmail?: string;
  attorneyPhone?: string;
  attorneyNotes?: string;
}

export interface ActivityLog {
  id: string;
  agentId: AgentRole;
  leadId?: string;
  message: string;
  timestamp: Date;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
