import os
import joblib
import pandas as pd
import re
import shap

# =========================================================
# Load trained model
# =========================================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "model.pkl"
)

model_bundle = joblib.load(MODEL_PATH)

model = model_bundle["model"]


# =========================================================
# API → UCI dataset column mapping
# =========================================================

COLUMN_MAPPING = {

    "marital_status":
        "Marital status",

    "application_mode":
        "Application mode",

    "application_order":
        "Application order",

    "course":
        "Course",

    "daytime_evening_attendance":
        "Daytime/evening attendance",

    "previous_qualification":
        "Previous qualification",

    "previous_qualification_grade":
        "Previous qualification (grade)",

    "nationality":
        "Nacionality",

    "mothers_qualification":
        "Mother's qualification",

    "fathers_qualification":
        "Father's qualification",

    "mothers_occupation":
        "Mother's occupation",

    "fathers_occupation":
        "Father's occupation",

    "admission_grade":
        "Admission grade",

    "displaced":
        "Displaced",

    "educational_special_needs":
        "Educational special needs",

    "debtor":
        "Debtor",

    "tuition_fees_up_to_date":
        "Tuition fees up to date",

    "gender":
        "Gender",

    "scholarship_holder":
        "Scholarship holder",

    "age_at_enrollment":
        "Age at enrollment",

    "international":
        "International",

    "curricular_units_1st_sem_credited":
        "Curricular units 1st sem (credited)",

    "curricular_units_1st_sem_enrolled":
        "Curricular units1st sem (enrolled)",

    "curricular_units_1st_sem_evaluations":
        "Curricular units 1st sem (evaluations)",

    "curricular_units_1st_sem_approved":
        "Curricular units 1st sem (approved)",

    "curricular_units_1st_sem_grade":
        "Curricular units 1st sem (grade)",

    "curricular_units_1st_sem_without_evaluations":
        "Curricular units 1st sem (without evaluations)",

    "curricular_units_2nd_sem_credited":
        "Curricular units 2nd sem (credited)",

    "curricular_units_2nd_sem_enrolled":
        "Curricular units 2nd sem (enrolled)",

    "curricular_units_2nd_sem_evaluations":
        "Curricular units 2nd sem (evaluations)",

    "curricular_units_2nd_sem_approved":
        "Curricular units 2nd sem (approved)",

    "curricular_units_2nd_sem_grade":
        "Curricular units 2nd sem (grade)",

    "curricular_units_2nd_sem_without_evaluations":
        "Curricular units 2nd sem (without evaluations)",

    "unemployment_rate":
        "Unemployment rate",

    "inflation_rate":
        "Inflation rate",

    "gdp":
        "GDP"
}


# =========================================================
# Normalize column names
# =========================================================

def normalize_column_name(name):

    return re.sub(
        r"[^a-z0-9]",
        "",
        str(name).lower()
    )


# =========================================================
# Get model feature names
# =========================================================

try:

    expected_columns = list(
        model.feature_names_in_
    )

except AttributeError:

    expected_columns = list(
        model.named_steps[
            "preprocessing"
        ].feature_names_in_
    )


normalized_expected_columns = {
    normalize_column_name(column): column
    for column in expected_columns
}


# =========================================================
# Project-specific risk factors
# =========================================================

