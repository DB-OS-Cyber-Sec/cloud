import os
import sys
import numpy as np
import torch
import h5py
import matplotlib.pyplot as plt

# Add FourCastNet to the Python path
sys.path.insert(1, './FourCastNet/')

from utils.YParams import YParams
from networks.afnonet import AFNONet
from collections import OrderedDict
from numpy import pad

def load_model(model, params, checkpoint_file):
    # Determine the device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Load checkpoint with appropriate device mapping
    checkpoint = torch.load(checkpoint_file, map_location=device)
    
    new_state_dict = OrderedDict()
    for key, val in checkpoint['model_state'].items():
        name = key[7:]  # Remove 'module.' prefix
        if name != 'ged':
            new_state_dict[name] = val
    
    model.load_state_dict(new_state_dict)
    model.eval()
    return model

def inference(data_slice, model, prediction_length, params, idx):
    n_out_channels = params.N_out_channels
    img_shape_x, img_shape_y = 720, 1440
    device = next(model.parameters()).device
    predictions = torch.zeros((prediction_length, n_out_channels, img_shape_x, img_shape_y)).to(device, dtype=torch.float)

    with torch.no_grad():
        for i in range(prediction_length):
            if i == 0:
                future_pred = model(data_slice[0:1])
                predictions[0] = future_pred
            else:
                future_pred = model(future_pred)
                predictions[i] = future_pred

    return predictions.cpu().numpy()

def predict_weather(initial_condition, prediction_length):
    # Load model and parameters
    config_file = "C:/Users/tande/OneDrive/Documents/GitHub/cloud/AI/config/AFNO.yaml"
    config_name = "afno_backbone"
    params = YParams(config_file, config_name)

    # Set up paths
    model_path = "C:/Users/tande/OneDrive/Documents/GitHub/cloud/AI/data/backbone.ckpt"
    global_means_path = "C:/Users/tande/OneDrive/Documents/GitHub/cloud/AI/data/global_means.npy"
    global_stds_path = "C:/Users/tande/OneDrive/Documents/GitHub/cloud/AI/data/global_stds.npy"

    # Check if files exist
    for file_path in [model_path, global_means_path, global_stds_path]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Required file not found: {file_path}")

    # Determine device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")

    # Load normalization stats
    try:
        means = np.load(global_means_path)[0, params.out_channels]
        stds = np.load(global_stds_path)[0, params.out_channels]
    except Exception as e:
        raise Exception(f"Error loading normalization statistics: {str(e)}")

    # Set additional parameters
    params.N_in_channels = 20
    params.N_out_channels = len(params.out_channels)

    # Initialize and load model
    try:
        model = AFNONet(params).to(device)
        model = load_model(model, params, model_path)
    except Exception as e:
        raise Exception(f"Error loading model: {str(e)}")

    # Prepare input data
    if initial_condition.shape[1] != params.N_in_channels:
        print(f"Warning: Input data has {initial_condition.shape[1]} channels, but model expects {params.N_in_channels}.")
        print("Adjusting input data to match model expectations.")
        initial_condition = initial_condition[:, :params.N_in_channels, ...]

    # Normalize and convert input data
    data = (initial_condition - means) / stds
    data = torch.as_tensor(data).to(device, dtype=torch.float)

    # Run inference
    try:
        predictions = inference(data, model, prediction_length, params, idx=0)
    except RuntimeError as e:
        if "out of memory" in str(e):
            raise RuntimeError("GPU out of memory. Try reducing batch size or using CPU.")
        raise e

    # Denormalize predictions
    predictions = predictions * stds + means

    return predictions

if __name__ == "__main__":
    try:
        # Check if the data file exists
        data_file = "C:/Users/tande/OneDrive/Documents/GitHub/cloud/AI/data/out_of_sample/2018.h5"
        if not os.path.exists(data_file):
            raise FileNotFoundError(f"Data file not found: {data_file}")
        
        # Open and validate the data file
        with h5py.File(data_file, 'r') as f:
            print("Keys in the HDF5 file:", list(f.keys()))
            
            if 'fields' not in f:
                raise KeyError("'fields' dataset not found in the file")
            
            fields = f['fields']
            print("Shape of 'fields' dataset:", fields.shape)
            print("Data type of 'fields' dataset:", fields.dtype)
            
            # Read the data
            sample_data = fields[0:1, :, 0:720]
            print("Successfully read data with shape:", sample_data.shape)
            print("Data range:", np.min(sample_data), "to", np.max(sample_data))
        
        # Make predictions
        prediction_length = 20
        initial_condition = sample_data[:, :20, :, :]
        
        print("Starting weather prediction...")
        forecasts = predict_weather(initial_condition, prediction_length)
        print("Prediction completed successfully")

        # Define variables for output
        variables = [
            'u10', 'v10', 't2m', 'sp', 'msl', 't850', 'u1000', 'v1000', 'z1000',
            'u850', 'v850', 'z850', 'u500', 'v500', 'z500', 't500', 'z50', 'r500', 'r850', 'tcwv'
        ]

        # Save forecasts
        output_file = "forecasts.h5"
        with h5py.File(output_file, "w") as f:
            for i, var in enumerate(variables):
                f.create_dataset(var, data=forecasts[:, i, :, :])
        
        print(f"Forecasts saved to {output_file}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)