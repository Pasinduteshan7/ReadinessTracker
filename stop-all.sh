#!/bin/bash
# Complete Shutdown Script (Linux/Mac)

echo ""
echo "========================================================"
echo "  Stopping All GitHub Readiness Tracker Services"
echo "========================================================"
echo ""

PORTS=(8080 5173 5174 8000 8001)

for PORT in "${PORTS[@]}"; do
    PID=$(lsof -ti :$PORT)
    if [ -n "$PID" ]; then
        echo "  [OK] Stopping service on port $PORT (PID: $PID)..."
        kill -9 $PID 2>/dev/null
    else
        echo "  [--] No running service on port $PORT"
    fi
done

echo ""
echo "========================================================"
echo "  All services have been stopped."
echo "========================================================"
echo ""
