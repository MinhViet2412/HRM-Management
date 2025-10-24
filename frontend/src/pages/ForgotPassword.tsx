import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { authService } from '../services/auth'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

interface ForgotForm {
  email: string
  newPassword: string
}

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>()

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true)
    try {
      await authService.forgotPassword({ email: data.email, newPassword: data.newPassword })
      toast.success('Cập nhật mật khẩu thành công')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Cập nhật mật khẩu thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Quên mật khẩu</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Nhập email và mật khẩu mới</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                {...register('email', { required: 'Vui lòng nhập email' })}
                type="email"
                className="input mt-1"
                placeholder="Nhập email"
              />
              {errors.email && (<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>)}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <input
                {...register('newPassword', { required: 'Vui lòng nhập mật khẩu mới', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })}
                type="password"
                className="input mt-1"
                placeholder="Nhập mật khẩu mới"
              />
              {errors.newPassword && (<p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>)}
            </div>
          </div>

          <div>
            <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link to="/login" className="text-blue-600 hover:underline">Trở về đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  )
}


