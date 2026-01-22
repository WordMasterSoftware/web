import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PlusIcon,
  PlayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useCollectionStore } from '@/stores';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Card from '@/components/common/Card';
import { PageLoading } from '@/components/common/Loading';
import { WORD_STATUS_LABELS, WORD_STATUS_COLORS } from '@/utils/constants';
import { cleanWordList } from '@/utils/validation';

/**
 * 单词本详情页面
 */
const WordbookDetail = () => {
  const { id } = useParams();
  const {
    currentCollection,
    words,
    total,
    fetchCollectionDetail,
    fetchWords,
    importWords,
    isLoading,
  } = useCollectionStore();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCollectionDetail(id);
      fetchWords(id);
    }
  }, [id]);

  // 处理单词导入
  const handleImport = async () => {
    if (!wordInput.trim()) {
      toast.error('请输入单词');
      return;
    }

    // 清理单词列表
    const cleanedWords = cleanWordList(wordInput);

    if (cleanedWords.length === 0) {
      toast.error('没有有效的单词，请检查输入');
      return;
    }

    setIsImporting(true);

    try {
      const result = await importWords(id, cleanedWords);

      setImportResult(result);
      toast.success(`成功导入 ${result.imported} 个单词！`);

      // 刷新单词列表
      await fetchWords(id);
      await fetchCollectionDetail(id);
    } catch (error) {
      toast.error('导入失败，请重试');
    } finally {
      setIsImporting(false);
    }
  };

  // 关闭导入结果Modal
  const handleCloseImportResult = () => {
    setImportResult(null);
    setIsImportModalOpen(false);
    setWordInput('');
  };

  if (isLoading && !currentCollection) {
    return <PageLoading />;
  }

  if (!currentCollection) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 dark:text-gray-400">单词本不存在</p>
        <Link to="/wordbook">
          <Button variant="primary" className="mt-4">
            返回单词本列表
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/wordbook"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          返回列表
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-3xl font-bold"
              style={{ backgroundColor: currentCollection.color || '#3b82f6' }}
            >
              {currentCollection.icon || '📚'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentCollection.name}
              </h1>
              {currentCollection.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {currentCollection.description}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {total || 0} 个单词
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
              <PlusIcon className="w-5 h-5 mr-2" />
              导入单词
            </Button>
            <Link to={`/study/new?collection=${id}`}>
              <Button variant="primary">
                <PlayIcon className="w-5 h-5 mr-2" />
                开始学习
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Words List */}
      <Card>
        {words.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              还没有单词
            </p>
            <Button variant="primary" onClick={() => setIsImportModalOpen(true)}>
              <PlusIcon className="w-5 h-5 mr-2" />
              导入单词
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-hover">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    单词
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    中文
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    音标
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    学习次数
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {words.map((item) => (
                  <motion.tr
                    key={item.id || item.word}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.word}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.content?.chinese || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.content?.phonetic || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          WORD_STATUS_COLORS[item.status] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {WORD_STATUS_LABELS[item.status] || '未知'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.study_count || 0} 次
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen && !importResult}
        onClose={() => setIsImportModalOpen(false)}
        title="导入单词"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              单词列表
            </label>
            <textarea
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              placeholder="每行一个单词，或用逗号、空格分隔&#10;例如：&#10;apple&#10;banana&#10;cherry"
              rows={10}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors font-mono"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              支持换行、逗号、空格分隔，自动去重
            </p>
          </div>

          {wordInput && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                📊 统计：{cleanWordList(wordInput).length} 个有效单词
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setIsImportModalOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              loading={isImporting}
              disabled={!wordInput.trim()}
            >
              开始导入
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Result Modal */}
      <Modal
        isOpen={!!importResult}
        onClose={handleCloseImportResult}
        title="导入结果"
        size="md"
      >
        {importResult && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-success-600 dark:text-success-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                导入成功！
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  成功导入
                </span>
                <span className="text-lg font-semibold text-success-600 dark:text-success-400">
                  {importResult.imported} 个
                </span>
              </div>

              {importResult.duplicates > 0 && (
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    重复单词（已忽略）
                  </span>
                  <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    {importResult.duplicates} 个
                  </span>
                </div>
              )}

              {importResult.reused > 0 && (
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    复用已有数据
                  </span>
                  <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                    {importResult.reused} 个
                  </span>
                </div>
              )}

              {importResult.llm_generated > 0 && (
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    AI生成新数据
                  </span>
                  <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {importResult.llm_generated} 个
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                fullWidth
                onClick={handleCloseImportResult}
              >
                完成
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WordbookDetail;