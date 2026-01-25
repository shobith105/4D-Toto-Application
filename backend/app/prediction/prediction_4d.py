import os
import numpy as np
import pandas as pd
from collections import Counter
from supabase import create_client
from dotenv import load_dotenv
import xgboost as xgb
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# ==========================================
# 1. DATA LOADING
# ==========================================
def fetch_4d_data():
    """
    Fetches 4D data from the Supabase SQL View 'view_4d_ml_data'.
    """
    print("[INFO] I am fetching 4D data from Supabase...")
    # Fetch enough history for training (last 500 draws)
    response = supabase.table("view_4d_ml_data")\
        .select("*")\
        .order("draw_no", desc=True)\
        .limit(500)\
        .execute()
    
    df = pd.DataFrame(response.data)
    # Sort ascending for time-series training
    df = df.sort_values(by="draw_no", ascending=True).reset_index(drop=True)
    return df

# ==========================================
# METHOD 1: FREQUENCY ANALYSIS (Statistical)
# ==========================================
def predict_frequency_4d(df):
    """
    Method 1: Frequency Analysis
    Analyzes which numbers appear most frequently across all top 3 positions.
    """
    print("\n--- Running Method 1: Frequency Analysis ---")
    
    # Combine all top 3 prizes into one list to find the overall "hot" numbers
    all_prizes = (
        df['first_prize'].astype(str).str.zfill(4).tolist() + 
        df['second_prize'].astype(str).str.zfill(4).tolist() + 
        df['third_prize'].astype(str).str.zfill(4).tolist()
    )
    
    counts = Counter(all_prizes)
    # Get top 3 most common numbers
    top_3 = counts.most_common(3)
    prediction = [num[0] for num in top_3]
    
    return {
        "model_name": "Statistical Frequency",
        "predicted_numbers": prediction,
        "rationale": "I identified the top 3 'Hot Numbers' based on historical frequency.",
        "confidence_score": 0.55
    }

# ==========================================
# METHOD 2: XGBOOST REGRESSION (Top 3 Prizes)
# ==========================================
def predict_xgboost_4d(df):
    """
    Method 2: XGBoost
    Trains 3 separate models: one for 1st Prize, one for 2nd, and one for 3rd.
    """
    print("\n--- Running Method 2: XGBoost Regression (Top 3) ---")
    
    # 1. Feature Engineering
    df['date_parsed'] = pd.to_datetime(df['draw_date'])
    df['day_of_week'] = df['date_parsed'].dt.dayofweek
    df['month'] = df['date_parsed'].dt.month
    df['draw_no_int'] = df['draw_no']
    
    # Features
    X = df[['draw_no_int', 'day_of_week', 'month']]
    
    # Prepare Next Draw Features
    latest_draw = df.iloc[-1]
    next_draw_no = latest_draw['draw_no_int'] + 1
    next_date = latest_draw['date_parsed'] + pd.Timedelta(days=3) # Approx next draw
    
    future_features = pd.DataFrame([{
        'draw_no_int': next_draw_no,
        'day_of_week': next_date.dayofweek,
        'month': next_date.month
    }])
    
    predictions = []
    
    # 2. Loop through each prize type (First, Second, Third)
    for target_col in ['first_prize', 'second_prize', 'third_prize']:
        print(f"   > Training XGBoost for {target_col}...")
        y = df[target_col]
        
        # Train Model
        model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5)
        model.fit(X, y)
        
        # Predict
        pred_float = model.predict(future_features)[0]
        
        # Format as 4D string
        pred_int = int(max(0, min(9999, round(pred_float))))
        predictions.append(f"{pred_int:04d}")
    
    return {
        "model_name": "XGBoost Regressor",
        "predicted_numbers": predictions, # Returns list of 3 numbers
        "rationale": "Trains 3 separate decision tree models to predict the 1st, 2nd, and 3rd prizes based on date patterns.",
        "confidence_score": 0.60
    }

# ==========================================
# METHOD 3: LSTM DEEP LEARNING (Top 3 Prizes)
# ==========================================
def predict_lstm_4d(df):
    """
    Method 3: LSTM
    Over here I train a Time-Series Neural Network for each of the 3 prize categories.
    """
    print("\n--- Running Method 3: LSTM Deep Learning (Top 3) ---")
    
    predictions = []
    look_back = 10
    
    # Loop through each prize column
    for target_col in ['first_prize', 'second_prize', 'third_prize']:
        print(f"   > Training LSTM for {target_col}...")
        
        # 1. Prepare Data
        data = df[target_col].values.reshape(-1, 1)
        
        # Normalize
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(data)
        
        X, y = [], []
        if len(scaled_data) < look_back + 1:
            predictions.append("0000") # Fallback if error
            continue

        for i in range(look_back, len(scaled_data)):
            X.append(scaled_data[i-look_back:i, 0])
            y.append(scaled_data[i, 0])
            
        X = np.array(X)
        y = np.array(y)
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))
        
        # 2. Build & Train
        model = Sequential()
        model.add(LSTM(50, return_sequences=False, input_shape=(look_back, 1)))
        model.add(Dense(1))
        model.compile(optimizer='adam', loss='mean_squared_error')
        
        # Fast training (epochs=10) for demo speed
        model.fit(X, y, epochs=10, batch_size=1, verbose=0)
        
        # 3. Predict Next
        last_sequence = scaled_data[-look_back:].reshape(1, look_back, 1)
        predicted_scaled = model.predict(last_sequence, verbose=0)
        
        # Inverse transform
        predicted_val = scaler.inverse_transform(predicted_scaled)[0][0]
        predicted_int = int(max(0, min(9999, round(predicted_val))))
        predictions.append(f"{predicted_int:04d}")
    
    return {
        "model_name": "LSTM Neural Network",
        "predicted_numbers": predictions,
        "rationale": "I used Deep Learning to analyze the sequential momentum for each of the top 3 prize tiers independently.",
        "confidence_score": 0.50
    }

# ==========================================
# DB SAVE FUNCTION
# ==========================================
def save_prediction_to_db(result, latest_draw_no, game_type="4d"):
    """
    Saving the generated prediction to the 'prediction_logs' table.
    """
    try:
        target_draw = int(latest_draw_no) + 1
        
        payload = {
            "game_type": game_type,
            "draw_no": target_draw,
            "model_name": result['model_name'],
            "predicted_numbers": result['predicted_numbers'], # Saves as JSON array ["1234", "5678", "9101"]
            "confidence_score": result['confidence_score'],
            "is_correct": None
        }

        # Saving to Supabase
        supabase.table("prediction_logs").insert(payload).execute()
        print(f"[DB] Saved {result['model_name']} prediction for Draw {target_draw}.")
        
    except Exception as e:
        print(f"[ERROR] Could not save to DB: {e}")

# ==========================================
# MAIN EXECUTION
# ==========================================
if __name__ == "__main__":
    try:
        # 1. Fetch Data
        df = fetch_4d_data()
        
        if df.empty:
            print("[ERROR] No data found. Please run backfill script.")
        else:
            print(f"[INFO] Loaded {len(df)} draws for training.")
            latest_draw_no = df['draw_no'].max()
            
            # 2. Run All Methods
            results = []
            results.append(predict_frequency_4d(df))
            results.append(predict_xgboost_4d(df))
            results.append(predict_lstm_4d(df))
            
            # 3. Output & Save
            for res in results:
                print(f"\nModel: {res['model_name']}")
                print(f"Top 3 Prediction: {res['predicted_numbers']}")
                save_prediction_to_db(res, latest_draw_no)

    except Exception as e:
        print(f"An error occurred: {e}")