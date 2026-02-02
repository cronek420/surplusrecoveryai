
export type AgentRole = 'SCOUTER' | 'TRACER' | 'OUTREACH' | 'LEGAL' | 'STRATEGIST' | 'LIEN' | 'FILER' | 'ANALYST' | 'SURVEYOR' | 'CORRESPONDENT';

export type LeadStatus = 'DISCOVERED' | 'TRACED' | 'CONTACTED' | 'LEGAL_REVIEW' | 'FILED' | 'PAID';

export type VerificationStatus = 'YES' | 'NO' | 'PENDING';

export type ViewType = 'OPERATIONS' | 'INTELLIGENCE' | 'AUDIT' | 'TACTICAL_MAP';

export interface UserIdentity {
  name: string;
  phone: string;
  role: string;
  company: string;
  ceoTitle: string;
  senderEmail: string;
}

export interface Agent {
  id: AgentRole;
  name: string;
  description: string;
  status: 'IDLE' | 'WORKING' | 'SUCCESS' | 'ERROR';
  color: string;
  isAutomated?: boolean;
  lastAction?: string;
}

export interface LeadDocument {
  id: string;
  name: string;
  type: string;
  timestamp: Date;
  status: 'PARSED' | 'PENDING';
  data?: any;
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
  efficiency: number; 
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
  verified: VerificationStatus;
  socials: SocialMedia;
  amount: number;
  status: LeadStatus;
  sourceUrl: string;
  notes: string[];
  crmHistory: CRMActivity[];
  emailHistory: EmailMessage[];
  documents: LeadDocument[];
  priorityScore?: number; // 0-100
  caseNumber?: string;
  latLng?: { lat: number; lng: number };
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
