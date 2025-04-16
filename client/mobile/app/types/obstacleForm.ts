export interface ObstacleFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    type: string;
    expected_duration: string;
    severity: string;
    comments?: string;
  }) => void;
}
