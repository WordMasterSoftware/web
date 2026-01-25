import React, { useState, useEffect } from 'react';
import { marketplaceApi } from '../../api/marketplace';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  ArrowDownTrayIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  StarIcon,
  BriefcaseIcon,
  CheckIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

const AVAILABLE_COLORS = [
  { value: '#3B82F6', label: '蓝色' },
  { value: '#10B981', label: '绿色' },
  { value: '#F59E0B', label: '黄色' },
  { value: '#EF4444', label: '红色' },
  { value: '#8B5CF6', label: '紫色' },
  { value: '#EC4899', label: '粉色' },
  { value: '#6366F1', label: '靛蓝' },
];

const AVAILABLE_ICONS = [
  { value: '📚', label: '图书' },
  { value: '🎓', label: '学术' },
  { value: '🌍', label: '全球' },
  { value: '⭐', label: '收藏' },
  { value: '💼', label: '商务' },
  { value: '🔥', label: '热门' },
  { value: '📝', label: '笔记' },
  { value: '💡', label: '灵感' },
  { value: '🎯', label: '目标' },
  { value: '🚀', label: '进阶' },
];

const Marketplace = () => {
  // 状态管理
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 预览与导入流程状态
  const [selectedBook, setSelectedBook] = useState(null); // 列表中的项
  const [previewData, setPreviewData] = useState(null);   // 详情 JSON 内容
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  // 步骤控制: 1=预览, 2=配置
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    color: AVAILABLE_COLORS[0].value,
    icon: AVAILABLE_ICONS[0].value
  });

  // 初始化加载
  useEffect(() => {
    fetchMarketplaceIndex();
  }, []);

  const fetchMarketplaceIndex = async () => {
    try {
      setLoading(true);
      const data = await marketplaceApi.getIndex();
      if (data && data.book) {
        setBooks(data.book);
      }
    } catch (error) {
      console.error('Failed to fetch marketplace index:', error);
      toast.error('加载市场数据失败，请检查网络');
    } finally {
      setLoading(false);
    }
  };

  // 打开预览
  const handleOpenPreview = async (book) => {
    setSelectedBook(book);
    setStep(1); // 重置为第一步
    setPreviewLoading(true);
    setPreviewData(null);

    // 重置配置为默认值
    setConfig({
      color: AVAILABLE_COLORS[0].value,
      icon: AVAILABLE_ICONS[0].value
    });

    try {
      const data = await marketplaceApi.getBookDetail(book.path);
      setPreviewData(data);
    } catch (error) {
      toast.error('无法加载单词本详情');
      console.error(error);
    } finally {
      setPreviewLoading(false);
    }
  };

  // 关闭 Modal
  const handleClose = () => {
    setSelectedBook(null);
    setPreviewData(null);
    setStep(1);
  };

  // 处理导入
  const handleImport = async () => {
    if (!previewData) return;

    try {
      setImporting(true);

      // 准备导入数据，使用用户选择的配置
      const importData = {
        ...previewData,
        color: config.color,
        icon: config.icon
      };

      await marketplaceApi.importBook(importData);

      // 关闭模态框并显示成功消息
      handleClose();

      // 显示成功提示
      toast.success(
        <div>
          <span className="font-bold">导入成功！</span>
          <p className="text-sm mt-1">
            "{previewData.name}" 已加入您的单词本。
          </p>
        </div>,
        { duration: 4000 }
      );
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || '导入失败');
    } finally {
      setImporting(false);
    }
  };

  // 获取 GitHub URL
  const getGitHubUrl = (path) => {
    const baseUrl = 'https://github.com/WordMasterSoftware/Marketplace/blob/main/';
    // 处理相对路径
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}${cleanPath}`;
  };

  // 搜索过滤
  const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 渲染 Footer 内容
  const renderFooter = () => {
    if (step === 1) {
      return (
        <div className="flex items-center justify-between w-full">
          {selectedBook && (
            <a
              href={getGitHubUrl(selectedBook.path)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <LinkIcon className="w-4 h-4 mr-1" />
              在 GitHub 查看
            </a>
          )}
          <div className="flex space-x-3 ml-auto">
            <Button variant="secondary" onClick={handleClose}>
              取消
            </Button>
            <Button
              onClick={() => setStep(2)}
              disabled={!previewData}
              icon={ArrowDownTrayIcon}
            >
              加入我的单词本
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-end w-full space-x-3">
          <Button variant="secondary" onClick={() => setStep(1)}>
            上一步
          </Button>
          <Button
            onClick={handleImport}
            loading={importing}
            icon={CheckIcon}
          >
            确认创建
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">单词市场</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            发现优质单词本，一键导入学习
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索单词本..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 hover:shadow-lg hover:border-primary-500 dark:hover:border-primary-500 transition-all cursor-pointer"
                onClick={() => handleOpenPreview(book)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
                    <BookOpenIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {book.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {book.description || '暂无描述'}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              未找到匹配的单词本
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={!!selectedBook}
        onClose={handleClose}
        title={step === 1 ? selectedBook?.name : '设置单词本外观'}
        size="lg"
        footer={renderFooter()}
      >
        {previewLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : previewData ? (
          <div className="space-y-6">
            {step === 1 ? (
              // Step 1: 预览
              <>
                <div className="bg-gray-50 dark:bg-dark-hover rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">简介</h4>
                  <p className="text-gray-900 dark:text-white">
                    {previewData.description || selectedBook?.description || '无描述'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    单词预览 (共 {previewData.words?.length || 0} 个)
                  </h4>
                  <div className="border border-gray-200 dark:border-dark-border rounded-lg divide-y divide-gray-200 dark:divide-dark-border">
                    {/* 仅展示前 5 个单词 */}
                    {previewData.words?.slice(0, 5).map((word, idx) => (
                      <div key={idx} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-hover">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {typeof word === 'string' ? word : word.word}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {typeof word === 'string' ? '' : word.chinese}
                        </span>
                      </div>
                    ))}
                    {previewData.words?.length > 5 && (
                      <div className="px-4 py-3 text-center text-sm text-gray-500 italic bg-gray-50 dark:bg-dark-hover">
                        ... 以及其他 {previewData.words.length - 5} 个单词
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>直接导入，不消耗 Token</span>
                </div>
              </>
            ) : (
              // Step 2: 配置
              <div className="space-y-6">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    选择颜色
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {AVAILABLE_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setConfig({ ...config, color: color.value })}
                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-surface ${
                          config.color === color.value ? 'ring-2 ring-offset-2 dark:ring-offset-dark-surface ring-gray-400' : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    选择图标
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {AVAILABLE_ICONS.map((item) => {
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setConfig({ ...config, icon: item.value })}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                            config.icon === item.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                              : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <span className="text-2xl mb-1">{item.value}</span>
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-white/50 text-2xl">
                       {config.icon}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        即将创建
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <p>
                          将创建一个名为 <strong>{previewData.name}</strong> 的单词本，
                          包含 {previewData.words?.length} 个单词。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            无法加载内容
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Marketplace;
