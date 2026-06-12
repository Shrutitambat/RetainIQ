import os
import joblib
import pandas as pd
import numpy as np

def main():
    # File paths relative to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, "WA_Fn-UseC_-Telco-Customer-Churn.csv")
    model_path = os.path.join(script_dir, "churn_model.pkl")
    scaler_path = os.path.join(script_dir, "scaler.pkl")
    feature_names_path = os.path.join(script_dir, "feature_names.pkl")

    print("=" * 60)
    print("  CUSTOMER CHURN MODEL - PREDICTION TESTER")
    print("=" * 60)

    # 1. Load all 3 files
    print("\n[+] Loading model artifacts...")
    if not all(os.path.exists(p) for p in [model_path, scaler_path, feature_names_path]):
        print("Error: Missing one or more model artifacts (pkl files)!")
        return

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    feature_names = joblib.load(feature_names_path)
    print("   Artifacts loaded successfully! [OK]")

    # 2. Load the original CSV
    print(f"\n[+] Loading dataset from {csv_path}...")
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return
    df = pd.read_csv(csv_path)

    # 3. Clean and preprocess exactly like training
    print("\n[+] Cleaning and preprocessing...")
    df_clean = df.copy()
    
    # Clean TotalCharges (spaces -> NaN)
    df_clean["TotalCharges"] = pd.to_numeric(df_clean["TotalCharges"], errors="coerce")
    
    # Drop rows with NaN in TotalCharges (matching training)
    df_clean = df_clean.dropna(subset=["TotalCharges"]).reset_index(drop=True)

    # Separate features (X) - drop identifiers and target
    X = df_clean.drop(columns=["customerID", "Churn"])

    # One-hot encode categorical features (same get_dummies as training)
    categorical_cols = X.select_dtypes(include="object").columns.tolist()
    X_encoded = pd.get_dummies(X, columns=categorical_cols, drop_first=True)

    # Align with the training feature names and order
    X_encoded = X_encoded.reindex(columns=feature_names, fill_value=0)

    # Scale the features (same scaler)
    X_scaled = scaler.transform(X_encoded)
    print("   Preprocessing complete! [OK]")

    # 4. Pick 5 random customers
    print("\n[+] Selecting 5 random customers for testing...")
    num_samples = min(5, len(df_clean))
    random_indices = np.random.choice(len(df_clean), size=num_samples, replace=False)

    # 5. Run prediction and print details for each
    for i, idx in enumerate(random_indices, 1):
        customer_row = df_clean.iloc[idx]
        scaled_features = X_scaled[idx].reshape(1, -1)
        
        # Run model prediction (churn probability)
        prob = model.predict_proba(scaled_features)[0, 1]
        
        # Determine risk level based on probability thresholds
        if prob > 0.7:
            risk = "High"
            color_code = "\033[91m"  # Red
        elif prob >= 0.4:
            risk = "Medium"
            color_code = "\033[93m"  # Yellow
        else:
            risk = "Low"
            color_code = "\033[92m"  # Green
        
        reset_code = "\033[0m"

        print(f"\n--- Customer #{i} ---")
        print(f"Customer ID:     {customer_row['customerID']}")
        print(f"Gender/Senior:   {customer_row['gender']} / {'Yes' if customer_row['SeniorCitizen'] == 1 else 'No'}")
        print(f"Tenure:          {customer_row['tenure']} months")
        print(f"Contract:        {customer_row['Contract']}")
        print(f"Monthly Charges: ${customer_row['MonthlyCharges']:.2f}")
        print(f"Total Charges:   ${customer_row['TotalCharges']:.2f}")
        print(f"Actual Churn:    {customer_row['Churn']}")
        print(f"Predicted Churn Probability: {prob:.4f}")
        print(f"Risk Level:      {color_code}{risk}{reset_code}")

    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
