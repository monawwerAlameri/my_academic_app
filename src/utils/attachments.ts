import * as DocumentPicker from 'expo-document-picker';
import { BASE_URL } from '../services/api';

export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'mp4', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'];
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB، نفس حد الباك

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
  file?: any; 
}

export interface Attachment {
  url: string;
  name: string;
  type: 'image' | 'video' | 'file';
}

export type PickResult = { file: PickedFile } | { error: 'INVALID_FILE_TYPE' | 'FILE_TOO_LARGE' } | null;

const extensionOf = (name: string) => (name.split('.').pop() ?? '').toLowerCase();


export const pickAttachment = async (): Promise<PickResult> => {
  const res = await DocumentPicker.getDocumentAsync({ type: '*/*', multiple: false, copyToCacheDirectory: true });
  if (res.canceled || !res.assets || res.assets.length === 0) return null;
  const a: any = res.assets[0];
  if (!ALLOWED_EXTENSIONS.includes(extensionOf(a.name ?? ''))) return { error: 'INVALID_FILE_TYPE' };
  if (a.size && a.size > MAX_FILE_BYTES) return { error: 'FILE_TOO_LARGE' };
  return {
    file: { uri: a.uri, name: a.name, mimeType: a.mimeType ?? 'application/octet-stream', size: a.size, file: a.file },
  };
};


export const appendFile = (form: FormData, f: PickedFile) => {
  if (f.file) form.append('file', f.file, f.name);
  else form.append('file', { uri: f.uri, name: f.name, type: f.mimeType } as any);
};


export const toAttachment = (m: any): Attachment | undefined => {
  if (!m?.attachment_path) return undefined;
  const t = String(m.attachment_type ?? '').toLowerCase();
  return {
    url: BASE_URL + '/' + m.attachment_path,
    name: m.attachment_name ?? '',
    type: t === 'image' ? 'image' : t === 'video' ? 'video' : 'file',
  };
};