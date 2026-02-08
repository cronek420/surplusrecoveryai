#!/usr/bin/env python3
"""
WHALE HUNT - High-Value Surplus Recovery Orchestrator
LEXICON SOLUTIONS | SURPLUS RECOVERY AI

This script automates the discovery and recovery of high-value unclaimed funds.
It coordinates Scout-Net, Shadow-Trace, and Echo-Sync to find whales and prepare them for closure.

WORKFLOW:
1. DISCOVERY: Scout high-value targets (>$40k)
2. TRACING: Use Anymailfinder + Airscale to locate owners
3. STRATEGY: Generate personalized recovery strategies
4. OUTREACH: Prepare 3-touch communication sequences

Usage:
    python whale_hunt.py --state FL --min-amount 40000 --batch-size 5
    python whale_hunt.py --query "unclaimed inheritance property tax" --min-amount 50000
"""

import os
import sys
import json
import requests
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import argparse

# Configuration from environment
GEMINI_API_KEY = os.getenv('API_KEY', '')
ANYMAILFINDER_KEY = os.getenv('ANYMAILFINDER_API_KEY', '')
AIRSCALE_KEY = os.getenv('AIRSCALE_API_KEY', '')

GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'


@dataclass
class Whale:
    """High-value lead target"""
    id: str
    owner_name: str
    amount: float
    state: str
    county: str
    property_address: str
    source_url: str
    discovered_at: str
    priority_score: int = 0
    traced_email: Optional[str] = None
    owner_phone: Optional[str] = None
    confidence: float = 0.0


def log(level: str, message: str, context: Optional[Dict] = None):
    """Structured logging"""
    timestamp = datetime.now().isoformat()
    entry = {
        'timestamp': timestamp,
        'level': level,
        'message': message
    }
    if context:
        entry.update(context)
    print(json.dumps(entry))


