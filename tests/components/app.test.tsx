import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('Pockito End-to-End Navigation & Render Test', () => {
  it('renders landing page with headline and Saweria branding', () => {
    render(<App />);
    expect(screen.getByText(/One Workspace for Your Money & Your Life/i)).toBeInTheDocument();
    expect(screen.getByText(/Tanpa Ribet Akuntansi/i)).toBeInTheDocument();
    expect(screen.getByText(/Mulai Pakai Pockito Sekarang/i)).toBeInTheDocument();
    expect(screen.getByText(/Lihat Tour Play Store/i)).toBeInTheDocument();
  });
});

