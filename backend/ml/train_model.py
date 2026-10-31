import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix
)

from xgboost import XGBClassifier


# =========================================================
# 1. Load REAL UCI Dataset
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "student_dropout.csv"
)

print("\nLoading dataset...")
print(DATA_PATH)

df = pd.read_csv(
    DATA_PATH,
    sep=";"
)

print("\nDataset shape:")
print(df.shape)


# =========================================================
# 2. Clean column names
# =========================================================

df.columns = df.columns.str.strip()


# =========================================================
# 3. Convert target into binary classification
#
# Dropout  = 1
# Graduate = 0
# Enrolled = 0
# =========================================================

df["dropout"] = (
    df["Target"] == "Dropout"
).astype(int)

df = df.drop(
    columns=["Target"]
)


# =========================================================
# 4. Target distribution
# =========================================================

print("\nTarget distribution:")

print(
    df["dropout"].value_counts()
)

print("\nTarget percentage:")

print(
    df["dropout"].value_counts(
        normalize=True
    ) * 100
)


# =========================================================
# 5. Separate features and target
# =========================================================

X = df.drop(
    columns=["dropout"]
)

y = df["dropout"]


# =========================================================
# 6. Identify categorical and numerical columns
# =========================================================

categorical_columns = X.select_dtypes(
    include=["object"]
).columns.tolist()

numerical_columns = X.select_dtypes(
    exclude=["object"]
).columns.tolist()

print("\nCategorical features:")
print(categorical_columns)

print("\nNumber of numerical features:")
print(len(numerical_columns))


# =========================================================
# 7. Numerical preprocessing
# =========================================================

numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="median"
            )
        ),
        (
            "scaler",
            StandardScaler()
        )
    ]
)


# =========================================================
# 8. Categorical preprocessing
# =========================================================

categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="most_frequent"
            )
        ),
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore"
            )
        )
    ]
)


# =========================================================
# 9. Combined preprocessing
# =========================================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "numeric",
            numeric_pipeline,
            numerical_columns
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_columns
        )
    ]
)


# =========================================================
# 10. Train/Test Split
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining samples:")
print(len(X_train))

print("Testing samples:")
print(len(X_test))


# =========================================================
# 11. Machine Learning Models
# =========================================================

models = {

    "Logistic Regression":
        LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            random_state=42
        ),

    "Random Forest":
        RandomForestClassifier(
            n_estimators=300,
            max_depth=12,
            min_samples_split=5,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1
        ),

    "XGBoost":
        XGBClassifier(
            n_estimators=300,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="logloss",
            random_state=42
        )
}


# =========================================================
# 12. Train and Evaluate
# =========================================================

results = []

trained_models = {}


for model_name, model in models.items():

    print("\n")
    print("=" * 60)
    print(model_name)
    print("=" * 60)

    pipeline = Pipeline(
        steps=[
            (
                "preprocessing",
                preprocessor
            ),
            (
                "model",
                model
            )
        ]
    )

    print("Training...")

    pipeline.fit(
        X_train,
        y_train
    )

    predictions = pipeline.predict(
        X_test
    )

    probabilities = pipeline.predict_proba(
        X_test
    )[:, 1]

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )

    roc_auc = roc_auc_score(
        y_test,
        probabilities
    )

    print(
        f"\nAccuracy  : {accuracy:.4f}"
    )

    print(
        f"Precision : {precision:.4f}"
    )

    print(
        f"Recall    : {recall:.4f}"
    )

    print(
        f"F1 Score  : {f1:.4f}"
    )

    print(
        f"ROC-AUC   : {roc_auc:.4f}"
    )

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            predictions,
            target_names=[
                "Not Dropout",
                "Dropout"
            ],
            zero_division=0
        )
    )

    print("Confusion Matrix:")

    print(
        confusion_matrix(
            y_test,
            predictions
        )
    )

    results.append({
        "model": model_name,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "roc_auc": roc_auc
    })

    trained_models[
        model_name
    ] = pipeline


# =========================================================
# 13. Compare Models
# =========================================================

results_df = pd.DataFrame(
    results
)

results_df = results_df.sort_values(
    by="f1",
    ascending=False
)

print("\n")
print("=" * 60)
print("MODEL COMPARISON")
print("=" * 60)

print(
    results_df.to_string(
        index=False
    )
)


# =========================================================
# 14. Select Best Model
# =========================================================

best_model_name = results_df.iloc[0]["model"]

best_model = trained_models[
    best_model_name
]

print("\n")
print("=" * 60)
print("BEST MODEL")
print("=" * 60)

print(
    best_model_name
)


# =========================================================
# 15. Save Best Model
# =========================================================

MODEL_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "model.pkl"
)

model_bundle = {
    "model": best_model,
    "model_name": best_model_name,
    "features": X.columns.tolist()
}

joblib.dump(
    model_bundle,
    MODEL_PATH
)

print("\nModel saved successfully:")

print(
    MODEL_PATH
)


# =========================================================
# 16. Save Model Comparison
# =========================================================

RESULTS_PATH = os.path.join(
    MODEL_DIR,
    "model_comparison.csv"
)

results_df.to_csv(
    RESULTS_PATH,
    index=False
)

print("\nModel comparison saved:")

print(
    RESULTS_PATH
)

print("\nTraining completed successfully.")