import os
import sys
import joblib
import pandas as pd
import numpy as np

# Prevent UnicodeEncodeError on Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'student_model_v4.pkl')

# Expected subject features in the model
MODULE_COLUMNS = [
    'Software_engineering_principle',
    'OOP_concept',
    'DSA',
    'ADSA',
    'ML',
    'AI',
    'image_processing',
    'QA_testing',
    'signal_and_system',
    'analog_electronics',
    'embeded_system',
    'software_architecture',
    'data_base',
    'digital_logic_design',
    'information_security',
    'devops',
    'operating_system_and_networking',
    'control_system',
    'digital_system_design_with_HDL',
    'computer_network',
    'GUI'
]

# Human-readable labels
MODULE_LABELS = {
    'Software_engineering_principle': 'Software Engineering Principle',
    'OOP_concept': 'OOP Concept',
    'DSA': 'Data Structures & Algorithms (DSA)',
    'ADSA': 'Advanced DSA (ADSA)',
    'ML': 'Machine Learning (ML)',
    'AI': 'Artificial Intelligence (AI)',
    'image_processing': 'Image Processing',
    'QA_testing': 'QA & Testing',
    'signal_and_system': 'Signal & System',
    'analog_electronics': 'Analog Electronics',
    'embeded_system': 'Embedded Systems',
    'software_architecture': 'Software Architecture',
    'data_base': 'Database Systems',
    'digital_logic_design': 'Digital Logic Design',
    'information_security': 'Information Security',
    'devops': 'DevOps',
    'operating_system_and_networking': 'Operating System & Networking',
    'control_system': 'Control Systems',
    'digital_system_design_with_HDL': 'Digital System Design with HDL',
    'computer_network': 'Computer Networks',
    'GUI': 'GUI / Frontend'
}

SPECIALIZATION_NAMES = {
    'AI_ML': 'Artificial Intelligence & Machine Learning (AI/ML)',
    'Cyber_Security': 'Cyber Security',
    'Embedded_Systems': 'Embedded Systems & Hardware',
    'Software_Development': 'Software Development'
}


def load_model():
    """Load the trained pipeline model from disk."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}. Please run train_model.py first.")
    return joblib.load(MODEL_PATH)


def predict_specialization(marks_dict):
    """
    Predict primary and secondary specializations given a dictionary of subject marks.
    Missing subjects are automatically filled with mean values by the model pipeline.

    :param marks_dict: dict of {module_name: score} (0-100)
    :return: dict with primary, secondary, and confidence rankings
    """
    model = load_model()

    # Create 1-row DataFrame with the expected columns
    row = {col: marks_dict.get(col, np.nan) for col in MODULE_COLUMNS}
    df_input = pd.DataFrame([row])

    # Predict
    probabilities = model.predict_proba(df_input)[0]
    classes = model.classes_

    # Sort specializations by confidence
    ranking = sorted(zip(classes, probabilities), key=lambda x: x[1], reverse=True)

    primary = ranking[0][0]
    secondary = ranking[1][0] if len(ranking) > 1 else None

    return {
        'primary': primary,
        'primary_label': SPECIALIZATION_NAMES.get(primary, primary),
        'primary_confidence': round(float(ranking[0][1]) * 100, 2),
        'secondary': secondary,
        'secondary_label': SPECIALIZATION_NAMES.get(secondary, secondary) if secondary else None,
        'secondary_confidence': round(float(ranking[1][1]) * 100, 2) if secondary else 0.0,
        'rankings': [
            {
                'specialization': cls,
                'label': SPECIALIZATION_NAMES.get(cls, cls),
                'confidence': round(float(prob) * 100, 2)
            }
            for cls, prob in ranking
        ]
    }


def display_result(result):
    print("\n" + "=" * 65)
    print("🎯 SPECIALIZATION PREDICTION RESULT")
    print("=" * 65)
    print(f"🥇 Primary Specialization:   {result['primary_label']}")
    print(f"   Confidence:              {result['primary_confidence']}%")
    if result.get('secondary'):
        print(f"🥈 Secondary Specialization: {result['secondary_label']}")
        print(f"   Confidence:              {result['secondary_confidence']}%")
    print("-" * 65)
    print("📊 Full Confidence Distribution:")
    for rank in result['rankings']:
        bar = "█" * int(rank['confidence'] / 5)
        print(f"   • {rank['label']:<45}: {rank['confidence']:>6.2f}%  {bar}")
    print("=" * 65 + "\n")


def interactive_mode():
    print("=" * 65)
    print("🎓 STUDENT MODULE MARKS PREDICTOR")
    print("=" * 65)
    print("Enter student marks (0-100) for each module.")
    print("Tip: You can press ENTER to leave any module blank (auto-imputed).\n")

    marks = {}
    for col in MODULE_COLUMNS:
        prompt = f"Enter marks for {MODULE_LABELS[col]} [0-100]: "
        while True:
            val = input(prompt).strip()
            if not val:
                marks[col] = np.nan
                break
            try:
                score = float(val)
                if 0 <= score <= 100:
                    marks[col] = score
                    break
                else:
                    print("  ⚠️ Score must be between 0 and 100.")
            except ValueError:
                print("  ⚠️ Please enter a valid number or press Enter to skip.")

    result = predict_specialization(marks)
    display_result(result)


if __name__ == '__main__':
    import json

    if len(sys.argv) > 1 and sys.argv[1] == '--demo':
        # Demo mode with sample student marks
        print("\n--- DEMO 1: Software Development Profile ---")
        demo_se = {
            'Software_engineering_principle': 88, 'OOP_concept': 90, 'DSA': 85,
            'software_architecture': 86, 'data_base': 82, 'GUI': 84, 'devops': 78
        }
        display_result(predict_specialization(demo_se))

        print("\n--- DEMO 2: AI & Machine Learning Profile ---")
        demo_ai = {
            'ML': 92, 'AI': 90, 'image_processing': 86, 'DSA': 78,
            'Software_engineering_principle': 65
        }
        display_result(predict_specialization(demo_ai))

    elif len(sys.argv) > 1 and sys.argv[1] in ('--raw', '-r'):
        if len(sys.argv) < 3:
            print(json.dumps({"error": "No input marks provided"}))
            sys.exit(1)
        raw_input = " ".join(sys.argv[2:]).strip()
        if os.path.exists(raw_input):
            with open(raw_input, 'r', encoding='utf-8') as f:
                marks_input = json.load(f)
        else:
            try:
                marks_input = json.loads(raw_input)
            except Exception:
                import ast
                marks_input = ast.literal_eval(raw_input)
        result = predict_specialization(marks_input)
        print(json.dumps(result))

    elif len(sys.argv) > 1 and sys.argv[1] in ('--json', '-j'):
        if len(sys.argv) < 3:
            print("⚠️ Error: Please provide a JSON string or file path after --json.")
            sys.exit(1)
        raw_input = " ".join(sys.argv[2:]).strip()
        if os.path.exists(raw_input):
            with open(raw_input, 'r', encoding='utf-8') as f:
                marks_input = json.load(f)
        else:
            try:
                marks_input = json.loads(raw_input)
            except Exception:
                import ast
                marks_input = ast.literal_eval(raw_input)
        display_result(predict_specialization(marks_input))

    else:
        interactive_mode()
