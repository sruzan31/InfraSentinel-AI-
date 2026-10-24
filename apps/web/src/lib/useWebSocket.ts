"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "./store";

export function useWebSocket(equipmentId?: number) {
  const [isConnected, setIsConnected] = useState(false);
  const addTelemetryFrame = useAppStore((s) => s.addTelemetryFrame);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
    const endpoint = equipmentId ? `${wsUrl}/telemetry/${equipmentId}` : `${wsUrl}/telemetry`;

    function connect() {
      try {
        const ws = new WebSocket(endpoint);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          console.log("[WebSocket] Connected to telemetry stream:", endpoint);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "telemetry_update") {
              addTelemetryFrame(data);
            }
          } catch (e) {
            console.error("[WebSocket] Parse error:", e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Auto reconnect after 2.5 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 2500);
        };

        ws.onerror = (err) => {
          console.warn("[WebSocket] Error occurred, reconnecting...", err);
          ws.close();
        };
      } catch (e) {
        console.error("[WebSocket] Connection attempt failed:", e);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [equipmentId, addTelemetryFrame]);

  return { isConnected };
}
