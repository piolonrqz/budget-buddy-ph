import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, apiClient } from '@salary-tracker/shared';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      setAuth(response.data.user, response.data.access_token);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login failed', error);
      setLoginError(error.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-canvas-dark text-on-dark flex items-center justify-center p-xl">
      <div className="w-full max-w-md space-y-block">
        <div className="text-center">
          <h1 className="text-[64px] leading-[1.0] tracking-tight font-display mb-sm">Log in</h1>
          <p className="text-on-dark-mute text-body-md">Welcome back to Salary Tracker</p>
        </div>

        <Card variant="glass-dark" className="space-y-xl">
          <form onSubmit={handleSubmit} className="space-y-md">
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
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" fullWidth size="lg">
              Log in
            </Button>
            {loginError && <p className="text-accent-danger text-center text-sm">{loginError}</p>}
          </form>
          
          <div className="text-center mt-md">
            <p className="text-sm text-on-dark-mute">
              Don't have an account?{' '}
              <Link to="/register" className="text-on-dark hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
