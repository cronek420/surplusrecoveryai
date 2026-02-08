# 👁️ ALL-SEEING EYE - Master Control Dashboard

**Status**: ✅ Production Ready  
**Location**: Left sidebar → "👁️ All-Seeing Eye" button  
**Purpose**: Complete real-time visibility into swarm operations  

---

## OVERVIEW

The **Master Control** dashboard gives you **complete transparency** into your recovery swarm's operations. Watch every agent work in real-time, drill down into individual agents, access all living documents, and stop operations instantly.

It's your command center. Everything the swarm does is visible here.

---

## DASHBOARD STRUCTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                      ALL-SEEING EYE (Master Control)            │
├──────────────────┬──────────────────────────┬──────────────────┤
│   LEFT PANEL     │    CENTER PANEL          │  RIGHT PANEL     │
│                  │                          │                  │
│  👁️ Swarm       │ 🎯 Agent Details        │ 📊 Activity Stream│
│    Control       │ (When clicked)          │                  │
│                  │                          │                  │
│  • Agent List    │ • Agent stats           │ • Real-time log  │
│  • Metrics       │ • Recent actions        │ • Filter events  │
│  • Pipeline      │ • Error tracking        │ • Drill-down     │
│                  │                          │                  │
└──────────────────┴──────────────────────────┴──────────────────┘
```

---

## LEFT PANEL: SWARM CONTROL CENTER

### Status Indicator
```
🔴 SWARM ACTIVE    = Agents are working (auto-scout running)
⚪ IDLE            = All agents dormant
```

### Emergency Stop Button
```
🛑 STOP ALL
```
Instantly halts:
- Auto-discovery (auto-scout stops)
- All active operations (agents go IDLE)
- Whale hunts (pauses execution)
- API calls (graceful timeout)

**Use Case**: Tom says "something's wrong, stop everything" → One click.

### Real-Time Metrics
```
Total Capital        = $X.XM (sum of all lead amounts)
Active Leads         = N (total leads in swarm)
Swarm Efficiency     = X% (leads paid / total leads)
```

### Agent List (Clickable)
Each agent card shows:
- **Agent Name** (e.g., "Scout-Net", "Shadow-Trace")
- **Status**: IDLE | WORKING | SUCCESS | ERROR
- **Action Count**: How many actions taken total
- **Last Action**: Most recent action description

**Click an agent → See detailed activity in center panel**

### Pipeline Status
```
DISCOVERED    = N leads
TRACED        = N leads
CONTACTED     = N leads
LEGAL_REVIEW  = N leads
FILED         = N leads
PAID          = N leads
```

---

## CENTER PANEL: AGENT DEEP DIVE

**Shows when you click an agent on the left**

### Agent Header
```
[Color]  AGENT NAME
         description
         
         STATUS (IDLE | WORKING | SUCCESS | ERROR)
```

### Agent Stats
```
Total Actions: 47
INFO     = 23 (blue)
SUCCESS  = 20 (green)
ERROR    = 4 (red)
```

### Recent Actions (Last 20)
```
✅  [09:15:23] Email found: john@company.com
ℹ️  [09:15:20] Searching for John Smith
⚠️  [09:15:18] High confidence required
❌  [09:15:10] API rate limit warning
```

**Click an action → See full details including lead IDs**

---

## RIGHT PANEL: REAL-TIME ACTIVITY STREAM

### Live Event Feed
Shows **every** swarm action as it happens, in chronological order:

```
Event Type    Timestamp      Agent        Message
─────────────────────────────────────────────────────
✅ SUCCESS    09:15:23       SCOUTER      Discovered John Smith, $85,000
ℹ️ INFO       09:15:20       SHADOW-TRACE Skip-tracing John Smith
⚠️ WARNING    09:15:18       ANALYST      High lead amount detected
❌ ERROR      09:15:10       AIRSCALE     API rate limit warning
```

### Filter Controls

**Event Type Dropdown**:
```
All Events     (show everything)
Info Only      (ℹ️ blue messages)
Success Only   (✅ green messages)
Warnings       (⚠️ yellow messages)
Errors         (❌ red messages)
```

**Auto-Scroll Toggle**:
```
☑️ Auto-scroll (enabled)
   New events auto-scroll into view
   
