export type User = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  photo: string | null;
  role?: string; // 'user' or 'admin'
  reputation?: number;
};
