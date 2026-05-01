import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Status',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Completed',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Pending',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'High Risk',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Upcoming',
  },
};

export const WithScreenReaderText: Story = {
  args: {
    variant: 'success',
    children: '✓',
    srText: 'Task completed successfully',
  },
};
