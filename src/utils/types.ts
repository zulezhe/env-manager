export interface EnvironmentVariable {
  id: string;
  name: string;
  value: string;
  type: 'user' | 'system';
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
  isValid: boolean;
}