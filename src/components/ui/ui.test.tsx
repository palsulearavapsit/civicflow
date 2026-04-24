import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button, Badge } from '@/components/ui';

describe('UI Component Snapshots', () => {
  it('Button should match snapshot', () => {
    const { asFragment } = render(<Button>Click Me</Button>);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Badge should match snapshot', () => {
    const { asFragment } = render(<Badge variant="danger">Danger</Badge>);
    expect(asFragment()).toMatchSnapshot();
  });
});
