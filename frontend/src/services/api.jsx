const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const api = {
  // === Videos ===
  async submitVideo(youtubeUrl, analysisType = "full") {
    const res = await fetch(`${API_BASE_URL}/videos/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtube_url: youtubeUrl, analysis_type: analysisType }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getVideo(videoId) {
    const res = await fetch(`${API_BASE_URL}/videos/${videoId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getVideoByYoutubeId(youtubeId) {
    const res = await fetch(`${API_BASE_URL}/videos/youtube/${youtubeId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async listVideos(skip = 0, limit = 50, status = null) {
    let url = `${API_BASE_URL}/videos/?skip=${skip}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async deleteVideo(videoId) {
    const res = await fetch(`${API_BASE_URL}/videos/${videoId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // === Search ===
  async searchByYoutube(youtubeUrl, topK = 10, threshold = 0.5) {
    const res = await fetch(`${API_BASE_URL}/search/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtube_url: youtubeUrl, top_k: topK, threshold }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async searchByImage(imageUrl, topK = 10, threshold = 0.5) {
    const res = await fetch(`${API_BASE_URL}/search/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      { method: "POST" }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getAnalysis(analysisId) {
    const res = await fetch(`${API_BASE_URL}/analyses/${analysisId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async listAnalyses(videoId = null, status = null, skip = 0, limit = 50) {
    let url = `${API_BASE_URL}/analyses/?skip=${skip}&limit=${limit}`;
    if (videoId) url += `&video_id=${videoId}`;
    if (status) url += `&status=${status}`;
    const res = await fetch(url);
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
    const res = await fetch(`${API_BASE_URL}/index/rebuild`, { method: "POST" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async resetIndex() {
    const res = await fetch(`${API_BASE_URL}/index/reset`, { method: "POST" });
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
