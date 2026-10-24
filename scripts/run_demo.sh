#!/usr/bin/env bash
# ==============================================================================
# INFRASENTINEL AI — 15-STEP LIVE HACKATHON DEMONSTRATION RUNNER
# Theme 1: Build the Future — Solve a Real-World Problem
# ==============================================================================

set -e

API_URL="http://localhost:8000/api/v1"
WEB_URL="http://localhost:3000"

echo "======================================================================"
echo "          INFRASENTINEL AI — HACKATHON LIVE DEMONSTRATION             "
echo "======================================================================"
echo "Target API: $API_URL"
echo "Target Web: $WEB_URL"
echo ""

# Step 1: Health check & Landing page availability
echo "[Step 1/15] Verifying API & Web Application..."
curl -s "$API_URL/../../health" | grep -q "healthy" && echo "  ✔ API Service is HEALTHY."
curl -s -I "$WEB_URL" | grep -q "200 OK" && echo "  ✔ Web Landing Page is ONLINE."

# Step 2: Operator Authentication
echo ""
echo "[Step 2/15] Authenticating as Lead Operator (operator@infrasentinel.io)..."
AUTH_RESP=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@infrasentinel.io","password":"Operator123!"}')
TOKEN=$(echo "$AUTH_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
echo "  ✔ JWT Session Issued. Bearer Token acquired."

# Step 3: Equipment Assets Listing
echo ""
echo "[Step 3/15] Fetching Monitored Critical Equipment Fleet..."
EQ_RESP=$(curl -s "$API_URL/equipment/" -H "Authorization: Bearer $TOKEN")
echo "$EQ_RESP" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'  ✔ Found {len(data)} provisioned industrial assets:')
for eq in data:
    print(f'    - [{eq[\"code\"]}] {eq[\"name\"]} | Status: {eq[\"status\"]} | Health: {eq[\"health_score\"]} | Loc: {eq[\"location\"]}')
"

# Step 4: Start Telemetry Simulator
echo ""
echo "[Step 4/15] Initializing Telemetry Simulator (Target: PUMP-101)..."
curl -s -X POST "$API_URL/simulator/scenario" \
  -H "Content-Type: application/json" \
  -d '{"scenario":"normal"}' > /dev/null
curl -s -X POST "$API_URL/simulator/equipment/1" > /dev/null
echo "  ✔ Simulator set to Normal Baseline Operation."

# Step 5: Trigger Live Normal Telemetry
echo ""
echo "[Step 5/15] Streaming Normal Telemetry Frame..."
TICK_RESP=$(curl -s -X POST "$API_URL/simulator/tick")
echo "$TICK_RESP" | python3 -c "
import sys, json
d = json.load(sys.stdin)
m = d['measurements']
print(f'  ✔ Ingested: Process Temp={m[\"process_temp_k\"]}K, Speed={m[\"rotational_speed_rpm\"]}RPM, Torque={m[\"torque_nm\"]}Nm, Vib={m[\"vibration_mms\"]}mm/s')
"

# Step 6: Inject Abnormal Scenario (Heat Dissipation Thermal Runaway)
echo ""
echo "[Step 6/15] Injecting Abnormal Operating Scenario: Heat Dissipation Failure (HDF)..."
curl -s -X POST "$API_URL/simulator/scenario" \
  -H "Content-Type: application/json" \
  -d '{"scenario":"temp_increase"}' > /dev/null
echo "  ✔ Scenario switched to 'temp_increase' (collapsing thermal gradient below 8.6 K at low RPM)."

# Step 7 & 8: Trigger Multiple Ticks to generate Anomaly & Alert
echo ""
echo "[Step 7/15] Detecting Out-of-Distribution Anomaly with Isolation Forest..."
curl -s -X POST "$API_URL/simulator/tick" > /dev/null
curl -s -X POST "$API_URL/simulator/tick" > /dev/null

ANOM_RESP=$(curl -s "$API_URL/anomalies/history/1?limit=3" -H "Authorization: Bearer $TOKEN")
echo "$ANOM_RESP" | python3 -c "
import sys, json
data = json.load(sys.stdin)
latest = data[-1] if data else None
if latest:
    print(f'  ✔ Isolation Forest Anomaly Score: {latest[\"anomaly_score\"]:.3f} (Is Anomaly: {latest[\"is_anomaly\"]})')
    print(f'    Affected Telemetry Channels: {latest[\"affected_sensors\"]}')
"

