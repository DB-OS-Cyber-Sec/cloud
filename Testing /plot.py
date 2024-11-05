import json
import matplotlib.pyplot as plt
from datetime import datetime

# Load the JSON data
try:
    with open('formatted_results.json', 'r') as file:
        data = json.load(file)
except json.JSONDecodeError as e:
    print("Error decoding JSON:", e)
    exit(1)
except FileNotFoundError:
    print("The file formatted_results.json was not found.")
    exit(1)

# Prepare data for visualization
metrics_dict = {}
for entry in data:
    metric = entry.get('metric')
    time_str = entry.get('data', {}).get('time')
    
    if time_str is None or metric is None:
        print(f"Missing metric or time in entry: {entry}")
        continue  # Skip this entry if there's a missing metric or time
    
    # Ensure time is in the correct format for datetime
    try:
        time = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
    except ValueError as e:
        print(f"Error parsing time '{time_str}': {e}")
        continue  # Skip this entry if there's an error
    
    value = entry.get('data', {}).get('value')
    
    if value is None:
        print(f"Missing value for metric '{metric}' at time '{time_str}'.")
        continue  # Skip this entry if value is missing
    
    if metric not in metrics_dict:
        metrics_dict[metric] = {'time': [], 'value': []}
    
    metrics_dict[metric]['time'].append(time)
    metrics_dict[metric]['value'].append(value)

# Create plots
for metric, values in metrics_dict.items():
    plt.figure(figsize=(10, 5))
    plt.plot(values['time'], values['value'], marker='o', label=metric)
    plt.title(f'{metric} Over Time')
    plt.xlabel('Time')
    plt.ylabel(metric)
    plt.xticks(rotation=45)
    plt.legend()
    plt.grid()
    plt.tight_layout()
    plt.show()