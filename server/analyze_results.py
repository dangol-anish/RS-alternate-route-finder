import pandas as pd
import os
import matplotlib.pyplot as plt
import seaborn as sns

# Define the path to the results CSV file
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
RESULTS_FILE = os.path.join(SCRIPT_DIR, "research-paper-new", "experiment_results.csv")

def load_data(file_path):
    """Loads the experiment results into a pandas DataFrame."""
    if not os.path.exists(file_path):
        print(f"Error: Results file not found at {file_path}")
        return None
    
    df = pd.read_csv(file_path)
    print(f"Successfully loaded data from {file_path}")
    print("\nDataFrame Info:")
    df.info()
    print("\nFirst 5 rows:")
    print(df.head())
    return df

def generate_summary_table(df):
    """Generates a summary table of key metrics."""
    print("\n--- Generating Summary Table ---")

    # Handle cases where pathfinding failed for inflation calculation
    # A value of -1 indicates failure, we should not include it in the mean.
    # A value of 1.0 means it found the same path as baseline, which is valid.
    df_successful = df[df['path_inflation_ratio'] != -1].copy()

    # Calculate failure rate
    failure_rate = df.groupby(['obstacle_density', 'radius_setting'])['path_found_yours'].apply(lambda x: (1 - x.mean()) * 100)
    failure_rate = failure_rate.rename('failure_rate_%')

    # Aggregate other metrics
    agg_metrics = {
        'pvi': 'mean',
        'time_yours': 'mean',
        'ssr': 'mean'
    }
    
    # Aggregate main metrics from all runs
    summary_df = df.groupby(['obstacle_density', 'radius_setting']).agg(agg_metrics)

    # Aggregate path inflation only from successful runs
    inflation_summary = df_successful.groupby(['obstacle_density', 'radius_setting']).agg({'path_inflation_ratio': 'mean'})
    
    # Join the summaries
    summary_df = summary_df.join(inflation_summary).join(failure_rate)
    
    # Rename for clarity
    summary_df.rename(columns={
        'pvi': 'avg_pvi',
        'time_yours': 'avg_time_s',
        'path_inflation_ratio': 'avg_path_inflation',
        'ssr': 'avg_ssr_%'
    }, inplace=True)
    
    print("Aggregation complete.")
    return summary_df

def analyze_results():
    df = load_data(RESULTS_FILE)
    if df is None:
        return

    summary_table = generate_summary_table(df)
    print("\n--- Aggregated Results Summary ---")
    print(summary_table)
    print("\n" + "="*40)
    print("Notes on the table:")
    print("- 'avg_pvi': Average Path Vulnerability Index (lower is better).")
    print("- 'avg_time_s': Average computation time in seconds for your algorithm.")
    print("- 'avg_ssr_%': Average Search Space Reduction (higher is better).")
    print("- 'avg_path_inflation': Average path length increase vs baseline (for successful paths).")
    print("- 'failure_rate_%': Percentage of cases where your algorithm failed to find a path.")
    print("="*40)

    generate_visualizations(summary_table)

def generate_visualizations(summary_df):
    """Generates and saves plots from the summary data."""
    print("\n--- Generating Visualizations ---")
    
    charts_dir = os.path.join(SCRIPT_DIR, 'charts')
    if not os.path.exists(charts_dir):
        os.makedirs(charts_dir)
        print(f"Created directory: {charts_dir}")

    # Reset index to make 'obstacle_density' and 'radius_setting' columns for plotting
    plot_df = summary_df.reset_index()

    # Set plot style
    sns.set(style="whitegrid")

    # --- Plot 1: PVI vs. Density ---
    plt.figure(figsize=(10, 6))
    sns.lineplot(data=plot_df, x='obstacle_density', y='avg_pvi', hue='radius_setting', marker='o')
    plt.title('Safety: Average Path Vulnerability Index (PVI) vs. Obstacle Density')
    plt.xlabel('Number of Obstacles')
    plt.ylabel('Average PVI (%)')
    plt.legend(title='Radius Setting')
    pvi_path = os.path.join(charts_dir, 'pvi_vs_density.png')
    plt.savefig(pvi_path)
    print(f"Saved PVI plot to {pvi_path}")
    plt.close()

    # --- Plot 2: Path Inflation vs. Density ---
    plt.figure(figsize=(10, 6))
    sns.lineplot(data=plot_df, x='obstacle_density', y='avg_path_inflation', hue='radius_setting', marker='o')
    plt.title('Cost: Average Path Inflation vs. Obstacle Density')
    plt.xlabel('Number of Obstacles')
    plt.ylabel('Average Path Inflation Ratio')
    plt.legend(title='Radius Setting')
    inflation_path = os.path.join(charts_dir, 'inflation_vs_density.png')
    plt.savefig(inflation_path)
    print(f"Saved Inflation plot to {inflation_path}")
    plt.close()

    # --- Plot 3: Failure Rate vs. Density ---
    plt.figure(figsize=(10, 6))
    sns.lineplot(data=plot_df, x='obstacle_density', y='failure_rate_%', hue='radius_setting', marker='o')
    plt.title('Reliability: Failure Rate vs. Obstacle Density')
    plt.xlabel('Number of Obstacles')
    plt.ylabel('Failure Rate (%)')
    plt.legend(title='Radius Setting')
    failure_path = os.path.join(charts_dir, 'failure_rate_vs_density.png')
    plt.savefig(failure_path)
    print(f"Saved Failure Rate plot to {failure_path}")
    plt.close()

    # --- Plot 4: Computation Time vs. Density ---
    plt.figure(figsize=(10, 6))
    sns.lineplot(data=plot_df, x='obstacle_density', y='avg_time_s', hue='radius_setting', marker='o')
    plt.title('Performance: Average Computation Time vs. Obstacle Density')
    plt.xlabel('Number of Obstacles')
    plt.ylabel('Average Time (seconds)')
    plt.legend(title='Radius Setting')
    time_path = os.path.join(charts_dir, 'time_vs_density.png')
    plt.savefig(time_path)
    print(f"Saved Time plot to {time_path}")
    plt.close()

    print("--- All plots generated successfully. ---")


if __name__ == "__main__":
    print("===================================")
    print("= Starting Experiment Data Analysis =")
    print("===================================")
    analyze_results()
    print("===================================")
    print("= Data Analysis Complete          =")
    print("===================================")
