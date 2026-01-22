import { apiClient } from './client';

export const messageApi = {
  // 获取消息列表
  getMessages: (params = { page: 1, size: 20, unread_only: false }) => {
    return apiClient.get('/api/messages/', { params });
  },

  // 标记单个消息为已读
  markAsRead: (messageId) => {
    return apiClient.put(`/api/messages/${messageId}/read`);
  },

  // 全部标记为已读
  markAllAsRead: () => {
    return apiClient.put('/api/messages/read-all');
  },

  // 删除消息
  deleteMessage: (messageId) => {
    return apiClient.delete(`/api/messages/${messageId}`);
  },
};
