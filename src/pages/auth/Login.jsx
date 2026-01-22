import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores';
import { authApi } from '@/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';

// 表单验证规则
const schema = z.object({
  account: z.string().min(1, '请输入用户名或邮箱'),
  password: z.string().min(1, '请输入密码'),
});

/**
 * 登录页面
 */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await authApi.login(data);

      // 保存登录信息到store
      login(response.data);

      toast.success('登录成功！');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || '登录失败，请检查账号密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              欢迎回来
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              登录到 WordMaster
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="用户名或邮箱"
              placeholder="请输入用户名或邮箱"
              {...register('account')}
              error={errors.account?.message}
              prefix={<UserIcon className="w-5 h-5" />}
              fullWidth
            />

            <Input
              type="password"
              label="密码"
              placeholder="请输入密码"
              {...register('password')}
              error={errors.password?.message}
              prefix={<LockClosedIcon className="w-5 h-5" />}
              fullWidth
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
            >
              登录
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              还没有账号？{' '}
              <Link
                to="/user/register"
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                立即注册
              </Link>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link
                to="/"
                className="text-gray-500 dark:text-gray-400 hover:underline"
              >
                返回首页
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
