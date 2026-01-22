import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores';
import { authApi } from '@/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';


const schema = z
  .object({
    username: z
      .string()
      .min(3, '用户名至少3个字符')
      .max(50, '用户名最多50个字符')
      .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字、下划线'),
    email: z.string().email('请输入有效的邮箱地址'),
    password: z
      .string()
      .min(6, '密码至少6个字符')
      .max(20, '密码最多20个字符')
      .regex(/[a-zA-Z]/, '密码必须包含字母')
      .regex(/\d/, '密码必须包含数字'),
    confirmPassword: z.string(),
    nickname: z.string().max(50, '昵称最多50个字符').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  });

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange', // 开启实时验证
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
        nickname: data.nickname || data.username,
      });
      login(response.data);
      toast.success('注册成功！');
      navigate('/dashboard');
    } catch (error) {
      toast.error(
        error.response?.data?.message || '注册失败，请检查输入信息'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              创建账号
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              注册 WordMaster 账号
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="用户名"
              placeholder="3-50个字符，字母数字下划线"
              {...register('username')}
              error={errors.username?.message}
              prefix={<UserIcon className="w-5 h-5" />}
              fullWidth
            />

            <Input
              type="email"
              label="邮箱"
              placeholder="your@email.com"
              {...register('email')}
              error={errors.email?.message}
              prefix={<EnvelopeIcon className="w-5 h-5" />}
              fullWidth
            />

            <Input
              type="password"
              label="密码"
              placeholder="6-20个字符，包含字母和数字"
              {...register('password')}
              error={errors.password?.message}
              prefix={<LockClosedIcon className="w-5 h-5" />}
              fullWidth
            />

            <Input
              type="password"
              label="确认密码"
              placeholder="再次输入密码"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              prefix={<LockClosedIcon className="w-5 h-5" />}
              fullWidth
            />

            <Input
              label="昵称（可选）"
              placeholder="显示名称"
              {...register('nickname')}
              error={errors.nickname?.message}
              prefix={<UserCircleIcon className="w-5 h-5" />}
              fullWidth
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
            >
              注册
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              已有账号？{' '}
              <Link
                to="/user/login"
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                立即登录
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

export default Register;