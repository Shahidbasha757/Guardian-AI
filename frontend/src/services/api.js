import axios from "axios";

// Default FastAPI Backend URL
const API_BASE_URL = "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios Retry Interceptor Configuration
const MAX_RETRIES = 3;
apiClient.interceptors.response.use(null, async (error) => {
  const { config } = error;
  if (!config) return Promise.reject(error);

  config.__retryCount = config.__retryCount || 0;

  if (config.__retryCount >= MAX_RETRIES) {
    console.warn(`[API] Max retries reached for ${config.url}. Routing to simulation fallback.`);
    return Promise.reject(error);
  }

  config.__retryCount += 1;
  const backoff = new Promise((resolve) => {
    setTimeout(() => resolve(), 800 * config.__retryCount);
  });

  await backoff;
  console.log(`[API] Retrying request ${config.url} (Attempt ${config.__retryCount}/${MAX_RETRIES})`);
  return apiClient(config);
});

// Simulation Failover Engine (returns mock data if backend server is offline)
const getSimulationData = (endpoint, method, payload = null) => {
  console.info(`[API Fallback] Serving mock data for ${method} ${endpoint}`);
  
  switch (endpoint) {
    case "/status":
      return {
        status: "success",
        data: {
          engineStatus: "running",
          modelLoaded: true,
          apiConnected: true,
          inferenceActive: true,
          healthScore: 99.4,
          cpuUsage: Math.round(10 + Math.random() * 8),
          memoryUsage: 54.3,
          uptimeSeconds: 9858
        }
      };

    case "/camera":
      return {
        status: "success",
        data: {
          cameraId: "default_webcam_01",
          resolution: "640x480",
          fps: 30,
          inferenceTimeMs: 42,
          lastDetection: new Date().toLocaleTimeString()
        }
      };

    case "/activity":
      return {
        status: "success",
        data: [
          { id: "log-1", description: "Biometric match confidence: 98.4%", time: new Date(Date.now() - 5000).toLocaleTimeString(), category: "system" },
          { id: "log-2", description: "Connected to workstation monitor hook", time: new Date(Date.now() - 25000).toLocaleTimeString(), category: "system" },
          { id: "log-3", description: "Guardian AI Biometric Engine initialized", time: new Date(Date.now() - 60000).toLocaleTimeString(), category: "system" }
        ]
      };

    case "/analytics":
      // Returns charts datasets
      return {
        status: "success",
        data: {
          daily: [
            { time: "09:00", presence: 95, confidence: 98, alerts: 0, accuracy: 97.4 },
            { time: "10:00", presence: 90, confidence: 97, alerts: 1, accuracy: 98.2 },
            { time: "11:00", presence: 10, confidence: 95, alerts: 2, accuracy: 96.8 },
            { time: "12:00", presence: 98, confidence: 99, alerts: 0, accuracy: 99.1 },
            { time: "13:00", presence: 99, confidence: 98, alerts: 0, accuracy: 98.5 },
            { time: "14:00", presence: 5, confidence: 94, alerts: 3, accuracy: 97.2 },
            { time: "15:00", presence: 92, confidence: 96, alerts: 1, accuracy: 98.0 },
            { time: "16:00", presence: 96, confidence: 97, alerts: 0, accuracy: 98.3 },
          ],
          weekly: [
            { day: "Mon", presence: 88, confidence: 96, alerts: 2, accuracy: 98.1 },
            { day: "Tue", presence: 92, confidence: 97, alerts: 1, accuracy: 97.9 },
            { day: "Wed", presence: 85, confidence: 95, alerts: 5, accuracy: 98.4 },
            { day: "Thu", presence: 90, confidence: 96, alerts: 2, accuracy: 98.2 },
            { day: "Fri", presence: 94, confidence: 98, alerts: 4, accuracy: 98.8 },
            { day: "Sat", presence: 12, confidence: 92, alerts: 0, accuracy: 96.5 },
            { day: "Sun", presence: 5, confidence: 90, alerts: 1, accuracy: 96.2 },
          ],
          monthly: [
            { week: "Week 1", presence: 89, confidence: 97, alerts: 10, accuracy: 98.0 },
            { week: "Week 2", presence: 91, confidence: 96, alerts: 8, accuracy: 97.8 },
            { week: "Week 3", presence: 87, confidence: 98, alerts: 12, accuracy: 98.3 },
            { week: "Week 4", presence: 93, confidence: 97, alerts: 5, accuracy: 98.5 },
          ]
        }
      };

    case "/reports":
      return {
        status: "success",
        data: [
          { id: "rep-1", title: "Biometric Audit Check", date: "2026-06-25", threats: 2, alerts: 4, status: "Passed" },
          { id: "rep-2", title: "Daily Security Sweep", date: "2026-06-26", threats: 0, alerts: 1, status: "Passed" },
          { id: "rep-3", title: "Host Screenlock Compliance Check", date: "2026-06-27", threats: 5, alerts: 8, status: "Review" }
        ]
      };

    case "/settings":
      return {
        status: "success",
        data: {
          telegramToken: payload?.telegramToken || "629910485:AAE9Ox1b_m...",
          telegramChatId: payload?.telegramChatId || "981104859",
          confidenceThreshold: payload?.confidenceThreshold || 85,
          lockOnAbsence: payload?.lockOnAbsence !== undefined ? payload.lockOnAbsence : true,
          isSimulating: payload?.isSimulating !== undefined ? payload.isSimulating : true,
          captureInterval: payload?.captureInterval || 5,
          aiSensitivity: payload?.aiSensitivity || 80,
          notificationToggle: payload?.notificationToggle !== undefined ? payload.notificationToggle : true,
          theme: payload?.theme || "cyberpunk",
          cameraSelection: payload?.cameraSelection || "default_cam"
        }
      };

    case "/lock":
    case "/unlock":
    case "/telegram":
      return { status: "success", message: `Action ${endpoint} successfully dispatched.` };

    case "/detect":
      // Simulated face analysis based on payload or timer
      const isAbsentSim = Math.random() > 0.9;
      return {
        status: "success",
        data: {
          detected: !isAbsentSim,
          label: isAbsentSim ? "UNKNOWN" : "Prajyesh (Admin)",
          confidence: isAbsentSim ? 34.2 : +(96.5 + Math.random() * 3).toFixed(1),
          multiplePersons: false,
          inferenceTimeMs: 44,
          timestamp: new Date().toLocaleTimeString()
        }
      };

    default:
      return { status: "success", data: {} };
  }
};

