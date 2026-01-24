import { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Menu, Transition } from '@headlessui/react';
import { PlusIcon, BookOpenIcon, EllipsisVerticalIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCollectionStore } from '@/stores';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Card from '@/components/common/Card';
import { PageLoading } from '@/components/common/Loading';
import { WORDBOOK_COLORS, WORDBOOK_ICONS } from '@/utils/constants';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

// 创建单词本表单验证
const schema = z.object({
  name: z.string().min(1, '请输入单词本名称').max(100, '名称最多100个字符'),
  description: z.string().max(500, '描述最多500个字符').optional(),
});

/**
 * 单词本列表页面
 */
const WordbookList = () => {
  const { collections, total, fetchCollections, createCollection, deleteCollection, isLoading } =
    useCollectionStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(WORDBOOK_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(WORDBOOK_ICONS[0]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadRef, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });
  const hasMore = collections.length < total;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Initial Fetch
  useEffect(() => {
    fetchCollections(1, 20, false);
    setPage(1);
  }, [fetchCollections]);

  // Infinite Scroll Trigger
  useEffect(() => {
    if (isIntersecting && hasMore && !loadingMore && !isLoading) {
      loadMore();
    }
  }, [isIntersecting, hasMore, loadingMore, isLoading]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      await fetchCollections(nextPage, 20, true);
      setPage(nextPage);
    } catch (error) {
      // toast.error('加载更多失败');
      console.log(error);
    } finally {
      setLoadingMore(false);
    }
  };

  const onCreateSubmit = async (data) => {
    try {
      await createCollection({
        name: data.name,
        description: data.description,
        color: selectedColor,
        icon: selectedIcon,
      });

      toast.success('单词本创建成功！');
      setIsCreateModalOpen(false);
      reset();
    } catch (error) {
      toast.error('创建失败，请重试');
      console.log(error);
    }
  };

  const handleDeleteClick = (e, collection) => {
    e.preventDefault(); // 阻止 Link 跳转
    setCollectionToDelete(collection);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCollection(collectionToDelete.id);
      toast.success('单词本已删除');
      setIsDeleteModalOpen(false);
      setCollectionToDelete(null);
    } catch (error) {
      toast.error('删除失败，请重试');
      console.log(error);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCollectionToDelete(null);
  };

  if (isLoading && collections.length === 0) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            我的单词本
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            管理您的单词本和学习内容
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          创建单词本
        </Button>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 && !isLoading ? (
        <Card>
          <div className="text-center py-16">
            <BookOpenIcon className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              还没有单词本
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              创建您的第一个单词本，开始学习之旅
            </p>
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="w-5 h-5 mr-2" />
              创建单词本
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link to={`/wordbook/${collection.id}`}>
                  <Card hoverable className="relative">
                    {/* 右上角菜单 */}
                    <div className="absolute top-4 right-4 z-10">
                      <Menu as="div" className="relative">
                        <Menu.Button
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                          onClick={(e) => e.preventDefault()}
                        >
                          <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
                        </Menu.Button>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-dark-surface shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={(e) => handleDeleteClick(e, collection)}
                                    className={`${
                                      active ? 'bg-error-50 dark:bg-error-900/20' : ''
                                    } group flex w-full items-center px-4 py-2 text-sm text-error-600 dark:text-error-400`}
                                  >
                                    <TrashIcon className="w-4 h-4 mr-3" />
                                    删除单词本
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>

                    {/* 原有卡片内容 */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                        style={{ backgroundColor: collection.color || '#3b82f6' }}
                      >
                        {collection.icon || '📚'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {collection.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {collection.word_count || 0} 个单词
                        </p>
                      </div>
                    </div>

                    {collection.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        创建于{' '}
                        {new Date(collection.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Loading Indicator / Sentinel */}
          {hasMore && (
            <div ref={loadRef} className="py-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          )}

          {!hasMore && collections.length > 0 && (
             <p className="text-center text-gray-400 text-sm py-8">没有更多单词本了</p>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="创建单词本"
        size="md"
      >
        <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-6">
          <Input
            label="单词本名称"
            placeholder="例如：CET-4词汇"
            {...register('name')}
            error={errors.name?.message}
            fullWidth
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              描述（可选）
            </label>
            <textarea
              {...register('description')}
              placeholder="简单描述一下这个单词本..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
            {errors.description && (
              <p className="text-sm text-error-600 dark:text-error-400 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择颜色
            </label>
            <div className="flex flex-wrap gap-3">
              {WORDBOOK_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-dark-surface'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              选择图标
            </label>
            <div className="flex flex-wrap gap-2">
              {WORDBOOK_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-12 h-12 rounded-lg text-2xl transition-all ${
                    selectedIcon === icon
                      ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500'
                      : 'bg-gray-100 dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-dark-border'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" variant="primary">
              创建
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        title="确认删除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-900 dark:text-white">
            确定要删除单词本「<strong>{collectionToDelete?.name}</strong>」吗？
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            此操作将删除所有学习记录，且无法恢复。
          </p>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={cancelDelete}>
              取消
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              <TrashIcon className="w-4 h-4 mr-2" />
              删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WordbookList;
