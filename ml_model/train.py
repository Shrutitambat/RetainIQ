# ============================================================
# Customer Churn Prediction - Model Training
# ============================================================
# What this script does:
# 1. Loads real telecom customer data
# 2. Cleans and preprocesses it
# 3. Trains an XGBoost classifier
# 4. Evaluates model performance
# 5. Saves model + artifacts for use in the backend
# ============================================================

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    confusion_matrix
)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import joblib
import shap
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings("ignore")

print("=" * 50)
print("  CUSTOMER CHURN MODEL TRAINING")
print("=" * 50)


# ── STEP 1: LOAD DATA ────────────────────────────────────
# pandas read_csv loads our CSV into a DataFrame
# A DataFrame is like an Excel sheet in Python
print("\n📂 Loading data...")
df = pd.read_csv("WA_Fn-UseC_-Telco-Customer-Churn.csv")
print(f"   Shape: {df.shape[0]} rows × {df.shape[1]} columns")


# ── STEP 2: CLEAN DATA ───────────────────────────────────
# Why clean? Raw data is messy. ML models need clean numbers.

print("\n🧹 Cleaning data...")

# Remove customerID — it's just an identifier, not useful for prediction
df.drop("customerID", axis=1, inplace=True)

# TotalCharges should be a number but is stored as text (has spaces)
# pd.to_numeric converts it, errors='coerce' turns invalid values to NaN
df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")

# Drop rows where TotalCharges is NaN (only ~11 rows)
before = len(df)
df.dropna(inplace=True)
after = len(df)
print(f"   Removed {before - after} rows with missing values")

# Convert target variable: "Yes" → 1 (churned), "No" → 0 (stayed)
# ML models work with numbers, not text
df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})

print(f"   Churn distribution:")
print(f"   - Stayed (0): {df['Churn'].value_counts()[0]} customers")
print(f"   - Churned (1): {df['Churn'].value_counts()[1]} customers")


# ── STEP 3: ENCODE CATEGORICAL FEATURES ──────────────────
# Why? ML models only understand numbers.
# Columns like "Gender: Male/Female" need to become 0/1
# We use ONE-HOT ENCODING for this dataset
# Example: Contract → [Month-to-month, One year, Two year]
# becomes  Contract_Month-to-month=1, Contract_One year=0, Contract_Two year=0

print("\n🔢 Encoding categorical features...")

# Separate features (X) from target (y)
X = df.drop("Churn", axis=1)
y = df["Churn"]

# Get list of text columns
categorical_cols = X.select_dtypes(include="object").columns.tolist()
print(f"   Categorical columns: {categorical_cols}")

# pd.get_dummies creates separate 0/1 columns for each category
# drop_first=True removes one column per feature to avoid redundancy
X = pd.get_dummies(X, columns=categorical_cols, drop_first=True)
print(f"   Total features after encoding: {X.shape[1]}")

# Save column names — we need these later when predicting new data
# The backend must send data in the EXACT same column order
feature_names = X.columns.tolist()


# ── STEP 4: SCALE NUMERICAL FEATURES ─────────────────────
# Why scale? Features have very different ranges:
# - tenure: 0–72 months
# - MonthlyCharges: $18–$118
# - SeniorCitizen: 0 or 1
# Without scaling, large numbers dominate. Scaling puts everything
# on the same scale (mean=0, std=1)

