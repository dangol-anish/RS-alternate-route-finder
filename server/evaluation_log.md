# Evaluation Process Log

## Phase 1: Finalize Experimental Design

### Step 1.1: Define the Baseline Algorithm

**Decision:** The baseline algorithm for comparison will be a modified version of the existing `bidirectional_astar` function. This modified version will be implemented *within the testing script* (`run_experiments.py`) and will have its obstacle-checking logic (`is_obstacle`, `is_near_obstacle`, `is_edge_near_obstacle`) explicitly disabled.

**Rationale:** This approach ensures a direct, "apples-to-apples" comparison, isolating the impact of the obstacle avoidance mechanism. It also guarantees that the original project code (`pathfinding.py`) remains entirely untouched.

---
### Step 1.2: Define Independent Variables

**Decision:** The experiments will systematically vary two independent variables:

1.  **Obstacle Density (Number of Obstacles):**
    *   Low: 50 obstacles
    *   Medium: 150 obstacles
    *   High: 300 obstacles
    *   Very High (Stress Test): 500 obstacles

2.  **Obstacle Radius Settings:**
    *   'tight'
    *   'standard'
    *   'wide'
    *   'very_wide'

**Rationale:** These ranges will allow for comprehensive analysis of the algorithm's performance, safety, and efficiency across different levels of environmental complexity and user-defined safety preferences.

---
### Step 1.3: Confirm Evaluation Metrics

**Decision:** The following four primary metrics will be used to evaluate the algorithm's performance, safety, and efficiency:

1.  **Path Vulnerability Index (PVI):** Quantifies the percentage of a path's length that is within a predefined vulnerability zone near obstacles.
2.  **Path-Length Inflation Ratio:** Measures how much longer the algorithm's path is compared to the absolute shortest path (without obstacle avoidance).
3.  **Search Space Reduction (SSR):** Calculates the percentage reduction in the number of nodes expanded by the algorithm compared to the baseline.
4.  **Stress-Test Failure Rate:** Determines the percentage of failed pathfinding queries under increasing obstacle densities.

**Rationale:** These metrics are chosen for their ability to objectively quantify the algorithm's core contributions, including enhanced safety, computational efficiency, and robustness, providing strong evidence for the research paper.

---
