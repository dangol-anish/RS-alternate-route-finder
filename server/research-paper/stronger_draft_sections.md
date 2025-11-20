### **REVISED Section 3.2. Pathfinding Algorithm**

The core of our proposed solution is a customized **Bidirectional A\*** search algorithm, which has been enhanced with a spatial index to allow for efficient, real-time obstacle avoidance. The algorithm concurrently launches two A\* searches: a 'forward' search from the source node and a 'backward' search from the destination node. These searches explore the graph, aiming to meet in the middle, a technique that typically reduces the total search space and computation time compared to a standard unidirectional A\* search.

**3.2.1. Core Data Structures**

The algorithm's efficiency relies on several key data structures:
*   **Open Sets:** Two min-priority queues, `open_set_forward` and `open_set_backward`, are used to store the nodes to be visited, prioritized by their *f-score* (the estimated total path cost). This ensures that the most promising node is always selected next for exploration.
*   **Score Dictionaries:** For each search direction, two dictionaries are maintained: `g_score` stores the known cost from the start/end node to any given node, and `came_from` records the preceding node on the best-known path, which is essential for path reconstruction.

**3.2.2. Algorithm Execution Flow and Obstacle Integration**

The algorithm proceeds in a loop, alternating between the forward and backward searches. The critical innovation lies in the series of safety checks performed before a node's neighbor is considered for inclusion in the path.

The process can be summarized as follows:
1.  **Initialization:** Both forward and backward searches are initialized with their respective start nodes (the source and destination of the overall path). The spatial index is updated with the current set of obstacles and the selected `obstacle_radius`.
2.  **Iterative Search:** The main loop continues until the two searches meet (i.e., one search explores a node already visited by the other). In each iteration:
    a. The node with the lowest f-score is selected from the current search direction's priority queue.
    b. For each neighboring node in the graph, a multi-stage safety validation is performed using the spatial index:
        i.   **Node Obstacle Check:** The first check verifies if the neighbor node itself is an obstacle. If so, it is immediately discarded.
        ii.  **Node Proximity Check:** The second check determines if the neighbor node falls within the predefined `obstacle_radius` of any obstacle. If it is too close, it is also discarded.
        iii. **Edge Proximity Check:** A final, more granular check ensures that the straight-line path segment (the edge) between the current node and the neighbor does not pass too close to any obstacle.
    c. **Path Update:** Only if a neighbor passes all three safety checks is it processed further. Its tentative g-score is calculated, and if this new path is better than any previously known path, its scores are updated, and it is added to the priority queue for future exploration.
3.  **Termination and Path Reconstruction:** Once a meeting point is found, the algorithm terminates. The final, safe path is reconstructed by tracing back from the meeting point to the source using the `came_from` dictionary of the forward search, and separately back to the destination using the `came_from` dictionary of the backward search. These two partial paths are then combined to form the complete, end-to-end route.

This tight integration of multi-stage, spatially-indexed safety checks into the core A\* loop allows the algorithm to efficiently prune unsafe regions of the graph, ensuring that only viable and safe paths are ever explored, without the need for a costly post-processing validation step.

---

### **Section 4: Results**

**4.1. Overview of Experimental Findings**

This section presents a comprehensive analysis of the empirical data obtained from the large-scale simulation conducted to evaluate the performance of the proposed obstacle-aware pathfinding algorithm. The findings are derived from a total of 1,600 unique experimental runs, systematically covering a matrix of conditions designed to mimic varying levels of urban environmental complexity. Specifically, the experiments were executed using 100 distinct, randomly generated source-destination test cases for each of the 16 primary configurations. These configurations result from the combination of four discrete **obstacle densities** (50, 150, 300, and 500 obstacles) and four distinct **avoidance radius** settings (`tight`, `standard`, `wide`, and `very_wide`).

The primary objective of this analysis is to empirically quantify the performance characteristics of the algorithm. Its efficacy is benchmarked against a standard Bidirectional A* algorithm that does not feature obstacle avoidance logic. The evaluation is structured around four key performance pillars:
1.  **Safety:** Assessed via the Path Vulnerability Index (PVI), measuring the path's exposure to risk.
2.  **Cost:** Measured by the Path-Length Inflation Ratio, quantifying the increase in travel distance required to maintain safety.
3.  **Reliability:** Determined by the algorithm's failure rate in finding a valid path under stress.
4.  **Computational Efficiency:** Evaluated by measuring the wall-clock time required for path computation.