☐ Auto-scroll (disabled)
   Scroll manually to view history
```

**Event Count**:
```
12 / 247 events
(showing filtered count / total)
```

### Bottom Stats Bar
```
Working     = 2 agents currently active
Success     = 45 successful actions
Warnings    = 8 warnings issued
Errors      = 3 errors encountered
```

---

## COMMON WORKFLOWS

### Workflow 1: Monitor Discovery Operation

1. Click **👁️ All-Seeing Eye** in sidebar
2. Watch LEFT panel:
   - See SCOUT-NET status change to "WORKING" (yellow)
   - See "Active Leads" counter increment
3. Click middle button to expand SCOUT-NET:
   - Watch "Total Actions" increment in real-time
   - See each discovery in "Recent Actions"
4. Check RIGHT panel:
   - Watch activity stream as discoveries flow in
   - See "Success" counter increment with green ✅ messages
5. Monitor PIPELINE on left:
   - "DISCOVERED" count goes up as discovery completes

---

### Workflow 2: Debug a Failed Lead

1. RIGHT panel shows red ❌ error
2. Click error message to see full details + lead ID
3. LEFT panel, scroll to and click problematic agent (e.g., TRACER)
4. CENTER panel shows all actions that agent took
5. Look at "Recent Actions" to find where it failed
6. Example:
   ```
   ❌ Could not find email for John Smith
   ✅ Found property address: 123 Main St
   ⚠️ Confidence score below threshold (45%)
   ℹ️ Airscale lookup returned incomplete data
   ```
7. Fix known issue → Re-run operation → Watch it succeed in dashboard

---

### Workflow 3: Stop Everything NOW

Scenario: Mistakenly launched 100 whale hunts.

1. See SWARM STATUS: 🔴 ACTIVE (red, pulsing)
2. LEFT panel, top-right corner: Click **🛑 STOP ALL**
   - All agents immediately go IDLE
   - Auto-scout halts
   - In-flight API calls timeout gracefully
3. RIGHT panel shows immediate stop messages
4. Whew.

---

### Workflow 4: Check Swarm Performance

1. **👁️ All-Seeing Eye** → View LEFT panel metrics:
   ```
   Total Capital = $2.3M
   Active Leads = 47
   Swarm Efficiency = 12% (6 paid / 47 total)
   ```

2. Click each agent to see action counts:
   - Scout-Net: 237 actions
   - Shadow-Trace: 156 actions
   - Echo-Sync: 89 actions

3. RIGHT panel filter to "Success Only":
   - Count total ✅ messages
   - Calculate success rate = 45 successes / 5 hours = 9/hour

4. Drill down to agents with low action counts
   - Example: Veri-File only 3 actions
   - Why? → Click Veri-File → See it's IDLE (waiting for filed leads)

---

## ADVANCED FEATURES

### Auto-Scroll Lock
```
While scrolling through old messages:
☐ Auto-scroll is OFF (manual control)
   New events don't interrupt reading

When done reviewing:
☑️ Re-enable Auto-scroll
   Back to live feed
