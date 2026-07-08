// One place that knows how to talk to the API. Every request goes through
// here, which is where we attach the login token and handle errors.
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export const api = {
  register: (email, password) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => request("/api/auth/me"),
  sample: () => request("/api/sample"),
  listSets: (queryString) => request(`/api/sets${queryString ? `?${queryString}` : ""}`),
  addSet: (set) => request("/api/sets", { method: "POST", body: JSON.stringify(set) }),
  updateSet: (id, set) => request(`/api/sets/${id}`, { method: "PUT", body: JSON.stringify(set) }),
  deleteSet: (id) => request(`/api/sets/${id}`, { method: "DELETE" }),
  suggest: (mode) => request("/api/ai/suggest", { method: "POST", body: JSON.stringify({ mode }) }),
};
