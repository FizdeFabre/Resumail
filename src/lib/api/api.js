import { API_URL } from "@/lib/api/api"; // adapte le chemin selon ton projet

// exemple
const url = `${API_URL}/emails?user=${encodeURIComponent(user)}&maxResults=500`;
const resp = await fetch(url);