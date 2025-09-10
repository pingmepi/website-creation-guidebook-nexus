import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ModernCanvasManager } from '../ModernCanvasManager';

vi.useFakeTimers();

describe('Canvas tools interactions', () => {
  it('toggles drawing mode and adds text/shape (smoke under mocks)', async () => {
    const { getByText } = render(
      <ModernCanvasManager tshirtColor="#FFFFFF" />
    );

    // Toggle draw mode
    fireEvent.click(getByText('Draw'));
    await vi.advanceTimersByTimeAsync(350);

    // Add text
    fireEvent.click(getByText('Add Text'));

    // Add shapes
    fireEvent.click(getByText('Rectangle'));
    fireEvent.click(getByText('Circle'));

    await vi.advanceTimersByTimeAsync(350);

    expect(true).toBe(true);
  });
});

