import axios from 'axios';

function baseUrl() {
  return process.env.ML_SERVICE_URL || 'http://localhost:5001';
}

export async function getPrediction(payload) {
  const response = await axios.post(`${baseUrl()}/predict`, payload);
  return response.data;
}

export async function getModelHealth() {
  const response = await axios.get(`${baseUrl()}/health`);
  return response.data;
}
