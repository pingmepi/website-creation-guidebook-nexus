import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { ModernCanvasManager } from '../ModernCanvasManager';
import TshirtDesignPreview from '@/components/design/TshirtDesignPreview';

vi.useFakeTimers();

describe('Canvas integration', () => {
  it('propagates canvas dataURL to preview on change', async () => {
    let latestDataUrl = '';
    const onDesignChange = (url: string) => { latestDataUrl = url; };

    render(
      <div>
        <ModernCanvasManager
          tshirtColor="#FFFFFF"
          initialImage="https://example.com/image.png"
          onDesignChange={onDesignChange}
        />
        <TshirtDesignPreview color="#FFFFFF" designImage={latestDataUrl} />
      </div>
    );

    await vi.advanceTimersByTimeAsync(500);

    expect(latestDataUrl.startsWith('data:image/png;base64,')).toBe(true);
  });
});

