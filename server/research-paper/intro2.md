### 1. Justifying Your Core Algorithm Choice: Bidirectional A\*

*   **What Your Paper Does:** You use Bidirectional A\* (BA\*) as the foundational algorithm for your pathfinding system.
*   **How the Literature Supports This:**
    *   **Whangbo (2007)** provides a direct precedent. This paper focuses specifically on creating a "Modified Bidirectional A\*" that guarantees optimality and improves efficiency. This legitimizes your own work of taking BA\* as a starting point for enhancement, showing it's a known area of research.
    *   **Foead et al. (2021)**, in their literature review, highlight that BA\* can perform poorly on larger grids. This is crucial for your introduction, as it allows you to state, "While Bidirectional A\* is a powerful algorithm, its effectiveness on large-scale urban graphs is limited (Foead et al., 2021), necessitating improvements for real-world application." This immediately establishes the problem you are solving.

### 2. Framing Your Main Contribution: The Configurable Obstacle Avoidance

*   **What Your Paper Does:** You introduce a hard exclusion mechanism with a configurable `avoidance_radius`.
*   **How the Literature Supports This:**
    *   This is a form of **penalty function**. **Avella et al. (2002)** provides the theoretical groundwork for using penalty functions to handle complex constraints, which is directly analogous to handling obstacles.
    *   **Hu et al. (2016)** offers a direct, concrete analogy. They convert traffic light *time* delays into an equivalent *distance* penalty to influence their A\* heuristic. This strongly supports your method of converting a physical constraint (an obstacle's location) into a spatial cost (the exclusion radius).
    *   **Wan et al. (2019)** uses a large penalty factor for blocked roads, which is very similar to your hard exclusion. This shows that your approach is aligned with current research in real-time navigation.

### 3. Validating Your Results: The Analysis of Trade-offs

*   **What Your Paper Does:** Your results section is a detailed analysis of the trade-offs between safety (PVI), efficiency (path inflation), and reliability (failure rate).
*   **How the Literature Supports This:**
    *   **Liu & Kim (2010)**, in their analysis of communication protocols, focus on the "diversity-multiplexing tradeoff (DMT)". While a different field, this provides a powerful conceptual parallel. You can argue that, just as they analyze the trade-off between reliability and data rate, your paper provides a novel analysis of the "safety-efficiency-reliability tradeoff" in urban pathfinding.
    *   **Silver (2004)** makes a crucial point that is at the heart of your findings: for complex, real-world problems, it is often better to have a "reasonable solution to an accurate model" than an "optimal solution to an inaccurate one." This perfectly frames your results. You can argue that while the absolute shortest path is "optimal" in a simple model, your algorithm provides a "reasonable" (tunable) solution for a more *accurate* model of the world that includes risk and obstacles.

### 4. Contextualizing Your Hybrid Approach (Future Work)

*   **What Your Paper Does:** Your methodology is a global planner, and in your "Future Work" section, you discuss integrating it into a system with a local, reactive layer.
*   **How the Literature Supports This:**
    *   **Zhang et al. (2025)** and **Liu et al. (2022)** both implement this exact hybrid architecture (A\* for global, DWA/APF for local). This demonstrates that your proposed future work is a well-established and logical next step in this field of research, strengthening your paper's conclusion.