import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RiskPage from '../pages/RiskPage.jsx';

vi.mock('../lib/api.js', () => ({
  apiRequest: vi.fn((path) => {
    if (path === '/api/equipment') return Promise.resolve({ data: [] });
    if (path === '/api/predictions') return Promise.resolve({ data: [] });
    if (path === '/api/predictions/status') return Promise.resolve({ mlReady: false });
    return Promise.resolve({ data: [] });
  }),
}));

describe('RiskPage', () => {
  it('keeps Run Prediction disabled without a trained model and real log data', async () => {
    render(<RiskPage />);
    const button = await screen.findByRole('button', { name: /Run Prediction/i });
    expect(button.disabled).toBe(true);
  });
});
