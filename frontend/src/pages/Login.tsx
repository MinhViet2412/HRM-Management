import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface LoginForm {
  email: string
  password: string
}

const Login = () => {
  const { login } = useAuth()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success(t('auth.loginSuccess'))
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('auth.signInTitle')}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">{t('auth.signInSubtitle')}</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('auth.emailAddress')}</label>
              <input
                {...register('email', {
                  required: t('auth.emailRequired'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('auth.emailInvalid'),
                  },
                })}
                type="email"
                className="input mt-1"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('auth.password')}</label>
              <input
                {...register('password', {
                  required: t('auth.passwordRequired'),
                  minLength: {
                    value: 6,
                    message: t('auth.passwordMin'),
                  },
                })}
                type="password"
                className="input mt-1"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">{t('auth.demoCreds')}</p>
            <a href="/forgot-password" className="text-blue-600 hover:underline">{t('auth.forgotPassword') || 'Quên mật khẩu?'}</a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
