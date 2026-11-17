export const BASE_URL = 'https://peachpuff-toad-484133.hostingersite.com/backend'

export class ApiError extends Error {
  code: string;
  data?: any;
  constructor(code: string, data?: any) {
    super(code);
    this.code = code;
    this.data = data;
  }
}

// يقرأ رد السيرفر ويحوّله لـ JSON، ويرمي خطأ بكود الباك إذا success = false
const readResponse = async <T>(res: Response): Promise<T> => {
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new ApiError(res.ok ? 'SERVER_ERROR' : 'HTTP_' + res.status);
  }

  if (json.success === false) {
    throw new ApiError(json.code ?? json.message ?? 'REQUEST_FAILED', json.data);
  }
  return json as T;
};

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  });
  return readResponse<T>(res);
}

// إرسال ملف (form-data). ما نحط Content-Type بأنفسنا عشان الجوال يحطه مع الـ boundary
export async function upload<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(BASE_URL + path, { method: 'POST', body: form });
  return readResponse<T>(res);
}