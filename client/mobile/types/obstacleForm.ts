export interface ObstacleFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    type: string;
    expected_duration: string;
    severity: string;
    comments?: string;
    image?: string | null;
  }) => void;
}

// Default export to satisfy Expo Router's requirement
export default ObstacleFormProps;
