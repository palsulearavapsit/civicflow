import { render } from '@testing-library/react';
import { Badge } from './index';
import { describe, it, expect } from 'vitest';

describe('Badge Component', () => {
  it('renders correctly with default variant', () => {
    const { asFragment } = render(<Badge>Test Badge</Badge>);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with success variant', () => {
    const { asFragment } = render(<Badge variant="success">Success</Badge>);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with danger variant', () => {
    const { asFragment } = render(<Badge variant="danger">Error</Badge>);
    expect(asFragment()).toMatchSnapshot();
  });

  it('contains the correct text', () => {
    const { getByText } = render(<Badge>VOTER</Badge>);
    expect(getByText('VOTER')).toBeInTheDocument();
  });
});
