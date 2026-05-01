import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Mail, Lock, User } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'John Doe',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'john@example.com',
    leftAddon: <Mail size={18} />,
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    leftAddon: <Lock size={18} />,
  },
};

export const Required: Story = {
  args: {
    label: 'Username',
    required: true,
    placeholder: 'voter123',
    leftAddon: <User size={18} />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Zip Code',
    placeholder: '12345',
    error: 'Please enter a valid 5-digit zip code.',
    value: 'abc',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Phone Number',
    placeholder: '(555) 000-0000',
    helperText: 'We only use this for registration alerts.',
  },
};
