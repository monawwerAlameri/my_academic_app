export const SERVER_IP = 'MY_IP';
export const BASE_URL = 'http://' + SERVER_IP + '/my_academic_app/backend';

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const json = await res.json();
if (json.success === false) throw new Error(json.code ?? json.message ?? 'REQUEST_FAILED');
  return json as T;
}

