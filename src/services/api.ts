

// اكتبي هنا IP جهازك اللي يشتغل عليه XAMPP (من أمر ipconfig) ولا ترفعيه على GitHub
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
  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  });

    const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ApiError(res.ok ? 'SERVER_ERROR' : `HTTP_${res.status}`);
  }
  
  if (json.success === false) {
    throw new ApiError(json.code ?? json.message ?? 'REQUEST_FAILED', json.data);
  }
  return json as T;
}