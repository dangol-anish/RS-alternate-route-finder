import axios from "axios";

export const fetchShortestPath = async (
  sourceId: string,
  destinationId: string
) => {
  try {
    const response = await axios.post(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/shortest_path`,
      { source: sourceId, destination: destinationId }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to find shortest path");
  }
};

export const updateObstacles = async (obstacles: string[]) => {
  try {
    await axios.post(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/obstacles`,
      { obstacles }
    );
  } catch (error) {
    throw new Error("Failed to update obstacles");
  }
};
