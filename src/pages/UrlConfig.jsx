import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ServerIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useConfigStore } from '@/stores';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';

// 表单验证规则
const schema = z.object({
  baseURL: z
    .string()
    .min(1, '请输入后端地址')
    .url('请输入有效的URL地址')
    .refine((url) => !url.endsWith('/'), {
      message: 'URL不应以斜杠结尾',
    }),
});

/**
 * 后端URL配置页面
 */
const UrlConfig = () => {
  const navigate = useNavigate();
  const { baseURL, setBaseURL, testConnection } = useConfigStore();
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      baseURL: baseURL || 'http://localhost:8000',
    },
  });

  // 测试连接
  const handleTestConnection = async (data) => {
    setIsTesting(true);
    setTestSuccess(false);

    try {
      // 直接测试连接，不保存到 store
      await testConnection(data.baseURL);

      setTestSuccess(true);
      toast.success('连接成功！');
    } catch (error) {
      setTestSuccess(false);
      toast.error(error.message || '连接失败，请检查后端地址');
    } finally {
      setIsTesting(false);
    }
  };

  // 保存配置
  const handleSave = (data) => {
    if (!testSuccess) {
      toast.error('请先测试连接');
      return;
    }

    setBaseURL(data.baseURL);
    toast.success('配置已保存');
    setTimeout(() => {
      navigate('/user/login');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ServerIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              配置后端地址
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              请输入您的后端API地址
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleTestConnection)} className="space-y-6">
            <Input
              label="后端地址"
              placeholder="http://localhost:8000"
              {...register('baseURL')}
              error={errors.baseURL?.message}
              helperText="例如：http://localhost:8000 或 https://api.example.com"
              prefix={<ServerIcon className="w-5 h-5" />}
              fullWidth
            />

            {/* Test Connection Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isTesting}
              disabled={testSuccess}
            >
              {testSuccess ? (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>连接成功</span>
                </div>
              ) : (
                '测试连接'
              )}
            </Button>

            {/* Save Button */}
            {testSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  type="button"
                  variant="success"
                  fullWidth
                  onClick={handleSubmit(handleSave)}
                >
                  保存并继续
                </Button>
              </motion.div>
            )}
          </form>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 提示：确保后端服务已启动，并且网络可以访问
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default UrlConfig;
