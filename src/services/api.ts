export const SERVER_IP = 'MY_IP';
export const BASE_URL = 'http://' + SERVER_IP + '/my_academic_app/backend';
      export class ApiError extends Error {
  code: string;
  data?: any;
  constructor(code: string, data?: any) {
    super(code);
    this.code = code;
    this.data = data;
  }
}
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const json = await res.json();
if (json.success === false) throw new ApiError(json.code ?? json.message ?? 'REQUEST_FAILED', json.data);
  return json as T;
}

