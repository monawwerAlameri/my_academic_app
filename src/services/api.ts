const BASE_URL = ''; // يتعبّى لما الباك يجهز

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const json = await res.json();
if (json.success === false) throw new Error(json.code ?? json.message ?? 'REQUEST_FAILED');
  return json as T;
}