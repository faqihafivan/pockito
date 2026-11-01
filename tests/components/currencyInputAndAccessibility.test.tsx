import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useState } from 'react';
import { CurrencyInput } from '../../src/components/ui/CurrencyInput';
import { NotificationProvider, useNotification } from '../../src/context/NotificationContext';

const TestCurrencyWrapper = ({ max, error }: { max?: number; error?: string }) => {
  const [val, setVal] = useState(150000);
  return (
    <CurrencyInput
      label="Nominal Transaksi"
      value={val}
      onValueChange={setVal}
      max={max}
      error={error}
      helperText="Masukkan angka tanpa titik atau koma"
    />
  );
};

const TestOnlineConsumer = () => {
  const { isOnline } = useNotification();
  return <div data-testid="online-status">{isOnline ? 'ONLINE' : 'OFFLINE'}</div>;
};

describe('Fase 3: Accessibility, Form Edge-Cases & Network Resilience', () => {
  it('renders CurrencyInput with proper accessibility attributes and formatted IDR value', () => {
    render(<TestCurrencyWrapper />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('Rp 150.000');
    expect(input).toHaveAttribute('inputMode', 'numeric');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('updates parsed value when typing and handles paste with clamping to max', () => {
    let capturedValue = 0;
    const handleChange = (v: number) => {
      capturedValue = v;
    };

    render(
      <CurrencyInput
        label="Budget Pagu"
        value={0}
        onValueChange={handleChange}
        max={1000000}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;

    // Simulate typing text with characters
    fireEvent.change(input, { target: { value: 'Rp 250.000' } });
    expect(capturedValue).toBe(250000);

    // Simulate paste event exceeding max limit
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => 'Rp 5.000.000',
      },
    });
    // Should be clamped to max = 1,000,000
    expect(capturedValue).toBe(1000000);
  });

  it('connects aria-describedby and role="alert" when error is provided', () => {
    render(<TestCurrencyWrapper error="Nominal melebihi batas saldo" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    const alertMsg = screen.getByRole('alert');
    expect(alertMsg).toHaveTextContent('Nominal melebihi batas saldo');
    expect(input.getAttribute('aria-describedby')).toBe(alertMsg.id);
  });

  it('toggles offline status banner and updates context when network state changes', () => {
    render(
      <NotificationProvider>
        <TestOnlineConsumer />
      </NotificationProvider>
    );

    expect(screen.getByTestId('online-status')).toHaveTextContent('ONLINE');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    // Trigger offline event
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByTestId('online-status')).toHaveTextContent('OFFLINE');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Periksa koneksi internet Anda/i);

    // Trigger online event
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.getByTestId('online-status')).toHaveTextContent('ONLINE');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
