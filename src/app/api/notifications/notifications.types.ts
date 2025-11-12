export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target_type: 'all' | 'specific';
  target_user_id: number | null;
  sender_username: string;
  sender_image: string;
  created_at: string;
  expires_at: string | null;
  link: string | null;
  is_seen?: boolean; // Added on frontend after checking read status
}

export interface NotificationRead {
  id: number;
  notification_id: number;
  user_id: number;
  seen_at: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
}