print("\n⚖️  Scaling features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
# fit_transform: learns the mean/std from data AND applies transformation
# Later for new data we only use transform() (not fit again)


# ── STEP 5: FIX CLASS IMBALANCE WITH SMOTE ───────────────
# Problem: 73% non-churners vs 27% churners
# If we train like this, model will just predict "No churn" always
# and still get 73% accuracy — but that's useless!
#
# SMOTE (Synthetic Minority Over-sampling Technique):
# Creates SYNTHETIC new examples of the minority class (churners)
# by interpolating between existing churner examples
# Result: balanced 50/50 dataset for training

print("\n⚖️  Balancing classes with SMOTE...")
sm = SMOTE(random_state=42)
X_balanced, y_balanced = sm.fit_resample(X_scaled, y)
print(f"   Before SMOTE: {len(y)} samples")
print(f"   After SMOTE:  {len(y_balanced)} samples (balanced)")


# ── STEP 6: TRAIN / TEST SPLIT ───────────────────────────
# Why split? We need unseen data to evaluate how well model generalizes
# 80% training data → model learns from this
# 20% test data → we evaluate on this (model never saw it)

print("\n✂️  Splitting into train/test sets...")
X_train, X_test, y_train, y_test = train_test_split(
    X_balanced, y_balanced,
    test_size=0.2,       # 20% for testing
    random_state=42      # fixed seed for reproducibility
)
print(f"   Training samples: {len(X_train)}")
print(f"   Testing samples:  {len(X_test)}")


# ── STEP 7: TRAIN XGBOOST MODEL ──────────────────────────
# Why XGBoost?
# - Best performance on tabular/structured data
# - Handles complex non-linear relationships
# - Built-in regularization to prevent overfitting
# - Used by winning ML competition teams worldwide

print("\n🚀 Training XGBoost model...")
model = XGBClassifier(
    n_estimators=200,      # 200 decision trees
    max_depth=6,           # each tree can be 6 levels deep
    learning_rate=0.05,    # how much each tree corrects previous errors
    subsample=0.8,         # use 80% of data per tree (prevents overfitting)
    colsample_bytree=0.8,  # use 80% of features per tree
    eval_metric="logloss",
    random_state=42,
    verbosity=0
)
model.fit(X_train, y_train)
print("   Training complete! ✅")


# ── STEP 8: EVALUATE MODEL ───────────────────────────────
# Never trust a model without evaluating it properly

print("\n📊 Evaluating model...")
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]  # probability of churn

print("\n   Classification Report:")
print(classification_report(y_test, y_pred,
      target_names=["Stayed", "Churned"]))

auc = roc_auc_score(y_test, y_prob)
print(f"   ROC-AUC Score: {auc:.4f}")
print("   (AUC > 0.85 is excellent for churn prediction)")

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
print(f"\n   Confusion Matrix:")
print(f"   True Negatives  (correctly predicted stayed):  {cm[0][0]}")
print(f"   False Positives (predicted churn, actually stayed): {cm[0][1]}")
print(f"   False Negatives (predicted stayed, actually churned): {cm[1][0]}")
print(f"   True Positives  (correctly predicted churned): {cm[1][1]}")


# ── STEP 9: SHAP EXPLAINABILITY ───────────────────────────
# SHAP = SHapley Additive exPlanations
# Tells us: for THIS specific customer, which features
# pushed the prediction toward churn or away from churn?
# 
# Example output:
# "Contract_Month-to-month = +0.45 → increases churn risk"
# "tenure = -0.32 → decreases churn risk (long tenure = loyal)"

print("\n🔍 Computing SHAP values for explainability...")
explainer = shap.TreeExplainer(model)
# Compute on a sample of 200 test customers (faster)
shap_sample = X_test[:200]
shap_values = explainer.shap_values(shap_sample)

# Feature importance chart
print("   Saving feature importance chart...")
shap.summary_plot(
    shap_values,
    shap_sample,
    feature_names=feature_names,
    plot_type="bar",
    show=False
)
plt.tight_layout()
plt.savefig("feature_importance.png", dpi=150, bbox_inches="tight")
plt.close()
print("   Chart saved: feature_importance.png ✅")


# ── STEP 10: SAVE EVERYTHING ─────────────────────────────
# We save 3 things:
# 1. model.pkl     → the trained XGBoost model
# 2. scaler.pkl    → the fitted StandardScaler (must use same scaler on new data)
# 3. features.pkl  → the exact list of column names in correct order

print("\n💾 Saving model artifacts...")
joblib.dump(model, "churn_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(feature_names, "feature_names.pkl")

print("   churn_model.pkl    ✅")
print("   scaler.pkl         ✅")
print("   feature_names.pkl  ✅")

print("\n" + "=" * 50)
print("  TRAINING COMPLETE!")
print(f"  Model AUC: {auc:.4f}")
print("  Ready for backend integration.")
print("=" * 50)