# Configurable Obstacle Radius System

## Overview

The obstacle radius system allows configurable avoidance of areas near obstacles, providing flexible pathfinding that can avoid not just obstacle nodes but also areas within a specified distance of obstacles.

## Features

### 1. Configurable Radius

- **Default**: 0.1 km (100 meters)
- **Range**: 0.01 km to 1.0 km
- **Units**: Kilometers

### 2. Preset Options

```python
OBSTACLE_RADIUS_OPTIONS = {
    'tight': 0.05,      # 50 meters - tight avoidance
    'standard': 0.1,    # 100 meters - standard avoidance
    'wide': 0.2,        # 200 meters - wide avoidance
    'very_wide': 0.5,   # 500 meters - very wide avoidance
}
```

### 3. API Support

- **Numeric values**: Direct radius in kilometers
- **Preset names**: Use predefined options
- **Validation**: Automatic range checking

## Implementation

### 1. Spatial Index Integration

```python
class SpatialIndex:
    def __init__(self, graph, obstacle_radius=0.1):
        self.obstacle_radius = obstacle_radius  # km
        self.obstacle_coords = {}  # Store obstacle coordinates

    def is_near_obstacle(self, node_id):
        """Check if node is within obstacle radius."""
        # Calculate distance to all obstacles
        # Return True if within radius
```

### 2. Pathfinding Algorithm

```python
def bidirectional_astar(graph, source, destination, obstacles, obstacle_radius=0.1):
    # Update spatial index with obstacles
    spatial_index.update_obstacles(obstacles)
    spatial_index.set_obstacle_radius(obstacle_radius)

    # Check source/destination
    if spatial_index.is_near_obstacle(source):
        return None, []

    # Check neighbors during exploration
    for neighbor in neighbors:
        if spatial_index.is_near_obstacle(neighbor):
            continue  # Skip nodes near obstacles
```

### 3. API Endpoint

```python
@main_routes.route('/shortest_path', methods=['POST'])
def shortest_path():
    # Support both numeric and preset values
    obstacle_radius_input = data.get('obstacle_radius', 'standard')

    if isinstance(obstacle_radius_input, str):
        obstacle_radius = get_obstacle_radius_preset(obstacle_radius_input)
    else:
        obstacle_radius = validate_obstacle_radius(obstacle_radius_input)
```

## Usage Examples

### 1. Using Preset Names

```json
{
  "source": 12345,
  "destination": 67890,
  "obstacle_radius": "tight"
}
```

### 2. Using Numeric Values

```json
{
  "source": 12345,
  "destination": 67890,
  "obstacle_radius": 0.15
}
```

### 3. Default Behavior

```json
{
  "source": 12345,
  "destination": 67890
  // Uses default 0.1 km radius
}
```

## Performance Impact

### Before Obstacle Radius

- **Obstacle checking**: O(1) - only direct node avoidance
- **Pathfinding**: Very fast, minimal obstacle impact

### After Obstacle Radius

- **Obstacle checking**: O(m) where m = number of obstacles
- **Pathfinding**: Still fast, but with radius-based avoidance
- **Memory**: Additional storage for obstacle coordinates

### Performance Comparison

| Radius  | Performance Impact | Avoidance Level |
| ------- | ------------------ | --------------- |
| 0.05 km | Minimal            | Tight           |
| 0.1 km  | Low                | Standard        |
| 0.2 km  | Medium             | Wide            |
| 0.5 km  | Higher             | Very Wide       |

## Configuration

### 1. Default Settings

```python
OBSTACLE_RADIUS_DEFAULT = 0.1  # 100 meters
OBSTACLE_RADIUS_MIN = 0.01     # 10 meters
OBSTACLE_RADIUS_MAX = 1.0      # 1 kilometer
```

### 2. Customization

```python
# In config.py
OBSTACLE_RADIUS_OPTIONS = {
    'custom': 0.15,  # Add custom preset
    'ultra_tight': 0.02,  # Very tight avoidance
}
```

### 3. Runtime Configuration

```python
# Update radius at runtime
spatial_index.set_obstacle_radius(0.2)
```

## Use Cases

### 1. Urban Areas (Tight Avoidance)

- **Radius**: 0.05 km (50m)
- **Use case**: Dense city areas where roads are close together
- **Benefit**: Minimal detours while avoiding obstacles

### 2. Standard Avoidance

- **Radius**: 0.1 km (100m)
- **Use case**: General purpose, balanced approach
- **Benefit**: Good safety margin without excessive detours

### 3. Wide Avoidance

- **Radius**: 0.2 km (200m)
- **Use case**: Construction zones, major events
- **Benefit**: Generous safety margin

### 4. Very Wide Avoidance

- **Radius**: 0.5 km (500m)
- **Use case**: Emergency situations, hazardous areas
- **Benefit**: Maximum safety margin

## Testing

### 1. Unit Tests

```python
def test_obstacle_radius():
    # Test different radius values
    # Verify avoidance behavior
    # Check performance impact
```

### 2. Integration Tests

```python
def test_api_obstacle_radius():
    # Test API with different radius values
    # Verify response times
    # Check path quality
```

### 3. Performance Tests

```python
def test_radius_performance():
    # Compare performance with different radii
    # Measure memory usage
    # Test scalability
```

## Best Practices

### 1. Radius Selection

- **Start with standard** (0.1 km) for most use cases
- **Use tight** (0.05 km) for dense urban areas
- **Use wide** (0.2 km) for construction zones
- **Use very wide** (0.5 km) for emergencies

### 2. Performance Optimization

- **Cache results** for repeated queries
- **Use presets** for common scenarios
- **Monitor performance** with different radii

### 3. User Experience

- **Provide preset options** in UI
- **Allow custom values** for advanced users
- **Show radius on map** for transparency

## Future Enhancements

### 1. Dynamic Radius

- **Time-based**: Different radii for day/night
- **Weather-based**: Wider radius in bad weather
- **Event-based**: Wider radius during events

### 2. Obstacle Types

- **Different radii** for different obstacle types
- **Construction**: 0.2 km
- **Accident**: 0.1 km
- **Event**: 0.3 km

### 3. Machine Learning

- **Learn optimal radius** from user behavior
- **Adaptive radius** based on traffic patterns
- **Predictive avoidance** for recurring obstacles

## Conclusion

The configurable obstacle radius system provides:

✅ **Flexible avoidance** with multiple preset options
✅ **Performance maintained** with efficient implementation
✅ **Easy configuration** through API and config files
✅ **Scalable design** for future enhancements
✅ **User-friendly** with preset names and validation

This system balances safety, performance, and usability while maintaining the massive performance improvements from spatial indexing.