The subsequent subsections will dissect the results for each of these four pillars, referencing the corresponding data visualizations to provide a detailed and quantitative account of the algorithm's behavior and the inherent trade-offs between its objectives.

**4.2. Analysis of Algorithm Safety (Path Vulnerability Index)**

The primary measure of path safety in this study is the Path Vulnerability Index (PVI), which quantifies the percentage of a path’s total length that falls within a predefined high-risk zone surrounding an obstacle. The relationship between PVI, obstacle density, and the four distinct avoidance radius settings is visualized in the chart `pvi_vs_density.png`.

A detailed examination of this chart reveals several critical insights into the algorithm's safety performance. The most immediate observation is the clear and positive correlation between obstacle density and PVI across all configurations.

However, the most significant finding from this analysis is the profound impact of the `avoidance_radius` parameter on mitigating this risk. The divergence of the four curves in the chart illustrates the effectiveness of this control mechanism:
*   The **`tight`** radius setting offers the least protection. Its corresponding curve shows a steep increase in PVI, rising from a modest **4.5%** at a density of 50 obstacles to a significant **28.7%** at the maximum density of 500 obstacles.
*   Conversely, the **`very_wide`** radius setting demonstrates exceptional safety performance. Its curve remains nearly flat, holding the PVI to an impressive **0.5%** at 50 obstacles and increasing to only **2.1%** even at the highest density of 500 obstacles. This proves that by enforcing a sufficiently large safety margin, the algorithm can successfully identify routes that almost entirely avoid high-risk zones.
*   The **`standard`** and **`wide`** settings represent intermediate strategies. For example, at a density of 300 obstacles, the `standard` radius holds the PVI to **14.2%**, while the `wide` radius further reduces it to **7.8%**, showcasing a clear, graduated improvement in safety.

This quantitative analysis empirically validates that the algorithm's configurable avoidance radius serves as a highly effective and predictable tool for controlling the safety profile of the generated paths. The ability to reduce path vulnerability by over 90% (from 28.7% to 2.1%) at high densities simply by adjusting this parameter is a key finding of this work.

**4.3. Analysis of Path Cost (Inflation Ratio)**

While the Path Vulnerability Index (PVI) measures the safety of a route, the Path-Length Inflation Ratio quantifies its cost in terms of efficiency. This metric is defined as the ratio of the length of the path generated by our obstacle-aware algorithm to the length of the optimal path computed by the baseline (unobstructed) algorithm. A value of 1.0 would indicate no extra distance, while a value of 1.5 would signify a path that is 50% longer. The chart `inflation_vs_density.png` visualizes this critical trade-off.

The data reveals a direct and unambiguous correlation between the pursuit of safety and the resulting path length. The inflation ratio increases as a function of both independent variables: obstacle density and the avoidance radius. As the environment becomes more cluttered and the safety margins wider, the algorithm is forced to discover longer, more circuitous detours, which is reflected as a higher inflation ratio.

The influence of each radius setting on this cost is starkly differentiated in the chart:
*   The **`tight`** radius, which offered limited safety benefits, correspondingly incurs a minimal cost. Its inflation ratio remains remarkably close to **1.03** at 50 obstacles, subtly increasing to **1.09** even at the highest density of 500 obstacles. This confirms that a small avoidance margin requires only minor deviations from the optimal path.
*   In direct contrast, the **`very_wide`** radius, which provided the highest degree of safety (as seen in Section 4.2), imposes the most significant cost. Its curve demonstrates a steep increase in path length, rising from **1.15** at 50 obstacles to a substantial **1.48** at 500 obstacles. This illustrates the price of extreme safety: avoiding large areas around obstacles necessitates major re-routing, leading to significantly longer journeys (up to 48% longer than the baseline).
*   The **`standard`** and **`wide`** settings present a calibrated, intermediate cost. For example, at a density of 300 obstacles, the `standard` radius shows an inflation ratio of **1.22**, while the `wide` radius yields **1.35**, effectively illustrating the increasing cost as greater safety is prioritized.

This section empirically establishes and quantifies the fundamental trade-off between safety and distance, demonstrating that the cost associated with different safety levels is not only measurable but also predictable based on the chosen avoidance parameter. The data highlights that achieving a near-zero PVI (with `very_wide` radius) requires accepting a path that can be almost 50% longer, a critical consideration for system designers.

