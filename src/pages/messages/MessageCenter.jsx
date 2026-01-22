import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  BellIcon,
  CheckCircleIcon,
  TrashIcon,
  EnvelopeOpenIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useMessageStore } from '@/stores';
import Button from '@/components/common/Button';
import { PageLoading } from '@/components/common/Loading';

const MessageCenter = () => {
  const {
    messages,
    isLoading,
    fetchMessages,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    unreadCount,
    total
  } = useMessageStore();

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    fetchMessages();
  };

  if (isLoading && messages.length === 0) {
    return <PageLoading />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BellIcon className="w-8 h-8 mr-3 text-indigo-600 dark:text-indigo-400" />
            消息中心
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            共 {total} 条消息，{unreadCount} 条未读
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="primary"
              onClick={() => markAllAsRead()}
              className="flex items-center"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              全部已读
            </Button>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <EnvelopeOpenIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">暂无消息通知</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                layout
                className={`
                  relative p-4 rounded-lg border transition-all duration-200
                  ${message.is_read
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 shadow-sm'
                  }
                `}
                onClick={() => !message.is_read && markAsRead(message.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-8">
                    <div className="flex items-center mb-1">
                      {!message.is_read && (
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2 flex-shrink-0" />
                      )}
                      <h3 className={`font-medium ${message.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                        {message.title}
                      </h3>
                    </div>
                    <p className={`text-sm mt-1 whitespace-pre-wrap ${message.is_read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                      {message.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-3">
                      {format(new Date(message.created_at), 'PPP p', { locale: zhCN })}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(message.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="删除消息"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination could be added here if needed */}
    </div>
  );
};

export default MessageCenter;
