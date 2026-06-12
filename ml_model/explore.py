import os
import pandas as pd

def main():
    # Define paths relative to the script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, "WA_Fn-UseC_-Telco-Customer-Churn.csv")
    
    print(f"Loading data from: {csv_path}\n")
    if not os.path.exists(csv_path):
        print(f"Error: File not found at {csv_path}")
        return

    # 1. Load CSV with pandas
    df = pd.read_csv(csv_path)

    # 2. Print shape
    print("=== Data Shape ===")
    print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}\n")

    # 3. Print all column names and their data types
    print("=== Column Names and Data Types ===")
    print(df.dtypes)
    print()

    # 4. Print how many null values each column has
    print("=== Null Values per Column ===")
    print(df.isnull().sum())
    print()

    # 5. Print value counts of the Churn column
    print("=== Churn Column Value Counts ===")
    if 'Churn' in df.columns:
        print(df['Churn'].value_counts(dropna=False))
    else:
        print("Warning: 'Churn' column not found in the dataset.")
    print()

    # 6. Print basic statistics with describe()
    print("=== Basic Statistics (describe) ===")
    print(df.describe(include='all'))
    print()

if __name__ == "__main__":
    main()
