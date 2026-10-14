export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
  isNew?: boolean;
  route?: string;
}
