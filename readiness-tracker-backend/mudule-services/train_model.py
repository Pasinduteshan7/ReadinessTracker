import os
import sys

# Prevent UnicodeEncodeError on Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Directory where the script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(BASE_DIR, 'student_marks_ml_dataset_v4.csv')
model_path = os.path.join(BASE_DIR, 'student_model_v4.pkl')

# 1. Load the dataset
df = pd.read_csv(dataset_path)

# 2. Separate Features and Target
X = df.drop(columns=['Registration_Number', 'Primary_Specialization', 'Secondary_Specialization'])
y = df['Primary_Specialization']

# 3. Stratified Train-Test Split (preserves class distribution across splits)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 4. Pipeline with Imputation, Scaling, and High-Performance Classifier
pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='mean')),
    ('scaler', StandardScaler()),
    ('classifier', LogisticRegression(max_iter=1000, C=5.0, random_state=42))
])

# 5. Train the Model
pipeline.fit(X_train, y_train)

# 6. Evaluate Model Accuracy
y_pred = pipeline.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model training completed! Accuracy: {accuracy * 100:.2f}%\n")
print("Detailed Performance Report:")
print(classification_report(y_test, y_pred))

# 7. Save Pipeline to file for deployment (handles raw marks directly)
joblib.dump(pipeline, model_path)
print(f"Model successfully saved to '{model_path}'.")