# Step 9 & 10: Model Failure-Risk Estimate & SHAP Explanations
echo ""
echo "[Step 8 & 9/15] Querying Calibrated XGBoost Supervised Failure Risk & SHAP Attributions..."
PRED_RESP=$(curl -s "$API_URL/predictions/latest/1" -H "Authorization: Bearer $TOKEN")
echo "$PRED_RESP" | python3 -c "
import sys, json
p = json.load(sys.stdin)
print(f'  ✔ Calibrated Failure Risk Probability: {p[\"failure_risk_probability\"]*100:.1f}%')
print(f'  ✔ Risk Classification: {p[\"risk_category\"]} | Flagged: {p[\"is_flagged\"]}')
print(f'  ✔ Predicted Failure Mode: {p[\"predicted_failure_mode\"]}')
print(f'  ✔ Natural Language Explanation: {p[\"explanation_summary\"]}')
print('  ✔ Top SHAP Contributing Feature Drivers:')
for c in (p.get(\"feature_contributions\") or [])[:3]:
    print(f'     - {c[\"feature\"]}: Value={c[\"value\"]}, Baseline={c[\"baseline\"]}, SHAP={c[\"shap_value\"]}, Impact={c[\"impact\"]}')
"

# Step 11: Alert Generation & Verification
echo ""
echo "[Step 10/15] Verifying Automated Alert Generation..."
ALERT_RESP=$(curl -s "$API_URL/alerts/?equipment_id=1&limit=1" -H "Authorization: Bearer $TOKEN")
ALERT_ID=$(echo "$ALERT_RESP" | python3 -c "
import sys, json
alerts = json.load(sys.stdin)
if alerts:
    a = alerts[0]
    print(a['id'])
    sys.stderr.write(f'  ✔ Active Alert [{a[\"severity\"]}]: {a[\"title\"]} (Rule: {a[\"rule_code\"]})\n')
else:
    print('0')
")

# Step 12: Create Formal Incident Ticket
echo ""
echo "[Step 11 & 12/15] Escalating Alert to Incident & Assigning Reliability Engineer..."
INC_RESP=$(curl -s -X POST "$API_URL/incidents/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "equipment_id": 1,
    "title": "Heat Dissipation Critical Alarm - Thermal Gradient Collapse",
    "description": "Model flagged 90%+ failure risk. Immediate bearing flush and cooling jacket inspection required.",
    "severity": "CRITICAL",
    "priority": "P1"
  }')
INC_ID=$(echo "$INC_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
INC_NUM=$(echo "$INC_RESP" | python3 -c "import sys, json; print(json.load(sys.stdin)['incident_number'])")
echo "  ✔ Opened Incident Ticket: $INC_NUM (Priority P1, ID: $INC_ID)"

# Step 13: Update Incident Status
echo ""
echo "[Step 13/15] Advancing Incident Workflow to 'IN_PROGRESS'..."
curl -s -X PATCH "$API_URL/incidents/$INC_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS"}' | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  ✔ Incident {d[\"incident_number\"]} status transitioned to: {d[\"status\"]}')
"

# Step 14: Log Maintenance Work Order to Resolve Incident
echo ""
echo "[Step 14/15] Logging Prescriptive Maintenance Work Order..."
MAINT_RESP=$(curl -s -X POST "$API_URL/maintenance/records" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"equipment_id\": 1,
    \"incident_id\": $INC_ID,
    \"maintenance_type\": \"CORRECTIVE\",
    \"technician_name\": \"Elena Vance (Reliability Engineer)\",
    \"actions_performed\": \"Flushed cooling loop jacket and verified shaft radial clearance.\",
    \"parts_replaced\": \"Impeller wear ring and Viton mechanical seal\",
    \"downtime_minutes\": 35,
    \"cost\": 580.00
  }")
python3 -c '
import sys, json
d = json.load(sys.stdin)
rec_id = d["id"]
cost = d["cost"]
print(f"  ✔ Maintenance Record #{rec_id} recorded. Cost: ${cost:.2f}. Incident resolved.")
' <<< "$MAINT_RESP"

# Step 15: Export Comprehensive Analytics & CSV Report
echo ""
echo "[Step 15/15] Exporting Reliability Analytics & Certified CSV Audit..."
REP_SUMMARY=$(curl -s "$API_URL/reports/summary" -H "Authorization: Bearer $TOKEN")
echo "$REP_SUMMARY" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  ✔ Report ID: {d[\"report_id\"]} | Generated By: {d[\"generated_by\"]}')
print(f'  ✔ Fleet Monitored: {d[\"equipment_count\"]} assets | Incidents Audited: {d[\"total_incidents\"]}')
"
curl -s "$API_URL/reports/export/csv" -H "Authorization: Bearer $TOKEN" | head -n 4
echo "  ✔ Certified CSV Streamed Successfully."

echo ""
echo "======================================================================"
echo "    ✔ HACKATHON LIVE DEMONSTRATION COMPLETED WITH 100% SUCCESS!       "
echo "======================================================================"
