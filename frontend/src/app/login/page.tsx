'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isRegister, setIsRegister] = useState(false);
  
  const { login, register, isLoading } = useAuthStore();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isRegister) {
        await register(email, password, role);
      } else {
        await login(email, password);
      }
      router.push('/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            
            {isRegister && (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="student">Student</option>
                <option value="tpo">TPO</option>
                <option value="faculty">Faculty</option>
              </select>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : (isRegister ? 'Register' : 'Sign In')}
          </button>
          
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-blue-600 hover:underline"
          >
            {isRegister ? 'Already have account? Sign In' : 'Need account? Register'}
          </button>
        </form>
      </div>
    </div>
  );
}