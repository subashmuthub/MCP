FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

# Use gunicorn as a production WSGI server
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "app:app", "--workers", "2", "--threads", "2", "--timeout", "120"]
