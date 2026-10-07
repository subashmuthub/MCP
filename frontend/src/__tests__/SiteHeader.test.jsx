import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SiteHeader from '../components/SiteHeader.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { MemoryRouter } from 'react-router-dom';

describe('SiteHeader', () => {
  it('does not render on the home page because the landing page has its own nav', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <SiteHeader />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.queryByText('EquipSense AI')).toBeNull();
  });
});
