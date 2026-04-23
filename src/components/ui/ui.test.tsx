import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui';

describe('UI Component Snapshots', () => {
  it('Button should match snapshot', () => {
    const { asFragment } = render(<Button>Click Me</Button>);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Badge should match snapshot', () => {
    const { asFragment } = render(<Button variant="danger" className="bg-red-500">Danger</Button>);
    expect(asFragment()).toMatchSnapshot();
  });
});
