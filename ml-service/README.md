# Real-data prediction setup

The ML service does not train from generated or placeholder rows. It only predicts when a validated `model.joblib` trained from real labelled equipment history is present.

## Required CSV columns

- `usageHours`
- `failureCount`
- `temperature`
- `vibration`
- `age`
- `riskCategory` with values `Healthy`, `Needs Attention`, or `Critical`

Each row must represent a real equipment observation. The `riskCategory` label must come from a confirmed maintenance or failure outcome, not from a formula-generated score.

## Train the model

```powershell
pip install -r requirements.txt
python train_model.py path\to\real_equipment_history.csv --output model.joblib
```

The training command requires at least 30 labelled rows and at least two risk categories. Keep `model.joblib` private and deploy it with the ML service. Set `MODEL_PATH` if it is stored outside `/app/model.joblib`.

Without this artifact, `/health` reports `ml_ready: false` and `/predict` returns HTTP 503. The backend will not create a prediction record in that state.

## Data quality requirements

Temperature and vibration must be measured sensor values. Failure count must be an actual recorded count. Usage hours and equipment age must come from the equipment or usage records. Missing values must be collected before prediction; the application does not infer them.

The `predictedDaysToFailure` field is intentionally not generated. A reliable time-to-failure estimate requires a separate survival or regression model trained on dated failure events.

## Export from the application database

From the backend directory, after logging complete usage measurements and confirmed risk labels:

```powershell
npm run export-training-data
```

This writes `training-data.csv`. Then train and deploy it:

```powershell
cd ..\ml-service
python train_model.py ..\zbackend\training-data.csv --output model.joblib
```