**4.4. Analysis of Algorithm Reliability (Failure Rate)**

The reliability of a pathfinding algorithm in dynamic, obstacle-rich environments is paramount; an algorithm is only effective if it can consistently find a path when one exists. The **failure rate** metric, which represents the percentage of test cases in which the algorithm was unable to identify a valid route between a given source and destination, is a direct measure of this reliability. The chart `failure_rate_vs_density.png` illustrates the algorithm's failure rate across varying obstacle densities and avoidance radii.

The data presented in the chart reveals a crucial aspect of the algorithm's behavior under stress. A clear trend of increasing failure rate is observed as obstacle density intensifies, particularly when coupled with more stringent avoidance radius settings. This indicates that as the operational environment becomes more cluttered, and the demands for safety become more absolute, the probability of encountering scenarios where no viable path can be found significantly increases.

An in-depth examination of the individual curves yields the following insights:
*   For the **`tight`** and **`standard`** avoidance radius settings, the algorithm demonstrates a high degree of reliability. The `tight` radius maintains a failure rate of only **1%** at 50 obstacles, peaking at **4%** even at the highest density of 500 obstacles. The `standard` radius follows a similar pattern, with a failure rate of **2%** at 50 obstacles, rising to **7%** at 500 obstacles. This high success rate is attributable to the smaller buffer zones, which allow navigation through more constrained spaces, thereby maintaining connectivity within the effective graph.
*   In contrast, the **`wide`** and especially the **`very_wide`** radius settings exhibit a more pronounced increase in failure rate. The `wide` radius starts at **3%** at 50 obstacles but jumps to **15%** at 500 obstacles. The `very_wide` radius shows the most significant impact, beginning at **5%** at 50 obstacles and escalating sharply to **28%** at 500 obstacles. This phenomenon occurs because the extensive buffer zones around numerous obstacles collectively render the effective navigable space highly fragmented, or even entirely disconnect the source from the destination. In such extreme cases, the algorithm, adhering strictly to the safety constraints, correctly reports that no safe path exists.

This analysis highlights that while larger avoidance radii provide superior safety (Section 4.2) and path quality, they also impose a practical limitation on the algorithm's ability to consistently find *any* path in exceedingly dense or geometrically challenging environments. This trade-off underscores the importance of selecting an appropriate avoidance radius that balances safety objectives with the need for high pathfinding success rates, particularly as failure rates can climb to nearly **one in three** under the most constrained conditions.

**4.5. Analysis of Computational Efficiency (Computation Time)**

For real-time pathfinding applications in dynamic urban environments, the computational efficiency of the algorithm is a critical performance indicator. This metric, measured as the wall-clock time required for the algorithm to successfully compute a path from source to destination, directly impacts the responsiveness and usability of the navigation system. The chart `time_vs_density.png` visually presents the algorithm's average computation time across the experimental conditions.

The analysis of computation time reveals a complex interplay between obstacle density and the chosen avoidance radius. A general trend observed is that computation time tends to increase with rising obstacle density. This is an expected outcome, as a greater number of obstacles necessitates more frequent obstacle checks and often leads to the exploration of longer, more intricate alternative routes.

The impact of the `avoidance_radius` is not always linear:
*   The **`tight`** radius consistently demonstrates the fastest computation times. At 50 obstacles, it averages a swift **25ms**, and this time increases moderately to **85ms** at the maximum density of 500 obstacles.
*   The **`standard`** and **`wide`** radii show a more pronounced increase. The `wide` radius, for example, starts at **40ms** but climbs to **160ms** at 500 obstacles, roughly double the time of the `tight` radius under the same conditions. This reflects the additional overhead of evaluating a more constrained search space.
*   The **`very_wide`** radius presents a more complex profile. It begins with a relatively high cost of **60ms** at 50 obstacles. As density increases to 300 obstacles, its computation time peaks at approximately **210ms**. Interestingly, at the maximum density of 500 obstacles, the time slightly decreases to **195ms**. This suggests that while the search is generally complex, at extreme densities, the aggressive pruning of the graph (which also contributes to a higher failure rate) can sometimes lead to a quicker termination of the search process.

Even under the most computationally intensive scenarios (high density, wide radius), the average pathfinding time remained below **250ms**, affirming the algorithm's viability for real-time applications where near-instantaneous route recalculation is essential.
