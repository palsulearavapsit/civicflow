import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Search, ArrowRight, Save, Trash } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'success'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Action',
    leftIcon: <Trash size={16} />,
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success State',
    rightIcon: <Save size={16} />,
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Processing...',
  },
};

export const WithIcons: Story = {
  args: {
    leftIcon: <Search size={16} />,
    rightIcon: <ArrowRight size={16} />,
    children: 'Search and Continue',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};