```

### Filter Combinations
```
Agent: SHADOW-TRACE (left panel click)
Event Type: ERROR (right panel dropdown)
Result: Shows only errors from this agent
= Quick root cause analysis
```

### Living Documents Access
Every log entry can show:
- **Lead ID**: Click → Opens full lead dossier
- **Strategy**: Shows AI-generated recovery plan
- **Entity context**: Who/what operation triggered the action

---

## DASHBOARD METRICS EXPLAINED

### Total Capital
= SUM of all lead.amount values  
Updates: Every new discovery, every lead amount change  
Useful: See total recoverable capital in real-time

### Active Leads
= Count of leads with status != 'PAID'  
Updates: Every lead status change  
Useful: See how many opportunities in pipeline

### Swarm Efficiency
= (Leads with status = 'PAID') / (Total leads) × 100%  
Updates: Every lead status change  
Useful: Track conversion rate → know if swarm is working

### Agents Working vs Idle
LEFT panel shows each agent's current status:
- 🟡 WORKING = actively processing
- ⚪ IDLE = waiting for work
- 🟢 SUCCESS = just completed action
- 🔴 ERROR = encountered problem

### Action Count per Agent
How many total actions each agent has performed  
Example:
- SCOUTER: 1,247 actions (lots of discoveries)
- TRACER: 892 actions (skip-tracing all those discoveries)
- Veri-File: 34 actions (only a few leads ready for filing)

---

## LOGS & TELEMETRY

### What Gets Logged?

Every action the swarm takes:
- ✅ Discovery complete
- ✅ Email found
- ✅ Lead advanced
- ⚠️ API rate limit hit
- ⚠️ Duplicate detected
- ❌ Email not found
- ❌ API error
- ❌ Quota exceeded

### Log Retention
- In-memory: Last 500 events (session lifetime)
- Persistent: Saved to localStorage (24 hours)
- Export: Copy/paste from RIGHT panel to text file

### Exporting Activity
1. Select all in RIGHT panel (Ctrl+A)
2. Copy (Ctrl+C)
3. Paste into .txt or .csv
4. Share with team for audit trail

---

## KEYBOARD SHORTCUTS

| Shortcut | Action |
|----------|--------|
| Esc | Collapse agent details (CENTER panel) |
| Ctrl+S | Stop all (same as 🛑 button) |
| Ctrl+F | Filter in RIGHT panel |

---

## TROUBLESHOOTING DASHBOARD

### "No events showing"
- Check: Is swarm running? (Should see 🔴 ACTIVE)
- Check: Is auto-scroll enabled? (Might be viewing old events)
- Action: Click 🛑 STOP ALL then start new operation

### "Agent shows ERROR but I don't see what failed"
- Click ERROR event in RIGHT panel
- CENTER panel expands with full details
- Look at timestamp + lead ID to correlate
- Check agent's recent actions for context

### "Dashboard is frozen / not updating"
- Reload page (Ctrl+R)
- Check browser console (F12) for errors
- Restart npm server: `npm run dev`

### "Too many events, can't find what I need"
- RIGHT panel: Use Event Type filter
- LEFT panel: Click/expand specific agent
- Combination: Filter by agent + event type = needle in haystack

---

## COMMAND CENTER ETIQUETTE

### For Tom (Master Controller)

When monitoring the swarm:

1. **Green lights = Good**
   - ✅ SUCCESS messages
   - 🟢 Agents completing work
   - 📈 Capital metric increasing

2. **Yellow = Caution**
   - ⚠️ Rate limits hit (normal, recovers)
   - 🟡 Agent WORKING too long (might investigate)
   - ⚠️ Confidence scores low (might reprocess)

3. **Red = Action Required**
   - ❌ ERROR messages
   - 🔴 SWARM ACTIVE but no progress
   - ❌ API authentication failure
   - **Action**: Click 🛑 STOP ALL, review, fix, restart

---

## PERFORMANCE NOTES

- Dashboard updates every **100ms** (real-time feel, not laggy)
- Scrolls smoothly up to **1000 events** on-screen
- Expandable agent details load instantly
- 3-panel layout optimized for widescreen (1920x1200+)

For smaller screens: LEFT + RIGHT panels, CENTER expands on hover.

---

## NEXT UPDATES (Proposed)

Planned enhancements:
- [ ] Export activity log to JSON
- [ ] Agent timeline visualization (Gantt chart)
- [ ] Swarm health score (0-100)
- [ ] Slack/email alerts on ERROR
- [ ] Historical graphs (24-hour, 7-day performance)
- [ ] Custom metric definitions

---

## SUMMARY

**👁️ All-Seeing Eye** is your **command center**. You see:
- ✅ Every action the swarm takes
- ✅ Real-time agent status
- ✅ Live metrics (capital, efficiency, leads)
- ✅ Activity history (filterable by type/agent)
- ✅ Emergency stop button
- ✅ Full context for every operation

**Click. Watch. Understand. Control.**

That's the all-seeing eye.

---

**Master Control Dashboard Active ✨**
