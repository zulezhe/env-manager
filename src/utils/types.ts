export interface EnvironmentVariable {
  id: string;
  name: string;
  value: string;
  type: 'user' | 'system';
  remark?: string;
  createdAt: number;
  updatedAt: number;
  isValid: boolean;
}