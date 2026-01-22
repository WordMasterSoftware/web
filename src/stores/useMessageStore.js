import { create } from 'zustand';
import { messageApi } from '@/api';
import toast from 'react-hot-toast';

const useMessageStore = create((set, get) => ({
  messages: [],
  total: 0,
  unreadCount: 0,
  isLoading: false,
  page: 1,
  size: 20,

  // 获取消息列表
  fetchMessages: async (params = {}) => {
    set({ isLoading: true });
    try {
      // 合并默认参数和传入参数
      const currentParams = {
        page: get().page,
        size: get().size,
        unread_only: false,
        ...params
      };

      const response = await messageApi.getMessages(currentParams);

      set({
        messages: response.items,
        total: response.total,
        unreadCount: response.unread_count,
        page: currentParams.page,
        isLoading: false
      });
      return response;
    } catch (error) {
      console.error('Fetch messages failed:', error);
      toast.error('获取消息失败');
      set({ isLoading: false });
    }
  },

  // 标记单个消息为已读
  markAsRead: async (messageId) => {
    try {
      await messageApi.markAsRead(messageId);

      // 更新本地状态
      set((state) => {
        const newMessages = state.messages.map(msg =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        );

        // 如果原来是未读，则未读计数减1
        const wasUnread = state.messages.find(msg => msg.id === messageId)?.is_read === false;
        const newUnreadCount = wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount;

        return {
          messages: newMessages,
          unreadCount: newUnreadCount
        };
      });
    } catch (error) {
      console.error('Mark as read failed:', error);
    }
  },

  // 全部标记为已读
  markAllAsRead: async () => {
    try {
      await messageApi.markAllAsRead();

      set((state) => ({
        messages: state.messages.map(msg => ({ ...msg, is_read: true })),
        unreadCount: 0
      }));

      toast.success('已全部标记为已读');
    } catch (error) {
      console.error('Mark all as read failed:', error);
      toast.error('操作失败');
    }
  },

  // 删除消息
  deleteMessage: async (messageId) => {
    try {
      await messageApi.deleteMessage(messageId);

      set((state) => {
        const targetMsg = state.messages.find(msg => msg.id === messageId);
        const newMessages = state.messages.filter(msg => msg.id !== messageId);

        // 如果删除的是未读消息，未读计数减1
        const wasUnread = targetMsg?.is_read === false;
        const newUnreadCount = wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount;

        return {
          messages: newMessages,
          unreadCount: newUnreadCount,
          total: Math.max(0, state.total - 1)
        };
      });

      toast.success('删除成功');
    } catch (error) {
      console.error('Delete message failed:', error);
      toast.error('删除失败');
    }
  }
}));

export default useMessageStore;
