import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, apiClient } from '@salary-tracker/shared';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const validatePassword = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      setPasswordError('Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
      return;
    }
    setPasswordError('');
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      setAuth(response.data.user, response.data.access_token);
      navigate('/salary-setup');
    } catch (error: any) {
      console.error('Registration failed', error);
      setRegisterError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-canvas-dark text-on-dark flex items-center justify-center p-xl">
      <div className="w-full max-w-md space-y-block">
        <div className="text-center">
          <h1 className="text-[64px] leading-[1.0] tracking-tight font-display mb-sm">Join us</h1>
          <p className="text-on-dark-mute text-body-md">Start tracking your salary today</p>
        </div>

        <Card variant="glass-dark" className="space-y-xl">
          <form onSubmit={handleSubmit} className="space-y-md">
            <Input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
              required
            />
            <Button type="submit" variant="primary" fullWidth size="lg">
              Sign up
            </Button>
            {registerError && <p className="text-accent-danger text-center text-sm">{registerError}</p>}
          </form>
          
          <div className="text-center mt-md">
            <p className="text-sm text-on-dark-mute">
              Already have an account?{' '}
              <Link to="/login" className="text-on-dark hover:underline font-semibold">
                Log in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
