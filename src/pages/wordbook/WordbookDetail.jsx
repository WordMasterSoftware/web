import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PlusIcon,
  PlayIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
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
  const [importTaskResult, setImportTaskResult] = useState(null);

  // Excel 文件上传
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (id) {
      fetchCollectionDetail(id);
      fetchWords(id);
    }
  }, [id]);

  // 处理 Excel 文件选择
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 转换为 JSON 数组
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 提取所有单元格的文本内容作为单词
        const wordsFromExcel = [];
        jsonData.forEach(row => {
          if (Array.isArray(row)) {
            row.forEach(cell => {
              if (cell && typeof cell === 'string') {
                wordsFromExcel.push(cell);
              } else if (cell && typeof cell === 'number') {
                wordsFromExcel.push(String(cell));
              }
            });
          }
        });

        // 自动追加到输入框
        if (wordsFromExcel.length > 0) {
          const currentWords = wordInput ? wordInput + '\n' : '';
          setWordInput(currentWords + wordsFromExcel.join('\n'));
          toast.success(`成功从Excel解析出 ${wordsFromExcel.length} 个单词`);
        } else {
          toast.error('未能从文件中识别出单词');
        }
      } catch (error) {
        console.error('Excel解析失败:', error);
        toast.error('文件解析失败，请检查格式');
      }

      // 清空 input 允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // 处理单词导入
  const handleImport = async () => {
    if (!wordInput.trim()) {
      toast.error('请输入单词或上传Excel文件');
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
      // 改为异步提交，返回 task info
      const result = await importWords(id, cleanedWords);

      setImportTaskResult(result);
      // toast.success(`成功导入 ${result.imported} 个单词！`);

      // 刷新单词列表 (此时可能还没完成，但可以先刷新一下)
      await fetchWords(id);

    } catch (error) {
      toast.error('导入提交失败，请重试');
    } finally {
      setIsImporting(false);
    }
  };

  // 关闭导入结果Modal
  const handleCloseImportResult = () => {
    setImportTaskResult(null);
    setIsImportModalOpen(false);
    setWordInput('');
    setFileName('');
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
        isOpen={isImportModalOpen && !importTaskResult}
        onClose={() => setIsImportModalOpen(false)}
        title="导入单词"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              单词列表
            </label>
            <div>
              <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" size="sm" onClick={triggerFileUpload}>
                <ArrowUpTrayIcon className="w-4 h-4 mr-1" />
                上传 Excel
              </Button>
            </div>
          </div>

          <textarea
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            placeholder="每行一个单词，或用逗号、空格分隔&#10;也可以点击上方按钮上传 Excel 文件&#10;例如：&#10;apple&#10;banana&#10;cherry"
            rows={10}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors font-mono"
          />

          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
             <span>支持换行、逗号、空格分隔，自动去重</span>
             {fileName && <span className="text-primary-600">已加载: {fileName}</span>}
          </div>

          {wordInput && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                📊 统计：{cleanWordList(wordInput).length} 个有效单词
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
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
              提交导入
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Task Result Modal (Async Response) */}
      <Modal
        isOpen={!!importTaskResult}
        onClose={handleCloseImportResult}
        title="导入已提交"
        size="md"
      >
        {importTaskResult && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
              <ArrowUpTrayIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {importTaskResult.message}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 px-4">
                后台正在处理您的单词导入请求。处理完成后，您将在<Link to="/messages" className="text-primary-600 hover:underline">消息中心</Link>收到详细的统计报告。
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleCloseImportResult}
              >
                好的，我知道了
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WordbookDetail;
