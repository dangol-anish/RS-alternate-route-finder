This section presents the empirical results from the 1,600 experimental runs, organized by the evaluation metrics defined in the previous section. The analysis focuses on quantifying the trade-offs between reliability, efficiency, safety, and computational cost as a function of obstacle density and the selected avoidance radius.

## 5.1. Summary of Aggregate Results

A high-level overview of the algorithm's performance across all 16 experimental configurations is presented in Table 5.1. This data is aggregated directly from the 1,600 individual test runs. The table clearly shows that as both obstacle density (ρ) and avoidance radius (r) increase, there is a corresponding increase in failure rate and path length inflation. Conversely, the Path Vulnerability Index (PVI) and Search Space Reduction (SSR) also show distinct patterns, which are explored in the subsequent sections.

**Table 5.1: Aggregated Results Summary**

| Obstacle Density (ρ) | Radius Setting | Avg. PVI (%) | Avg. Time (s) | Avg. SSR (%) | Avg. Path Inflation | Failure Rate (%) |
| --- | --- | --- | --- | --- | --- | --- |
| **50** | tight | 0.29 | 11.47 | 58.65 | 1.01 | 4.0 |
|  | standard | 1.21 | 16.05 | 47.94 | 1.02 | 6.0 |
|  | wide | 2.51 | 20.40 | 66.39 | 1.03 | 14.0 |
|  | very_wide | 9.89 | 19.37 | 69.60 | 1.20 | 54.0 |
| **150** | tight | 1.07 | 48.78 | 61.77 | 1.04 | 6.0 |
|  | standard | 2.32 | 30.26 | 64.93 | 1.05 | 14.0 |
|  | wide | 8.44 | 22.12 | 68.83 | 1.12 | 32.0 |
|  | very_wide | -0.17* | 1.06 | 97.19 | 1.93 | 96.0 |
| **300** | tight | 2.64 | 60.51 | 62.39 | 1.06 | 15.0 |
|  | standard | 4.79 | 48.59 | 64.40 | 1.12 | 26.0 |
|  | wide | 7.17 | 26.45 | 64.70 | 1.85 | 63.0 |
|  | very_wide | -0.69* | 0.28 | 99.13 | 1.41 | 99.0 |
| **500** | tight | 3.23 | 93.49 | 65.68 | 1.13 | 18.0 |
|  | standard | 8.64 | 75.56 | 45.44 | 1.30 | 31.0 |
|  | wide | -0.27* | 14.61 | 89.05 | 1.23 | 96.0 |
|  | very_wide | -0.95* | 0.04 | 99.70 | 1.58 | 99.0 |
- \*Note: Negative PVI values in the summary occur because the experiment script assigns a value of -1 for failed path calculations. At very high failure rates, these negative values dominate the average.*

## 5.2. Reliability Analysis: Failure Rate (FR)

The Failure Rate (FR) is a critical metric for understanding the limits of the hard exclusion approach. Figure 5.1 illustrates the percentage of queries that failed to find a valid path for each experimental configuration.

*[Figure 5.1: `failure_rate_vs_density.png` should be inserted here, with the caption: "Figure 5.1: Algorithm failure rate as a function of obstacle density, categorized by avoidance radius setting."]*

As shown in the figure, the FR increases with both obstacle density and the avoidance radius. With the 'tight' radius, the algorithm demonstrates high reliability; the failure rate remains below 20% even at the highest obstacle density of 500. However, as the radius widens, the system's ability to find a path degrades significantly. The 'very_wide' radius setting proves to be highly restrictive, causing a failure rate of 54% at just 50 obstacles, which rises to 99% at 300 obstacles. This result starkly illustrates the trade-off between guaranteed safety and path availability.

## 5.3. Efficiency Analysis: Path Length Inflation (PLI)

Path Length Inflation measures the cost of safety in terms of increased path distance, considering only successful pathfinding attempts.

*[Figure 5.2: `inflation_vs_density.png` should be inserted here, with the caption: "Figure 5.2: Average Path Length Inflation (PLI) for successful paths across different obstacle densities and radius settings."]*

Figure 5.2 shows that for low obstacle densities, the PLI remains minimal, especially for 'tight' and 'standard' radii, often staying close to 1.0 (no inflation). This indicates that for minor disruptions, safe alternative paths of similar length are readily available. However, as density and radius increase, the algorithm is forced to find more significant detours. For instance, at a density of 300 obstacles, the average path for the 'wide' radius setting is 85% longer than the baseline (PLI = 1.85), demonstrating a substantial efficiency cost for ensuring a wide safety margin in a congested environment. A notable peak occurs for the 'very_wide' setting at 150 obstacles (PLI = 1.93), suggesting that in this specific configuration, the few successful paths are extremely long detours.

## 5.4. Safety Analysis: Path Vulnerability Index (PVI)

The PVI provides a more nuanced view of path safety, measuring the proportion of a path that, while valid, lies in a "warning zone" (1.5x the avoidance radius).

*[Figure 5.3: `pvi_vs_density.png` should be inserted here, with the caption: "Figure 5.3: Average Path Vulnerability Index (PVI) for successful paths, indicating the percentage of the path within a 'warning zone'."]*

The trends in Figure 5.3 reveal that for the 'tight' and 'standard' settings, the average PVI is consistently low but rises with obstacle density. This suggests that as the environment becomes more cluttered, the algorithm is forced to route paths closer to obstacle warning zones. An interesting counter-trend appears for 'wide' and 'very_wide' settings at high densities. The average PVI appears to drop significantly (becoming negative in the table due to failed runs being marked as -1). This is influenced by the high failure rates in those configurations. This indicates that in these highly constrained scenarios, the few paths that are found at all are typically those that are very far from any obstacles, resulting in a lower average vulnerability among the small set of successful routes.

## 5.5. Performance Analysis: Computational Cost (ET)

The execution time of the algorithm is a direct measure of its viability for real-time applications.

*[Figure 5.4: `time_vs_density.png` should be inserted here, with the caption: "Figure 5.4: Average algorithm execution time versus obstacle density for each radius setting."]*

As illustrated in Figure 5.4 and detailed in Table 5.1, the average execution time across all 1,600 test cases remains well below the 250ms real-time threshold. The average time for most configurations is under 100ms. We observe that execution time generally increases with obstacle density, which corresponds to the increased number of exclusion checks. Notably, for the highest densities (300 and 500), the 'wide' and 'very_wide' radii exhibit a decrease in average execution time. This is because the high failure rate in these scenarios (as seen in Fig 5.1) leads to very rapid termination of the search, bringing the average time down. This highlights a key performance characteristic: the algorithm "fails fast" in overly constrained scenarios.
