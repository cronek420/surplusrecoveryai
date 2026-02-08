
export type AgentRole = 'SCOUTER' | 'TRACER' | 'OUTREACH' | 'LEGAL' | 'STRATEGIST' | 'LIEN' | 'FILER' | 'ANALYST' | 'SURVEYOR' | 'CORRESPONDENT';

export type LeadStatus = 'DISCOVERED' | 'TRACED' | 'CONTACTED' | 'LEGAL_REVIEW' | 'FILED' | 'PAID';

export type VerificationStatus = 'YES' | 'NO' | 'PENDING';

export type ViewType = 'OPERATIONS' | 'INTELLIGENCE' | 'AUDIT' | 'TACTICAL_MAP' | 'MASTER_CONTROL';

export interface UserIdentity {
  name: string;
  phone: string;
  role: string;
  company: string;
  ceoTitle: string;
  senderEmail: string;
}

/**
 * ANYMAILFINDER API TYPES
 */
export interface AnymailfinderEmailResult {
  success: boolean;
  email?: string;
  confidence?: number;
  deliverability?: string;
  sources?: string[];
  reason?: string;
}

export interface AnymailfinderVerifyResult {
  valid: boolean | null;
  smtp_status?: string;
  confidence?: number;
  reason?: string;
}

/**
 * AIRSCALE API TYPES
 */
export interface AirscalePropertyData {
  success: boolean;
  property?: {
    id: string;
    address: string;
    state: string;
    county: string;
    latitude: number;
    longitude: number;
  };
  ownership?: {
    owner_name: string;
    ownership_type: string;
    ownership_percentage: number;
  };
  tax_info?: {
    assessed_value: number;
    annual_tax: number;
    tax_year: number;
  };
  valuation?: {
    estimated_value: number;
    valuation_date: string;
    confidence_score: number;
  };
  liens?: Array<{
    lien_type: string;
    lien_amount: number;
    lien_date: string;
  }>;
  market_comparables?: Array<{
    address: string;
    sale_price: number;
    sale_date: string;
  }>;
  reason?: string;
}

export interface AirscaleOwnerContact {
  success: boolean;
  owner_name?: string;
  owner_emails?: string[];
  owner_phones?: string[];
  mailing_address?: string;
  confidence_score?: number;
  reason?: string;
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
