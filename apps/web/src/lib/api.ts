const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  // Retrieve token from localStorage if in browser
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("infrasentinel_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "API Request Failed";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    apiRequest<any>("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data: any) =>
    apiRequest<any>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => apiRequest<any>("/auth/me"),

  // Equipment
  getEquipment: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<any[]>(`/equipment/${query ? `?${query}` : ""}`);
  },
  getEquipmentById: (id: number) => apiRequest<any>(`/equipment/${id}`),
  createEquipment: (data: any) =>
    apiRequest<any>("/equipment/", { method: "POST", body: JSON.stringify(data) }),
  updateEquipment: (id: number, data: any) =>
    apiRequest<any>(`/equipment/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Telemetry
  getTelemetryHistory: (equipmentId: number, limit: number = 60) =>
    apiRequest<any[]>(`/telemetry/history/${equipmentId}?limit=${limit}`),
  getLatestTelemetry: (equipmentId: number) =>
    apiRequest<any>(`/telemetry/latest/${equipmentId}`),

  // Predictions
  getPredictionHistory: (equipmentId: number, limit: number = 30) =>
    apiRequest<any[]>(`/predictions/history/${equipmentId}?limit=${limit}`),
  getLatestPrediction: (equipmentId: number) =>
    apiRequest<any>(`/predictions/latest/${equipmentId}`),

  // Anomalies
  getAnomalyHistory: (equipmentId: number, limit: number = 50) =>
    apiRequest<any[]>(`/anomalies/history/${equipmentId}?limit=${limit}`),
  getRecentAnomalies: (limit: number = 20) =>
    apiRequest<any[]>(`/anomalies/recent?limit=${limit}`),

  // Alerts
  getAlerts: (params?: { equipment_id?: number; severity?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<any[]>(`/alerts/${query ? `?${query}` : ""}`);
  },
  acknowledgeAlert: (alertId: number) =>
    apiRequest<any>(`/alerts/${alertId}/acknowledge`, { method: "PATCH" }),
  resolveAlert: (alertId: number) =>
    apiRequest<any>(`/alerts/${alertId}/resolve`, { method: "PATCH" }),

  // Incidents
  getIncidents: (params?: { equipment_id?: number; status?: string; severity?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<any[]>(`/incidents/${query ? `?${query}` : ""}`);
  },
  createIncident: (data: any) =>
    apiRequest<any>("/incidents/", { method: "POST", body: JSON.stringify(data) }),
  updateIncident: (id: number, data: any) =>
    apiRequest<any>(`/incidents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Maintenance
  getMaintenanceRecords: (equipmentId?: number) =>
    apiRequest<any[]>(`/maintenance/records${equipmentId ? `?equipment_id=${equipmentId}` : ""}`),
  createMaintenanceRecord: (data: any) =>
    apiRequest<any>("/maintenance/records", { method: "POST", body: JSON.stringify(data) }),
  getMaintenanceRecommendations: (equipmentId: number) =>
    apiRequest<any>(`/maintenance/recommendations/${equipmentId}`),

  // Models
  getActiveModel: () => apiRequest<any>("/models/active"),
  getModelComparisons: () => apiRequest<any>("/models/comparison"),

  // Analytics
  getAnalyticsOverview: () => apiRequest<any>("/analytics/overview"),
  getFleetTrends: () => apiRequest<any>("/analytics/trends"),

  // Reports
  getReportSummary: () => apiRequest<any>("/reports/summary"),

  // Simulator
  getSimulatorStatus: () => apiRequest<any>("/simulator/status"),
  startSimulator: () => apiRequest<any>("/simulator/start", { method: "POST" }),
  pauseSimulator: () => apiRequest<any>("/simulator/pause", { method: "POST" }),
  setSimulatorScenario: (scenario: string) =>
    apiRequest<any>("/simulator/scenario", { method: "POST", body: JSON.stringify({ scenario }) }),
  setSimulatorEquipment: (equipmentId: number) =>
    apiRequest<any>(`/simulator/equipment/${equipmentId}`, { method: "POST" }),
  triggerSimulatorTick: () =>
    apiRequest<any>("/simulator/tick", { method: "POST" }),
};
