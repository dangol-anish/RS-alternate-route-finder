import axios from "axios";

export const fetchShortestPath = async (
  sourceId: string,
  destinationId: string
) => {
  try {
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_IP_ADDRESS}/shortest_path`,
      { source: sourceId, destination: destinationId }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to find shortest path");
  }
};

export const updateObstacles = async (obstacles: string[]) => {
  try {
    await axios.post(`${process.env.EXPO_PUBLIC_IP_ADDRESS}/obstacles`, {
      obstacles,
    });
  } catch (error) {
    throw new Error("Failed to update obstacles");
  }
};

export const verifyObstacle = async (
  obstacle_id: string,
  user_id: string,
  action: "verify" | "dispute"
) => {
  const response = await axios.post(
    `${process.env.EXPO_PUBLIC_IP_ADDRESS}/obstacle/verify`,
    { obstacle_id, user_id, action }
  );
  return response.data;
};

export const getObstacleVerifications = async (
  obstacle_id: string,
  user_id?: string
) => {
  const url = user_id
    ? `${process.env.EXPO_PUBLIC_IP_ADDRESS}/obstacle/verifications/${obstacle_id}?user_id=${user_id}`
    : `${process.env.EXPO_PUBLIC_IP_ADDRESS}/obstacle/verifications/${obstacle_id}`;

  const response = await axios.get(url);
  return response.data;
};

export const getObstacleVerificationsBatch = async (obstacle_ids: string[]) => {
  const response = await axios.post(
    `${process.env.EXPO_PUBLIC_IP_ADDRESS}/obstacle/verifications/batch`,
    { obstacle_ids }
  );
  return response.data;
};

export const deleteObstacle = async (id: string, owner: string) => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_IP_ADDRESS}/delete_obstacle`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, owner }),
    }
  );
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to delete obstacle");
  }
  return result;
};

export const getModerationList = async (admin_id: string) => {
  const res = await fetch(
    `${process.env.EXPO_PUBLIC_IP_ADDRESS}/admin/obstacles?admin_id=${admin_id}`
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch moderation list");
  }
  return Array.isArray(data) ? data : [];
};

type AdminAction = "approve" | "remove" | "reset";

export const performAdminAction = async (
  admin_id: string,
  obstacle_id: string,
  action: AdminAction
) => {
  const res = await fetch(
    `${process.env.EXPO_PUBLIC_IP_ADDRESS}/admin/obstacle_action`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_id, obstacle_id, action }),
    }
  );
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Admin action failed");
  }
  return result;
};

export const signInUser = async (email: string, password: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_IP_ADDRESS}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Sign in failed");
  }
  return data;
};

export const signOutUser = async () => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_IP_ADDRESS}/signout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Logout failed");
  }
  return data;
};

export const fetchUserProfile = async (userId: string) => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_IP_ADDRESS}/profile/${userId}`
  );
  if (!response.ok) throw new Error("Failed to fetch user profile");
  return response.json();
};
