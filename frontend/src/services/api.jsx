const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const getToken = () => {
  return localStorage.getItem("eyedentify_token");
};

const setToken = (token) => {
  localStorage.setItem("eyedentify_token", token);
};

const clearToken = () => {
  localStorage.removeItem("eyedentify_token");
};

const authHeaders = () => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // === Auth ===
  async register(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ detail: "Registration failed" }));
      throw new Error(data.detail || "Registration failed");
    }
    return res.json();
  },

  async verifyEmail(token) {
    const res = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({ detail: "Verification failed" }));
      throw new Error(data.detail || "Verification failed");
    }
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(data.detail || "Login failed");
    }
    const data = await res.json();
    setToken(data.access_token);
    return data;
  },

  async resendVerification(email) {
    const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ detail: "Failed to resend verification" }));
      throw new Error(data.detail || "Failed to resend verification");
    }
    return res.json();
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      clearToken();
      throw new Error("Not authenticated");
    }
    return res.json();
  },

  logout() {
    clearToken();
  },

  // === Videos ===
  async submitVideo(youtubeUrl, analysisType = "full") {
    const res = await fetch(`${API_BASE_URL}/videos/submit`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ youtube_url: youtubeUrl, analysis_type: analysisType }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getVideo(videoId) {
    const res = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getVideoByYoutubeId(youtubeId) {
    const res = await fetch(`${API_BASE_URL}/videos/youtube/${youtubeId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async listVideos(skip = 0, limit = 50, status = null) {
    let url = `${API_BASE_URL}/videos/?skip=${skip}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async deleteVideo(videoId) {
    const res = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // === Search ===
  async searchByYoutube(youtubeUrl, topK = 10, threshold = 0.5) {
    const res = await fetch(`${API_BASE_URL}/search/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ youtube_url: youtubeUrl, top_k: topK, threshold }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async searchByImage(imageUrl, topK = 10, threshold = 0.5) {
    const res = await fetch(`${API_BASE_URL}/search/image`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ youtube_url: imageUrl, top_k: topK, threshold }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getSearchStats() {
    const res = await fetch(`${API_BASE_URL}/search/stats`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // === Analyses ===
  async createAnalysis(videoId, analysisType = "full") {
    const res = await fetch(
      `${API_BASE_URL}/analyses/${videoId}?analysis_type=${analysisType}`,
      { method: "POST", headers: authHeaders() }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async unlockAnalysis(videoId, analysisType = "full") {
    const res = await fetch(
      `${API_BASE_URL}/analyses/${videoId}/unlock?analysis_type=${analysisType}`,
      { method: "POST", headers: authHeaders() }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getAnalysis(analysisId) {
    const res = await fetch(`${API_BASE_URL}/analyses/${analysisId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async listAnalyses(videoId = null, status = null, skip = 0, limit = 50) {
    let url = `${API_BASE_URL}/analyses/?skip=${skip}&limit=${limit}`;
    if (videoId) url += `&video_id=${videoId}`;
    if (status) url += `&status=${status}`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // === Index ===
  async getIndexStats() {
    const res = await fetch(`${API_BASE_URL}/index/stats`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async rebuildIndex() {
    const res = await fetch(`${API_BASE_URL}/index/rebuild`, {
      method: "POST",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async resetIndex() {
    const res = await fetch(`${API_BASE_URL}/index/reset`, {
      method: "POST",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // === Health ===
  async healthCheck() {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

export { getToken, setToken, clearToken, authHeaders };
