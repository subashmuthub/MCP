# MongoDB Collections

EquipSense AI uses MongoDB collections instead of SQL tables. The main collections are:

- `users`
- `equipment`
- `usageLogs`
- `maintenanceRecords`
- `predictionResults`
- `maintenanceTickets`

## Suggested Document Shape

### equipment

```json
{
  "name": "Microscope A1",
  "category": "optics",
  "serialNumber": "EQ-1001",
  "location": "Lab 1",
  "status": "healthy",
  "createdAt": "2026-07-03T00:00:00.000Z",
  "updatedAt": "2026-07-03T00:00:00.000Z"
}
```

### predictionResults

```json
{
  "equipmentId": "ObjectId",
  "equipmentName": "Microscope A1",
  "riskScore": 72,
  "predictedDaysToFailure": 6,
  "status": "critical",
  "createdAt": "2026-07-03T00:00:00.000Z",
  "updatedAt": "2026-07-03T00:00:00.000Z"
}
```

### maintenanceTickets

```json
{
  "equipmentId": "ObjectId",
  "equipmentName": "Microscope A1",
  "title": "Inspect Microscope A1",
  "priority": "high",
  "status": "open",
  "createdAt": "2026-07-03T00:00:00.000Z",
  "updatedAt": "2026-07-03T00:00:00.000Z"
}
```
