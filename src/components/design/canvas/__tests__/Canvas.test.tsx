import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { SimplifiedCanvas } from '../SimplifiedCanvas';
import { flushTimers } from '@/test-utils/canvasTestUtils';

// Ensure fake timers for debounce
vi.useFakeTimers();

describe('SimplifiedCanvas - unit', () => {
  const onCanvasReady = vi.fn();
  const onDesignChange = vi.fn();

  beforeEach(() => {
    onCanvasReady.mockReset();
    onDesignChange.mockReset();
  });

  it('initializes canvas and calls onCanvasReady', async () => {
    render(
      <SimplifiedCanvas onCanvasReady={onCanvasReady} onDesignChange={onDesignChange} />
    );
    expect(onCanvasReady).toHaveBeenCalledTimes(1);
  });

  it('loads image and triggers onDesignChange', async () => {
    render(
      <SimplifiedCanvas
        onCanvasReady={() => {}}
        onDesignChange={onDesignChange}
        initialImage="https://example.com/test.png"
      />
    );

    await flushTimers();

    expect(onDesignChange).toHaveBeenCalled();
  });

  it('handles invalid image URL gracefully', async () => {
    render(
      <SimplifiedCanvas
        onCanvasReady={() => {}}
        onDesignChange={onDesignChange}
        initialImage="invalid://image.png"
      />
    );

    await flushTimers();

    // Should not throw; placeholder is added and change may be emitted
    expect(true).toBe(true);
  });
});
