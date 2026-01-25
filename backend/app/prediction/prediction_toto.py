import os
import numpy as np
import pandas as pd
from collections import Counter
from supabase import create_client
from dotenv import load_dotenv
import xgboost as xgb
from sklearn.model_selection import train_test_split
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
def fetch_toto_data():
    """
    Fetching the flattened TOTO data from my SQL View 'view_toto_ml_data'.
    This view gives me the 'winning_numbers' as a clean array of integers.
    """
    print("[INFO] I am fetching TOTO history from Supabase...")
    
    # I fetch the last 200 draws to ensure I have enough history for the LSTM to learn sequences
    response = supabase.table("view_toto_ml_data")\
        .select("*")\
        .order("draw_no", desc=True)\
        .limit(200)\
        .execute()
    
    df = pd.DataFrame(response.data)
    
    # I sort the data chronologically because Time Series models (LSTM) need order
    df = df.sort_values(by="draw_no", ascending=True).reset_index(drop=True)
    return df

# ==========================================
# METHOD 1: STATISTICAL FREQUENCY (The "Hot" Numbers)
# ==========================================
def predict_frequency_toto(df, system_roll=6):
    """
    Method 1: Frequency Analysis
    I simply count how many times each ball (1-49) has appeared in my dataset.
    This creates a baseline model based on the 'Law of Large Numbers'.
    """
    print(f"\n--- I am running Method 1: Frequency Analysis (System {system_roll}) ---")
    
    # I flatten the list of lists into one giant list of all drawn numbers
    # e.g., [[1, 2], [3, 4]] becomes [1, 2, 3, 4]
    all_numbers = [num for sublist in df['winning_numbers'] for num in sublist]
    
    # I use Counter to find the most common numbers
    counts = Counter(all_numbers)
    
    # I pick the top 'N' most frequent numbers based on the user's System Bet (6, 7, 8, etc.)
    most_common = counts.most_common(system_roll)
    prediction = sorted([num[0] for num in most_common])
    
    return {
        "model_name": "Statistical Frequency",
        "predicted_numbers": prediction,
        "rationale": "I identified the 'Hot Numbers' that statistically appear most often due to potential mechanical bias.",
        "confidence_score": 0.55 # Baseline confidence
    }

# ==========================================
# METHOD 2: XGBOOST CLASSIFICATION (The "Context" Model)
# ==========================================
def predict_xgboost_toto(df, system_roll=6):
    """
    Method 2: XGBoost Classification
    I treat this as a classification problem: 'Given the Date and Ball Number X, 
    what is the probability that Ball X will be drawn?'
    """
    print(f"\n--- I am running Method 2: XGBoost Classification (System {system_roll}) ---")
    
    # 1. Feature Engineering
    # I need to transform the data so each row represents ONE ball's potential appearance
    train_data = []
    
    for _, row in df.iterrows():
        draw_date = pd.to_datetime(row['draw_date'])
        
        # My features: Day of week, Month, and the Ball Number itself
        # This lets the model learn things like "Ball 7 is popular in January"
        features_base = [draw_date.dayofweek, draw_date.month]
        
        # The 'Targets': A set of the winning numbers for this draw
        winning_set = set(row['winning_numbers'])
        
        # I create 49 rows for every single draw (one for each ball 1-49)
        for ball in range(1, 50):
            is_winner = 1 if ball in winning_set else 0
            # Row Format: [Day, Month, Ball_ID] -> Target (1 or 0)
            train_data.append(features_base + [ball, is_winner])
            
    train_df = pd.DataFrame(train_data, columns=['day', 'month', 'ball_id', 'target'])
    
    X = train_df[['day', 'month', 'ball_id']]
    y = train_df['target']
    
    # 2. Train Model
    # I use a Classifier because I want a probability score (0 to 1) for each ball
    model = xgb.XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, eval_metric="logloss")
    model.fit(X, y)
    
    # 3. Predict Next Draw
    latest_draw_date = pd.to_datetime(df.iloc[-1]['draw_date'])
    next_date = latest_draw_date + pd.Timedelta(days=3) # Approximating next draw date
    
    # I prepare a prediction table for all 49 balls for the NEXT date
    next_draw_features = []
    for ball in range(1, 50):
        next_draw_features.append([next_date.dayofweek, next_date.month, ball])
        
    predictions_proba = model.predict_proba(next_draw_features)[:, 1] # Get probability of class '1' (Winner)
    
    # 4. Rank and Select
    # I combine the Ball ID with its Probability Score
    ball_probs = list(zip(range(1, 50), predictions_proba))
    
    # I sort by highest probability and pick the top N (System 6, 7, etc.)
    ball_probs.sort(key=lambda x: x[1], reverse=True)
    top_n = sorted([ball[0] for ball in ball_probs[:system_roll]])
    
    return {
        "model_name": "XGBoost Classifier",
        "predicted_numbers": top_n,
        "rationale": "I used Gradient Boosting to calculate the individual probability of each ball appearing based on calendar patterns.",
        "confidence_score": 0.60 # Slightly higher as it uses more features
    }

