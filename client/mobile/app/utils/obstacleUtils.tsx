import { MaterialIcons, FontAwesome, FontAwesome6 } from "@expo/vector-icons";

// Helper function to get the obstacle icon based on its type
export const getObstacleIcon = (type: string) => {
  switch (type) {
    case "pothole":
      return (
        <FontAwesome6 name="road-circle-exclamation" size={24} color="black" />
      );
    case "Roadblock":
      return require("@/assets/images/obstacle-types/road_block_white.png");
    case "Accident":
      return require("@/assets/images/obstacle-types/car_accident_white.png");
    case "Construction":
      return require("@/assets/images/obstacle-types/construction_white.png");
    case "Debris":
      return require("@/assets/images/obstacle-types/debris_white.png");
    case "Flooding":
      return require("@/assets/images/obstacle-types/flood_white.png");
    case "Traffic Jam":
      return require("@/assets/images/obstacle-types/traffic_jam_white.png");
    case "Protest":
      return require("@/assets/images/obstacle-types/protest_white.png");
    default:
      return require("@/assets/images/obstacle-types/block_white.png");
  }
};

// Helper function to get the color based on the obstacle severity
export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Low":
      return "yellow";
    case "Moderate":
      return "orange";
    case "High":
      return "darkred";
    case "Critical":
      return "red";
    default:
      return "gray";
  }
};