def calculate_context_risk(student_data: dict):

    score = 0

    factors = []


    # -----------------------------------------------------
    # CGPA
    # -----------------------------------------------------

    cgpa = float(
        student_data.get(
            "cgpa",
            0
        )
    )

    if cgpa > 0:

        if cgpa < 5.0:

            score += 20

            factors.append(
                "Very low CGPA"
            )

        elif cgpa < 6.0:

            score += 12

            factors.append(
                "Low CGPA"
            )

        elif cgpa < 7.0:

            score += 5

            factors.append(
                "Moderate CGPA"
            )


    # -----------------------------------------------------
    # Attendance
    # -----------------------------------------------------

    attendance = float(
        student_data.get(
            "attendance",
            100
        )
    )

    if attendance < 60:

        score += 20

        factors.append(
            "Very low attendance"
        )

    elif attendance < 75:

        score += 12

        factors.append(
            "Low attendance"
        )

    elif attendance < 85:

        score += 5


    # -----------------------------------------------------
    # Backlogs
    # -----------------------------------------------------

    backlogs = int(
        student_data.get(
            "backlogs",
            0
        )
    )

    if backlogs >= 4:

        score += 20

        factors.append(
            "Multiple academic backlogs"
        )

    elif backlogs >= 2:

        score += 12

        factors.append(
            "Academic backlogs"
        )

    elif backlogs == 1:

        score += 5


    # -----------------------------------------------------
    # Study hours
    # -----------------------------------------------------

    study_hours = float(
        student_data.get(
            "study_hours",
            0
        )
    )

    if study_hours > 0:

        if study_hours < 2:

            score += 10

            factors.append(
                "Low study hours"
            )

        elif study_hours < 4:

            score += 5


    # -----------------------------------------------------
    # Financial difficulty
    # -----------------------------------------------------

    financial_difficulty = int(
        student_data.get(
            "financial_difficulty",
            0
        )
    )

    if financial_difficulty == 2:

        score += 15

        factors.append(
            "High financial difficulty"
        )

    elif financial_difficulty == 1:

        score += 8

        factors.append(
            "Financial difficulty"
        )


    # -----------------------------------------------------
    # Assignment completion
    # -----------------------------------------------------

    assignment_completion = float(
        student_data.get(
            "assignment_completion",
            100
        )
    )

    if assignment_completion < 50:

        score += 10

        factors.append(
            "Low assignment completion"
        )

    elif assignment_completion < 70:

        score += 5


    # -----------------------------------------------------
    # Limit context score
    # -----------------------------------------------------

    score = min(
        score,
        100
    )


    return score, factors


# =========================================================
# SHAP EXPLANATION
# =========================================================

def generate_shap_explanation(data):

    """
    Generate Explainable AI information for the
    trained machine-learning model.

    The explanation shows which original UCI
    features influenced the prediction most.
    """

    try:

        # -------------------------------------------------
        # Get preprocessing pipeline
        # -------------------------------------------------

        preprocessing = model.named_steps[
            "preprocessing"
        ]

        trained_model = model.named_steps[
            "model"
        ]


        # -------------------------------------------------
        # Transform input using exactly the same
        # preprocessing used during training
        # -------------------------------------------------

        transformed_data = preprocessing.transform(
            data
        )


        # -------------------------------------------------
        # Get transformed feature names
        # -------------------------------------------------

        try:

            transformed_feature_names = (
                preprocessing
                .get_feature_names_out()
                .tolist()
            )

        except Exception:

            transformed_feature_names = [
                f"Feature {i + 1}"
                for i in range(
                    transformed_data.shape[1]
                )
            ]


        # -------------------------------------------------
        # Create SHAP explainer
        # -------------------------------------------------

        explainer = shap.TreeExplainer(
            trained_model
        )


        # -------------------------------------------------
        # Calculate SHAP values
        # -------------------------------------------------

        shap_values = explainer.shap_values(
            transformed_data
        )


        # -------------------------------------------------
        # Handle different SHAP output formats
        # -------------------------------------------------

        if isinstance(
            shap_values,
            list
        ):

            if len(shap_values) > 1:

                shap_values = shap_values[1]

            else:

                shap_values = shap_values[0]


        # New SHAP Explanation format

        if hasattr(
            shap_values,
            "values"
        ):

            shap_values = (
                shap_values.values
            )


        # Convert to numpy-like values

        if hasattr(
            shap_values,
            "toarray"
        ):

            shap_values = (
                shap_values.toarray()
            )


        # -------------------------------------------------
        # Make sure shape is correct
        # -------------------------------------------------

        shap_values = shap_values[0]


        # -------------------------------------------------
        # Aggregate transformed features back to
        # original UCI features
        # -------------------------------------------------

        feature_importance = []


        for original_column in expected_columns:

            matching_indexes = []


            # Find all transformed features
            # belonging to this original column

            for index, transformed_name in enumerate(
                transformed_feature_names
            ):

                clean_name = transformed_name

                if clean_name.startswith(
                    "numeric__"
                ):

                    clean_name = clean_name[
                        len("numeric__"):
                    ]

                elif clean_name.startswith(
                    "categorical__"
                ):

                    clean_name = clean_name[
                        len("categorical__"):
                    ]


                if (
                    clean_name == original_column
                    or clean_name.startswith(
                        original_column + "_"
                    )
                ):

                    matching_indexes.append(
                        index
                    )


            if not matching_indexes:

                continue


            # -------------------------------------------------
            # Sum signed SHAP contribution
            # -------------------------------------------------

            signed_value = sum(
                float(
                    shap_values[index]
                )
                for index in matching_indexes
            )


            # -------------------------------------------------
            # Sum absolute contribution
            # -------------------------------------------------

            absolute_value = sum(
                abs(
                    float(
                        shap_values[index]
                    )
                )
                for index in matching_indexes
            )


            feature_importance.append({

                "feature":
                    original_column,

                "impact":
                    round(
                        absolute_value,
                        4
                    ),

                "direction":
                    (
                        "increases_dropout_risk"
                        if signed_value > 0
                        else "reduces_dropout_risk"
                    )
            })


        # -------------------------------------------------
        # Sort by strongest impact
        # -------------------------------------------------

        feature_importance.sort(
            key=lambda item:
                item["impact"],
            reverse=True
        )


        # -------------------------------------------------
        # Keep top 8 features
        # -------------------------------------------------

        top_features = (
            feature_importance[:8]
        )


        return top_features


    except Exception as error:

        print(
            "SHAP explanation error:",
            str(error)
        )

        return []


