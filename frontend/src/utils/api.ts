import { API_BASE } from '../constants';

const headers = { 'Content-Type': 'application/json' };

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const msg = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
};

export const api = {
  criarOrdem: (payload: unknown) =>
    fetch(`${API_BASE}/ordens`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).then(handleResponse),

  atualizarOrdem: (id: string, payload: unknown) =>
    fetch(`${API_BASE}/ordens/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    }).then(handleResponse),

  listarOrdens: () =>
    fetch(`${API_BASE}/ordens`).then(handleResponse),

  obterOrdem: (id: string) =>
    fetch(`${API_BASE}/ordens/${id}`).then(handleResponse),

  deletarOrdem: (id: string) =>
    fetch(`${API_BASE}/ordens/${id}`, { method: 'DELETE' }).then(handleResponse),
};