def discover_high_value_targets(state: str, county_or_query: str, min_amount: float = 40000) -> List[Dict]:
    """
    SCOUT-NET: Discover unclaimed surplus funds via Google Search
    Returns raw discovery data
    """
    log('INFO', 'SCOUT-NET: Initiating high-value discovery', {
        'state': state,
        'location': county_or_query,
        'min_threshold': min_amount
    })
    
    prompt = f"""
You are SCOUT-NET, an intelligence agent for Lexicon Solutions.

MISSION: Discover unclaimed surplus funds in {county_or_query}, {state}.
FILTER: Only report targets with amounts > ${min_amount:,.0f}
SOURCES: Public court dockets, foreclosure records, bankruptcy estates, unclaimed property databases

Return findings as JSON array with this schema:
[
  {{
    "owner_name": "John Doe",
    "amount": 75000,
    "case_number": "2025-12345",
    "property_address": "123 Main St, City, {state}",
    "county": "{county_or_query}",
    "source": "court docket URL",
    "discovery_type": "foreclosure|bankruptcy|unclaimed_property",
    "notes": "brief context"
  }}
]

Use YOUR BEST JUDGMENT to find real targets. Search exhaustively.
"""

    try:
        response = requests.post(
            f'{GEMINI_BASE}/gemini-3-flash-preview:generateContent?key={GEMINI_API_KEY}',
            json={
                'contents': [{'parts': [{'text': prompt}]}],
                'tools': [{'googleSearch': {}}]
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '{}')
            
            # Extract JSON from response
            try:
                start = text.find('[')
                end = text.rfind(']') + 1
                if start >= 0 and end > start:
                    discovered = json.loads(text[start:end])
                    log('SUCCESS', f'SCOUT-NET discovered {len(discovered)} whales', {'count': len(discovered)})
                    return discovered
            except json.JSONDecodeError:
                log('WARNING', 'SCOUT-NET: Could not parse JSON response', {'raw': text[:200]})
                return []
        else:
            log('ERROR', f'Gemini API error: {response.status_code}')
            return []
    except Exception as e:
        log('ERROR', f'SCOUT-NET discovery failed: {str(e)}')
        return []


def trace_owner_email(name: str, company: Optional[str] = None) -> Optional[Dict]:
    """
    SHADOW-TRACE: Discover email via Anymailfinder
    """
    if not ANYMAILFINDER_KEY:
        log('WARNING', 'ANYMAILFINDER not configured, skipping email discovery')
        return None
    
    try:
        name_parts = name.split(' ')
        first_name = name_parts[0]
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        
        params = {
            'first_name': first_name,
            'last_name': last_name
        }
        if company:
            params['company_name'] = company
        
        response = requests.get(
            'https://api.anymailfinder.com/v5/findEmail',
            params=params,
            headers={'X-API-Key': ANYMAILFINDER_KEY},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                log('SUCCESS', f'Email found: {data.get("email")}', {
                    'name': name,
                    'confidence': data.get('confidence'),
                    'deliverability': data.get('deliverability')
                })
                return data
            else:
                log('INFO', f'No email found for {name}', {'reason': data.get('reason')})
                return None
        else:
            log('WARNING', f'Anymailfinder error: {response.status_code}')
            return None
    except Exception as e:
        log('ERROR', f'Email tracing failed: {str(e)}')
        return None


def trace_property_owner(address: str, state: str) -> Optional[Dict]:
    """
    SHADOW-TRACE: Get owner contact from property via Airscale
    """
    if not AIRSCALE_KEY:
        log('WARNING', 'AIRSCALE not configured, skipping property research')
        return None
    
    try:
        response = requests.post(
            'https://api.airscale.io/v1/properties/search',
            json={
                'address': address,
                'state': state,
                'include_ownership': True,
                'include_contact': True
            },
            headers={'Authorization': f'Bearer {AIRSCALE_KEY}'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                log('SUCCESS', f'Property owner traced: {data.get("property", {}).get("owner_name")}', {
                    'address': address,
                    'confidence': data.get('confidence_score')
                })
                return data
            else:
                log('INFO', f'Property not found in Airscale: {address}')
                return None
        else:
            log('WARNING', f'Airscale error: {response.status_code}')
            return None
    except Exception as e:
        log('ERROR', f'Property trace failed: {str(e)}')
        return None


def calculate_priority_score(whale: Dict) -> int:
    """
    ANALYST: Calculate recovery priority (0-100)
    Factors: Amount, amount/case complexity, location, contact info availability
    """
    score = 0
    amount = whale.get('amount', 0)
    
    # Amount factor (max 40 points)
    if amount > 100000:
        score += 40
    elif amount > 75000:
        score += 35
    elif amount > 50000:
        score += 30
    elif amount > 40000:
        score += 25
    
    # Location factor (max 20 points) - favor populated counties
    county = whale.get('county', '').lower()
    high_value_counties = ['miami-dade', 'broward', 'hillsborough', 'orange', 'polk']
    if any(c in county for c in high_value_counties):
        score += 20
    else:
        score += 10
    
    # Type factor (max 20 points)
    disc_type = whale.get('discovery_type', '').lower()
    if 'inheritance' in disc_type or 'estate' in disc_type:
        score += 20  # Heirs often motivated
    elif 'foreclosure' in disc_type:
        score += 15
    elif 'unclaimed' in disc_type:
        score += 10
    
    # Availability factor (max 20 points)
    if whale.get('traced_email'):
        score += 15
    if whale.get('owner_phone'):
        score += 5
    
    return min(100, score)


def enrich_whale(discovery: Dict) -> Whale:
    """
    Enrich discovery with contact tracing and scoring
    """
    whale_id = f"WHALE_{datetime.now().strftime('%Y%m%d%H%M%S')}_{hash(discovery['owner_name']) % 10000}"
    
    # Attempt email discovery
    email_result = trace_owner_email(
        discovery['owner_name'],
        # Try to extract company from notes if available
    )
    
    # Attempt property owner lookup
    property_result = trace_property_owner(
        discovery['property_address'],
        discovery['state']
    )
    
    # Merge discovered contact info
    traced_email = None
    owner_phone = None
    confidence = 0.0
    
    if email_result and email_result.get('success'):
        traced_email = email_result.get('email')
        confidence += email_result.get('confidence', 0) * 0.5
    
    if property_result and property_result.get('success'):
        owner_contact = property_result.get('owner_contact', {})
        if owner_contact.get('owner_emails'):
            traced_email = traced_email or owner_contact['owner_emails'][0]
        if owner_contact.get('owner_phones'):
            owner_phone = owner_contact['owner_phones'][0]
        confidence += property_result.get('confidence_score', 0) * 0.5
    
    whale = Whale(
        id=whale_id,
        owner_name=discovery['owner_name'],
        amount=discovery['amount'],
        state=discovery['state'],
        county=discovery['county'],
        property_address=discovery['property_address'],
        source_url=discovery.get('source', ''),
        discovered_at=datetime.now().isoformat(),
        traced_email=traced_email,
        owner_phone=owner_phone,
        confidence=min(100.0, confidence)
    )
    
    whale.priority_score = calculate_priority_score(asdict(whale))
    
    log('INFO', f'Whale enriched: {whale.owner_name} (${whale.amount:,.0f})', {
        'whale_id': whale.id,
        'priority_score': whale.priority_score,
        'email_found': traced_email is not None,
        'phone_found': owner_phone is not None
    })
    
    return whale


def generate_recovery_strategy(whale: Whale) -> str:
    """
    STRATEGIST: Generate personalized recovery strategy using deep thinking
    """
    prompt = f"""
You are CORE-AI, the Master Strategist for Lexicon Solutions.

TARGET WHALE:
- Name: {whale.owner_name}
- Amount: ${whale.amount:,.0f}
- Location: {whale.county}, {whale.state}
- Property: {whale.property_address}
- Email: {whale.traced_email or 'NOT FOUND'}
- Phone: {whale.owner_phone or 'NOT FOUND'}
- Confidence: {whale.confidence:.0f}%

COMMAND: Generate a 3-stage recovery strategy:
1. IMMEDIATE OUTREACH: What's the first message (email/phone)? Tone? Key hooks?
2. ESCALATION: If no response in 72 hours, what's next?
3. LEGAL PATHWAY: What documents are needed? Which court to file?

Focus on:
- Psychological hooks (inheritance motivation, tax recovery, banking issues)
- Urgency (statute of limitations)
- Proof of ownership
- Fastest path to disbursement

Output as:
STAGE 1 (COLD OUTREACH):
[message]

STAGE 2 (ESCALATION - Day 4):
[escalation strategy]

STAGE 3 (LEGAL):
[filing strategy]
"""

    try:
        response = requests.post(
            f'{GEMINI_BASE}/gemini-3-pro-preview:generateContent?key={GEMINI_API_KEY}',
            json={
                'contents': [{'parts': [{'text': prompt}]}],
                'generationConfig': {
                    'thinkingConfig': {'thinkingBudget': 32768},
                    'temperature': 0.5
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            strategy = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            log('SUCCESS', f'Strategy generated for {whale.owner_name}', {'whale_id': whale.id})
            return strategy
        else:
            log('ERROR', f'Gemini API error: {response.status_code}')
            return ''
    except Exception as e:
        log('ERROR', f'Strategy generation failed: {str(e)}')
        return ''


def main():
    parser = argparse.ArgumentParser(description='LEXICON WHALE HUNT - High-Value Recovery')
    parser.add_argument('--state', default='FL', help='State to search (default: FL)')
    parser.add_argument('--county', default='Miami-Dade', help='County (or custom query)')
    parser.add_argument('--min-amount', type=float, default=40000, help='Minimum whale value')
    parser.add_argument('--batch-size', type=int, default=5, help='Max whales to process')
    
    args = parser.parse_args()
    
    log('INFO', '🛰️ LEXICON SOLUTIONS - WHALE HUNT INITIATED', {
        'state': args.state,
        'location': args.county,
        'min_amount': args.min_amount,
        'batch_size': args.batch_size
    })
    
    # PHASE 1: DISCOVERY
    log('INFO', '📍 PHASE 1: DISCOVERY - Scout-Net activated')
    discoveries = discover_high_value_targets(args.state, args.county, args.min_amount)
    
    if not discoveries:
        log('WARNING', 'No whales discovered in this location')
        return
    
    # PHASE 2: ENRICHMENT & TRACING
    log('INFO', '👤 PHASE 2: ENRICHMENT - Shadow-Trace activated')
    whales: List[Whale] = []
    for discovery in discoveries[:args.batch_size]:
        whale = enrich_whale(discovery)
        whales.append(whale)
    
    # Sort by priority
    whales.sort(key=lambda w: w.priority_score, reverse=True)
    
    # PHASE 3: STRATEGY GENERATION
    log('INFO', '⚖️ PHASE 3: STRATEGY - Core-AI analyzing targets')
    
    output = {
        'hunt_time': datetime.now().isoformat(),
        'discovery_location': f'{args.county}, {args.state}',
        'whales_found': len(whales),
        'total_capital': sum(w.amount for w in whales),
        'targets': []
    }
    
    for whale in whales[:3]:  # Top 3 whales
        strategy = generate_recovery_strategy(whale)
        
        whale_record = {
            'whale_id': whale.id,
            'owner': whale.owner_name,
            'amount': whale.amount,
            'priority_score': whale.priority_score,
            'email': whale.traced_email,
            'phone': whale.owner_phone,
            'confidence': whale.confidence,
            'strategy': strategy
        }
        output['targets'].append(whale_record)
        
        log('INFO', f'⚡ Whale ready for closure: {whale.owner_name} (${whale.amount:,.0f})', {
            'priority': whale.priority_score,
            'whale_id': whale.id
        })
    
    # OUTPUT RESULTS
    print("\n" + "="*80)
    print(json.dumps(output, indent=2))
    print("="*80)
    
    log('SUCCESS', '🎯 WHALE HUNT COMPLETE - Ready for Echo-Sync outreach', {
        'whales_identified': len(whales),
        'top_targets': min(3, len(whales)),
        'total_recoverable': sum(w.amount for w in whales)
    })


if __name__ == '__main__':
    main()
