export type Obstacle = {
  id: string;
  latitude: number;
  longitude: number;
  owner: string;
  name: string;
  type: string;
  expected_duration: string;
  severity: string;
  comments: string;
  created_at: string | number;
};
