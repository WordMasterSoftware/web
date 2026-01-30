import { useState, useEffect, Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  LockClosedIcon,
  CpuChipIcon,
  ServerIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore, useConfigStore } from '@/stores';
import { authApi } from '@/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import { cn } from '@/utils';

// 个人资料验证规则
const profileSchema = z.object({
  nickname: z.string().max(50, '昵称最多50个字符').optional(),
  avatarUrl: z
    .string()
    .url('请输入有效的URL地址')
    .or(z.literal(''))
    .optional(),
});

// 修改密码验证规则
const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, '请输入旧密码'),
    newPassword: z
      .string()
      .min(6, '密码至少6个字符')
      .max(20, '密码最多20个字符')
      .regex(/[a-zA-Z]/, '密码必须包含字母')
      .regex(/\d/, '密码必须包含数字'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  });

/**
 * 用户设置页面
 */
const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { baseURL, clearConfig } = useConfigStore();
  const [activeTab, setActiveTab] = useState(0);
  const [isSwitchServerModalOpen, setIsSwitchServerModalOpen] = useState(false);

  // 个人资料表单
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: user?.nickname || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  // 修改密码表单
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // LLM配置表单
  const [llmConfig, setLlmConfig] = useState({
    useDefaultLlm: user?.useDefaultLlm ?? true,
    llmApiKey: '',
    llmBaseUrl: '',
    llmModel: '',
  });
  const [isLoadingLlm, setIsLoadingLlm] = useState(false);

  // 获取LLM配置
  const fetchLlmConfig = async () => {
    setIsLoadingLlm(true);
    try {
      const response = await authApi.getLlmConfig();
      setLlmConfig({
        useDefaultLlm: response.data.use_default_llm,
        llmApiKey: '', // API Key不返回
        llmBaseUrl: response.data.llm_base_url || '',
        llmModel: response.data.llm_model || '',
      });
    } catch (error) {
      toast.error('获取LLM配置失败');
      console.log(error);
    } finally {
      setIsLoadingLlm(false);
    }
  };

  // 初始化时获取LLM配置
  useEffect(() => {
    if (activeTab === 2) {
      fetchLlmConfig();
    }
  }, [activeTab]);

  // 更新个人资料
  const onSubmitProfile = async (data) => {
    try {
      const response = await authApi.updateProfile({
        nickname: data.nickname,
        avatar_url: data.avatarUrl,
      });

      updateUser(response.data);
      toast.success('个人资料已更新');
    } catch (error) {
      toast.error('更新失败，请重试');
      console.log(error);
    }
  };

  // 修改密码
  const onSubmitPassword = async (data) => {
    try {
      await authApi.changePassword({
        old_password: data.oldPassword,
        new_password: data.newPassword,
      });

      toast.success('密码修改成功');
      resetPassword();
    } catch (error) {
      toast.error(
        error.response?.data?.message || '修改失败，请检查旧密码'
      );
    }
  };

  // 更新LLM配置
  const onSubmitLlm = async () => {
    setIsLoadingLlm(true);
    try {
      await authApi.updateLlmConfig({
        use_default_llm: llmConfig.useDefaultLlm,
        llm_api_key: llmConfig.llmApiKey,
        llm_base_url: llmConfig.llmBaseUrl,
        llm_model: llmConfig.llmModel,
      });

      toast.success('LLM配置已更新');
    } catch (error) {
      toast.error('更新失败，请重试');
      console.log(error);
    } finally {
      setIsLoadingLlm(false);
    }
  };

  // 切换服务器地址 - 打开弹窗
  const handleSwitchServer = () => {
    setIsSwitchServerModalOpen(true);
  };

  // 确认切换服务器
  const confirmSwitchServer = () => {
    // 1. 清除 Auth Store
    logout();

    // 2. 清除 Config Store
    clearConfig();

    // 3. 清除 Cookie (简单遍历清除)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // 4. 关闭弹窗并跳转
    setIsSwitchServerModalOpen(false);
    toast.success('已重置服务器配置');
    navigate('/url-config');
  };

  const tabs = [
    { name: '个人资料', icon: UserCircleIcon },
    { name: '修改密码', icon: LockClosedIcon },
    { name: 'LLM配置', icon: CpuChipIcon },
    { name: '服务器配置', icon: ServerIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          个人设置
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          管理您的账号信息和偏好设置
        </p>
      </div>

      <Card>
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          {/* Tab List */}
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-dark-hover p-1">
            {tabs.map((tab) => (
              <Tab key={tab.name} as={Fragment}>
                {({ selected }) => (
                  <button
                    className={cn(
                      'w-full flex items-center justify-center space-x-2 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                      selected
                        ? 'bg-white dark:bg-dark-surface text-primary-700 dark:text-primary-400 shadow'
                        : 'text-gray-700 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-dark-surface/50'
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                )}
              </Tab>
            ))}
          </Tab.List>

          {/* Tab Panels */}
          <Tab.Panels className="mt-8">
            {/* 个人资料 */}
            <Tab.Panel>
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                <Input
                  label="昵称"
                  placeholder="显示名称"
                  {...registerProfile('nickname')}
                  error={profileErrors.nickname?.message}
                  fullWidth
                />

                <Input
                  label="头像URL"
                  placeholder="https://example.com/avatar.jpg"
                  {...registerProfile('avatarUrl')}
                  error={profileErrors.avatarUrl?.message}
                  helperText="请输入有效的图片URL地址"
                  fullWidth
                />

                <div className="flex justify-end">
                  <Button type="submit" variant="primary">
                    保存更改
                  </Button>
                </div>
              </form>
            </Tab.Panel>

            {/* 修改密码 */}
            <Tab.Panel>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                <Input
                  type="password"
                  label="旧密码"
                  placeholder="请输入旧密码"
                  {...registerPassword('oldPassword')}
                  error={passwordErrors.oldPassword?.message}
                  fullWidth
                />

                <Input
                  type="password"
                  label="新密码"
                  placeholder="6-20个字符，包含字母和数字"
                  {...registerPassword('newPassword')}
                  error={passwordErrors.newPassword?.message}
                  fullWidth
                />

                <Input
                  type="password"
                  label="确认新密码"
                  placeholder="再次输入新密码"
                  {...registerPassword('confirmPassword')}
                  error={passwordErrors.confirmPassword?.message}
                  fullWidth
                />

                <div className="flex justify-end">
                  <Button type="submit" variant="primary">
                    修改密码
                  </Button>
                </div>
              </form>
            </Tab.Panel>

            {/* LLM配置 */}
            <Tab.Panel>
              <div className="space-y-6">
                {/* 使用默认LLM */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      使用默认LLM配置
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      使用系统提供的默认大模型配置
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={llmConfig.useDefaultLlm}
                      onChange={(e) =>
                        setLlmConfig({
                          ...llmConfig,
                          useDefaultLlm: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* 自定义LLM配置 */}
                {!llmConfig.useDefaultLlm && (
                  <div className="space-y-4">
                    <Input
                      type="password"
                      label="API Key"
                      placeholder="请输入您的LLM API Key"
                      value={llmConfig.llmApiKey}
                      onChange={(e) =>
                        setLlmConfig({ ...llmConfig, llmApiKey: e.target.value })
                      }
                      helperText="您的API Key将被加密存储"
                      fullWidth
                    />

                    <Input
                      label="Base URL"
                      placeholder="https://api.openai.com/v1"
                      value={llmConfig.llmBaseUrl}
                      onChange={(e) =>
                        setLlmConfig({ ...llmConfig, llmBaseUrl: e.target.value })
                      }
                      fullWidth
                    />

                    <Input
                      label="模型名称"
                      placeholder="gpt-4"
                      value={llmConfig.llmModel}
                      onChange={(e) =>
                        setLlmConfig({ ...llmConfig, llmModel: e.target.value })
                      }
                      fullWidth
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={onSubmitLlm}
                    loading={isLoadingLlm}
                  >
                    保存配置
                  </Button>
                </div>
              </div>
            </Tab.Panel>

            {/* 服务器配置 */}
            <Tab.Panel>
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-dark-hover p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    当前连接信息
                  </h3>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 mb-6">
                    <ServerIcon className="w-5 h-5" />
                    <span className="font-mono text-sm break-all">
                      {baseURL || '未配置'}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                      切换服务器
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      如果您需要连接到其他服务器，点击下方按钮。这将清除当前的登录状态和连接配置，并跳转到配置页面。
                    </p>
                    <Button
                      onClick={handleSwitchServer}
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20"
                    >
                      切换服务器地址
                    </Button>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </Card>

      {/* Switch Server Confirmation Modal */}
      <Modal
        isOpen={isSwitchServerModalOpen}
        onClose={() => setIsSwitchServerModalOpen(false)}
        title="切换服务器地址"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-800 dark:text-amber-200">
            <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">注意：此操作将重置应用</p>
              <p>切换服务器将退出当前账号，并清除所有本地配置。您需要重新配置服务器地址并登录。</p>
            </div>
          </div>
          <p className="text-gray-900 dark:text-white font-medium">
            确定要继续吗？
          </p>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsSwitchServerModalOpen(false)}>
              取消
            </Button>
            <Button variant="danger" onClick={confirmSwitchServer}>
              <ServerIcon className="w-4 h-4 mr-2" />
              确认切换
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