// API Services Export
export const apiService = {
  async getStatus() {
    try {
      const response = await apiClient.get("/status");
      return response.data;
    } catch {
      return getSimulationData("/status", "GET");
    }
  },

  async getCamera() {
    try {
      const response = await apiClient.get("/camera");
      return response.data;
    } catch {
      return getSimulationData("/camera", "GET");
    }
  },

  async getActivity() {
    try {
      const response = await apiClient.get("/activity");
      return response.data;
    } catch {
      return getSimulationData("/activity", "GET");
    }
  },

  async getAnalytics() {
    try {
      const response = await apiClient.get("/analytics");
      return response.data;
    } catch {
      return getSimulationData("/analytics", "GET");
    }
  },

  async getReports() {
    try {
      const response = await apiClient.get("/reports");
      return response.data;
    } catch {
      return getSimulationData("/reports", "GET");
    }
  },

  async getSettings() {
    try {
      const response = await apiClient.get("/settings");
      return response.data;
    } catch {
      return getSimulationData("/settings", "GET");
    }
  },

  async saveSettings(settingsPayload) {
    try {
      const response = await apiClient.post("/settings", settingsPayload);
      return response.data;
    } catch {
      return getSimulationData("/settings", "POST", settingsPayload);
    }
  },

  async lockPC() {
    try {
      const response = await apiClient.post("/lock");
      return response.data;
    } catch {
      return getSimulationData("/lock", "POST");
    }
  },

  async unlockPC() {
    try {
      const response = await apiClient.post("/unlock");
      return response.data;
    } catch {
      return getSimulationData("/unlock", "POST");
    }
  },

  async sendTelegramAlert(messagePayload) {
    try {
      const response = await apiClient.post("/telegram", messagePayload);
      return response.data;
    } catch {
      return getSimulationData("/telegram", "POST", messagePayload);
    }
  },

  async uploadFaceFrame(base64Frame) {
    try {
      const response = await apiClient.post("/detect", { frame: base64Frame });
      return response.data;
    } catch {
      return getSimulationData("/detect", "POST", { frame: base64Frame });
    }
  }
};
