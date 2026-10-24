import { create } from "zustand";

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export interface LiveTelemetryFrame {
  timestamp: string;
  equipment_id: number;
  equipment_code: string;
  equipment_name: string;
  equipment_status: string;
  health_score: number;
  measurements: {
    air_temp_k: number;
    process_temp_k: number;
    temp_diff_k: number;
    rotational_speed_rpm: number;
    torque_nm: number;
    tool_wear_min: number;
    vibration_mms: number;
    pressure_bar: number;
  };
  ai_prediction: {
    failure_risk_probability: number;
    risk_category: string;
    predicted_failure_mode: string;
    is_flagged: boolean;
    top_drivers: any[];
    explanation?: string;
  };
  anomaly_detection: {
    anomaly_score: number;
    is_anomaly: boolean;
    affected_sensors: string;
  };
  alert?: {
    id: number;
    severity: string;
    title: string;
    message: string;
  };
}

interface AppState {
  // Auth
  user: UserProfile | null;
  token: string | null;
  setUser: (user: UserProfile | null, token: string | null) => void;
  logout: () => void;

  // Selected Equipment
  selectedEquipmentId: number;
  setSelectedEquipmentId: (id: number) => void;

  // Live Telemetry Buffer (for real-time streaming charts)
  telemetryStream: LiveTelemetryFrame[];
  latestFrame: LiveTelemetryFrame | null;
  addTelemetryFrame: (frame: LiveTelemetryFrame) => void;

  // Simulator Control State
  isSimulatorRunning: boolean;
  simulatorScenario: string;
  setSimulatorRunning: (running: boolean) => void;
  setSimulatorScenario: (scenario: string) => void;

  // Global Alerts feed
  activeAlertsCount: number;
  setActiveAlertsCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: typeof window !== "undefined" && localStorage.getItem("infrasentinel_user")
    ? JSON.parse(localStorage.getItem("infrasentinel_user")!)
    : {
        id: 1,
        email: "operator@infrasentinel.io",
        full_name: "Alex Mercer (Lead Operator)",
        role: "operator",
      },
  token: typeof window !== "undefined" ? localStorage.getItem("infrasentinel_token") : null,
  setUser: (user, token) => {
    if (typeof window !== "undefined") {
      if (user && token) {
        localStorage.setItem("infrasentinel_user", JSON.stringify(user));
        localStorage.setItem("infrasentinel_token", token);
      } else {
        localStorage.removeItem("infrasentinel_user");
        localStorage.removeItem("infrasentinel_token");
      }
    }
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("infrasentinel_user");
      localStorage.removeItem("infrasentinel_token");
    }
    set({ user: null, token: null });
  },

  selectedEquipmentId: 1,
  setSelectedEquipmentId: (id) => set({ selectedEquipmentId: id }),

  telemetryStream: [],
  latestFrame: null,
  addTelemetryFrame: (frame) =>
    set((state) => {
      const updated = [...state.telemetryStream, frame].slice(-60); // keep last 60 readings
      return {
        telemetryStream: updated,
        latestFrame: frame,
      };
    }),

  isSimulatorRunning: false,
  simulatorScenario: "normal",
  setSimulatorRunning: (running) => set({ isSimulatorRunning: running }),
  setSimulatorScenario: (scenario) => set({ simulatorScenario: scenario }),

  activeAlertsCount: 0,
  setActiveAlertsCount: (count) => set({ activeAlertsCount: count }),
}));