# =========================================================
# Main prediction function
# =========================================================

def predict_dropout(student_data: dict):

    converted_data = {}


    # -----------------------------------------------------
    # Convert API fields to model fields
    # -----------------------------------------------------

    for api_name, preferred_name in COLUMN_MAPPING.items():

        if api_name not in student_data:

            raise ValueError(
                f"Missing input field: {api_name}"
            )


        normalized_name = (
            normalize_column_name(
                preferred_name
            )
        )


        if (
            normalized_name
            not in normalized_expected_columns
        ):

            raise ValueError(
                f"Model column not found: {preferred_name}"
            )


        actual_column = (
            normalized_expected_columns[
                normalized_name
            ]
        )


        converted_data[
            actual_column
        ] = student_data[
            api_name
        ]


    # -----------------------------------------------------
    # Create DataFrame
    # -----------------------------------------------------

    data = pd.DataFrame(
        [converted_data]
    )


    # -----------------------------------------------------
    # Match training column order
    # -----------------------------------------------------

    data = data[
        expected_columns
    ]


    # -----------------------------------------------------
    # UCI ML prediction
    # -----------------------------------------------------

    prediction = model.predict(
        data
    )[0]


    # -----------------------------------------------------
    # ML probabilities
    # -----------------------------------------------------

    probabilities = model.predict_proba(
        data
    )[0]


    ml_probability = (
        float(
            probabilities[1]
        ) * 100
    )


    # -----------------------------------------------------
    # Student-specific context risk
    # -----------------------------------------------------

    context_score, factors = (
        calculate_context_risk(
            student_data
        )
    )


    # -----------------------------------------------------
    # SHAP explanation
    # -----------------------------------------------------

    shap_explanation = (
        generate_shap_explanation(
            data
        )
    )


    # -----------------------------------------------------
    # Combine ML + student context
    #
    # ML = 70%
    # Context = 30%
    # -----------------------------------------------------

    final_risk = (

        ml_probability * 0.70

        +

        context_score * 0.30
    )


    final_risk = round(
        min(
            final_risk,
            100
        ),
        2
    )


    # -----------------------------------------------------
    # Final risk level
    # -----------------------------------------------------

    if final_risk >= 70:

        risk_level = "HIGH"

    elif final_risk >= 40:

        risk_level = "MEDIUM"

    else:

        risk_level = "LOW"


    # -----------------------------------------------------
    # Final prediction
    # -----------------------------------------------------

    final_prediction = (

        1
        if final_risk >= 50
        else 0
    )


    # -----------------------------------------------------
    # Return complete result
    # -----------------------------------------------------

    return {

        "prediction":
            final_prediction,

        "risk_percentage":
            final_risk,

        "risk_level":
            risk_level,

        "ml_probability":
            round(
                ml_probability,
                2
            ),

        "context_risk":
            context_score,

        "risk_factors":
            factors,

        "shap_explanation":
            shap_explanation
    }