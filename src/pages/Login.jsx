import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loginUser, registerUser, loginWithGoogle, resetPassword } from '../services/authService'
import toast from 'react-hot-toast'
import logo from '../assets/logo.svg'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
})

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'reset'
  const navigate = useNavigate()
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }) => {
    try {
      if (mode === 'register') {
        await registerUser(email, password)
        toast.success('Account created — welcome!')
      } else {
        await loginUser(email, password)
        toast.success('Welcome back!')
      }
      navigate('/dashboard')
    } catch (e) {
      const msg = e.code === 'auth/invalid-credential' ? 'Invalid email or password'
        : e.code === 'auth/email-already-in-use' ? 'Email already registered'
        : e.code === 'auth/operation-not-allowed' ? 'Email/password sign-in is not enabled — check Firebase console'
        : e.message
      toast.error(msg)
    }
  }

  const handleGoogle = async () => {
    try {
      await loginWithGoogle()
      toast.success('Signed in with Google!')
      navigate('/dashboard')
    } catch (e) {
      toast.error(e.message)
    }
  }

  const handleReset = async () => {
    const email = getValues('email')
    if (!email) { toast.error('Enter your email first'); return }
    try {
      await resetPassword(email)
      toast.success('Password reset email sent')
      setMode('login')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#029aff]/5 via-white to-[#0E9F6E]/5 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Bill Receipt" className="w-14 h-14 mb-3" />
          <h1 className="text-2xl font-bold text-[#020202]">Bill Receipt</h1>
          <p className="text-sm text-gray-400 mt-1">Simple invoicing for modern businesses.</p>
        </div>

        <h2 className="text-base font-semibold text-gray-800 mb-5">
          {mode === 'register' ? 'Create your account' : mode === 'reset' ? 'Reset password' : 'Sign in'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email')} type="email" placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#029aff]/30 transition" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('reset')} className="text-xs text-[#029aff] hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <input {...register('password')} type="password" placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#029aff]/30 transition" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
          )}

          {mode === 'reset' ? (
            <button type="button" onClick={handleReset}
              className="w-full bg-[#029aff] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-600 transition">
              Send Reset Email
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-[#029aff] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition">
              {isSubmitting ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          )}
        </form>

        {mode !== 'reset' && (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <button onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition">
              <GoogleIcon /> Continue with Google
            </button>
          </>
        )}

        <p className="text-center text-sm text-gray-500 mt-5">
          {mode === 'reset' ? (
            <button onClick={() => setMode('login')} className="text-[#029aff] font-medium hover:underline">Back to sign in</button>
          ) : mode === 'register' ? (
            <>Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-[#029aff] font-medium hover:underline">Sign in</button>
            </>
          ) : (
            <>No account?{' '}
              <button onClick={() => setMode('register')} className="text-[#029aff] font-medium hover:underline">Register free</button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
