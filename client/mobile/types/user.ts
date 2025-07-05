export type User = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  photo: string | null;
  role?: string; // 'user' or 'admin'
  reputation?: number;
};

// Default export to satisfy Expo Router's requirement
export default User;
