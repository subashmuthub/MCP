import argparse
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

FEATURES = ['usageHours', 'failureCount', 'temperature', 'vibration', 'age']
LABELS = {'Healthy': 0, 'Needs Attention': 1, 'Critical': 2, 'healthy': 0, 'warning': 1, 'critical': 2}


def main():
    parser = argparse.ArgumentParser(description='Train EquipSense risk model from real labelled equipment history.')
    parser.add_argument('csv_path')
    parser.add_argument('--output', default='model.joblib')
    args = parser.parse_args()

    data = pd.read_csv(args.csv_path)
    data = data.rename(columns={
        'usage_hours': 'usageHours',
        'failure_count': 'failureCount',
        'temperature_celsius': 'temperature',
        'vibration_mm_s': 'vibration',
        'equipment_age_years': 'age',
        'risk_label': 'riskCategory',
    })
    required = FEATURES + ['riskCategory']
    missing = [column for column in required if column not in data.columns]
    if missing:
        raise SystemExit(f'Missing required columns: {", ".join(missing)}')

    data = data.dropna(subset=required).copy()
    data['riskCategory'] = data['riskCategory'].map(LABELS)
    data = data.dropna(subset=['riskCategory'])
    if len(data) < 30 or data['riskCategory'].nunique() < 2:
        raise SystemExit('At least 30 real labelled rows and two risk categories are required.')

    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(data[FEATURES])
    model = RandomForestClassifier(n_estimators=300, class_weight='balanced', random_state=42)
    model.fit(scaled_features, data['riskCategory'].astype(int))
    joblib.dump({
        'model': model,
        'scaler': scaler,
        'category_map': {0: 'Healthy', 1: 'Needs Attention', 2: 'Critical'},
        'features': FEATURES,
        'training_rows': len(data),
    }, args.output)
    print(f'Saved {args.output} using {len(data)} real labelled rows.')


if __name__ == '__main__':
    main()