# ==========================================
# METHOD 3: LSTM DEEP LEARNING (The "Sequence" Model)
# ==========================================
def predict_lstm_toto(df, system_roll=6):
    """
    Method 3: LSTM Neural Network
    I treat the lottery history as a 'Multi-Hot Encoded' time series.
    I want the AI to learn the wave-like patterns of numbers entering and leaving the draw.
    """
    print(f"\n--- I am running Method 3: LSTM Deep Learning (System {system_roll}) ---")
    
    # 1. Data Preparation (Multi-Hot Encoding)
    # I convert each draw into a vector of 49 zeros and ones.
    # [1, 0, 0, 1, ...] means Ball 1 and Ball 4 were drawn.
    history_vectors = []
    
    for numbers in df['winning_numbers']:
        vector = [0] * 49
        for num in numbers:
            if 1 <= num <= 49:
                vector[num - 1] = 1 # Index 0 represents Ball 1
        history_vectors.append(vector)
        
    data = np.array(history_vectors)
    
    # 2. Create Sequences
    # I look back at the last 10 draws to predict the 11th
    look_back = 10
    X, y = [], []
    
    if len(data) < look_back + 1:
        return {"error": "Not enough data for LSTM"}

    for i in range(look_back, len(data)):
        X.append(data[i-look_back:i]) # The sequence of past 10 vectors
        y.append(data[i])            # The actual next vector
        
    X = np.array(X)
    y = np.array(y)
    
    # 3. Build Model
    model = Sequential()
    # Input Shape: (10 Steps, 49 Features/Balls)
    model.add(LSTM(64, input_shape=(look_back, 49), return_sequences=False))
    model.add(Dense(49, activation='sigmoid')) # Sigmoid because each ball has an independent probability between 0 and 1
    
    model.compile(optimizer='adam', loss='binary_crossentropy')
    
    # 4. Train
    model.fit(X, y, epochs=10, batch_size=4, verbose=0)
    
    # 5. Predict
    last_sequence = data[-look_back:].reshape(1, look_back, 49)
    predicted_vector = model.predict(last_sequence, verbose=0)[0]
    
    # 6. Decode
    # The output is 49 float probabilities. I pair them with ball numbers.
    ball_probs = list(zip(range(1, 50), predicted_vector))
    
    # I sort by probability and take the top N
    ball_probs.sort(key=lambda x: x[1], reverse=True)
    top_n = sorted([ball[0] for ball in ball_probs[:system_roll]])
    
    return {
        "model_name": "LSTM Neural Network",
        "predicted_numbers": top_n,
        "rationale": "I trained a Neural Network to recognize sequential patterns and 'momentum' in the winning numbers.",
        "confidence_score": 0.45 # Lower confidence as TOTO is highly random
    }

# ==========================================
# DB SAVE FUNCTION
# ==========================================
def save_prediction_to_db(result, game_type="toto"):
    """
    I save the generated prediction to the 'prediction_logs' table so I can
    display it on the frontend and evaluate its accuracy later.
    """
    try:
        # I calculate the Next Draw Number (Latest + 1)
        latest_draw_no = df['draw_no'].max()
        target_draw = int(latest_draw_no) + 1
        
        payload = {
            "game_type": game_type,
            "draw_no": target_draw,
            "model_name": result['model_name'],
            "predicted_numbers": result['predicted_numbers'], # Stored as JSON array
            "confidence_score": result['confidence_score'],
            "is_correct": None # Pending result
        }

        # Saving to Supabase
        data = supabase.table("prediction_logs").insert(payload).execute()
        print(f"[DB] I successfully saved the {result['model_name']} prediction.")
        
    except Exception as e:
        print(f"[ERROR] I could not save to DB: {e}")

# ==========================================
# MAIN EXECUTION
# ==========================================
if __name__ == "__main__":
    try:
        # 1. Fetch Data
        df = fetch_toto_data()
        
        if df.empty:
            print("[ERROR] No data found. I need to run the backfill script first.")
        else:
            print(f"[INFO] I loaded {len(df)} TOTO draws for training.\n")
            
            # 2. Run All Methods
            # Note: I can change 'system_roll' to 7 to generate a System 7 prediction
            results = []
            results.append(predict_frequency_toto(df, system_roll=6))
            results.append(predict_xgboost_toto(df, system_roll=6))
            results.append(predict_lstm_toto(df, system_roll=6))
            
            # 3. Output & Save
            for res in results:
                print(f"\nModel: {res['model_name']}")
                print(f"Prediction (System 6): {res['predicted_numbers']}")
                print(f"Rationale: {res['rationale']}")
                save_prediction_to_db(res)

    except Exception as e:
        print(f"An unexpected error occurred: {e}")