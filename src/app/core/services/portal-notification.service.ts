import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { PortalNotification } from '../models/portal-notification.model';
import { AuthService, UserRole } from '../auth/auth.service';

const ROLE_NOTIFICATIONS: Record<UserRole, PortalNotification[]> = {
  dept_admin: [
    {
      id: 'da-1',
      title: 'Task Pending: 4 EOI Proposals at Scrutiny Desk',
      message: 'Technical compliance and financial eligibility review pending for MMKVY Phase-2 applicants.',
      timeAgo: '10m ago',
      isRead: false,
      isNew: true,
      route: '/admin/eoi-view'
    },
    {
      id: 'da-2',
      title: 'Task Pending: SDC Batch #B-914 Verification',
      message: 'Jaipur Center 04 submitted 30 trainees awaiting biometric desk scrutiny and approval.',
      timeAgo: '35m ago',
      isRead: false,
      isNew: true,
      route: '/sdc'
    },
    {
      id: 'da-3',
      title: 'Task Pending: Digital Signature for SO-2026-104',
      message: 'Sanction Order for 24 Skill Development Centers awaits DSC approval before issuance.',
      timeAgo: '1h ago',
      isRead: false,
      isNew: true,
      route: '/admin/sanction-order'
    },
    {
      id: 'da-4',
      title: 'Biometric Attendance Circular Released',
      message: 'Directive published regarding mandatory 80% Aadhaar attendance for stipend disbursal.',
      timeAgo: '2h ago',
      isRead: true,
      isNew: false,
      route: '/admin/master'
    },
    {
      id: 'da-5',
      title: 'IPA Target Allocation Finalized',
      message: 'Target quota of 1,200 training seats allocated for District Centers for FY 2026-27.',
      timeAgo: '1d ago',
      isRead: true,
      isNew: false,
      route: '/ipa'
    }
  ],
  super_admin: [
    {
      id: 'sa-1',
      title: 'Task Pending: 2 Department Users Awaiting Access Approval',
      message: 'New scheme desk officer registration requests from Planning Cell pending KYC approval.',
      timeAgo: '15m ago',
      isRead: false,
      isNew: true,
      route: '/admin/user-management'
    },
    {
      id: 'sa-2',
      title: 'Task Pending: Scheme Workflow Configuration Sign-off',
      message: 'Final parameter review required for Chief Minister Skill Scheme EOI-2026-03.',
      timeAgo: '45m ago',
      isRead: false,
      isNew: true,
      route: '/admin/eoi-configuration'
    },
    {
      id: 'sa-3',
      title: 'Task Pending: Two-Step Verification Clearance',
      message: '3 Security requests for mobile number update & OTP bypass pending admin clearance.',
      timeAgo: '1h ago',
      isRead: false,
      isNew: true,
      route: '/admin/two-step-verification'
    },
    {
      id: 'sa-4',
      title: 'Security Audit Backup Completed',
      message: 'Weekly system activity logs and audit trails archived successfully.',
      timeAgo: '5h ago',
      isRead: true,
      isNew: false
    },
    {
      id: 'sa-5',
      title: 'System Master Configuration Synced',
      message: 'Document master and scheme workflow parameters synchronized across all nodes.',
      timeAgo: '1d ago',
      isRead: true,
      isNew: false,
      route: '/admin/master'
    }
  ],
  existing_user: [
    {
      id: 'eu-1',
      title: 'Sanction Order Issued for Your Proposal',
      message: 'Sanction Order SO-2026-104 has been issued for your submitted EOI proposal.',
      timeAgo: '10m ago',
      isRead: false,
      isNew: true,
      route: '/eoi/sanction-editor'
    },
    {
      id: 'eu-2',
      title: 'SDC Batch #B-914 Inspection Scheduled',
      message: 'Center inspection scheduled for Jaipur Center 04 on 18th Oct 2026.',
      timeAgo: '45m ago',
      isRead: false,
      isNew: true,
      route: '/sdc'
    },
    {
      id: 'eu-3',
      title: 'Milestone Disbursement Processed',
      message: 'Batch training milestone payment credited via PFMS treasury.',
      timeAgo: '3h ago',
      isRead: true,
      isNew: false,
      route: '/payment-history'
    },
    {
      id: 'eu-4',
      title: 'Tender Ref #TN-2026-042 Submitted',
      message: 'Technical bid proposal submission has been confirmed successfully.',
      timeAgo: '2d ago',
      isRead: true,
      isNew: false,
      route: '/tenders'
    }
  ],
  new_user: [
    {
      id: 'nu-1',
      title: 'Complete One-Time Registration (OTR)',
      message: 'Please complete your agency profile and upload KYC documents to access schemes.',
      timeAgo: '10m ago',
      isRead: false,
      isNew: true,
      route: '/profile'
    },
    {
      id: 'nu-2',
      title: 'Welcome to ISMS 2.0 Portal',
      message: 'Your SSO ID is connected. Browse active skill schemes and submission guidelines.',
      timeAgo: '1h ago',
      isRead: true,
      isNew: false
    }
  ],
  aspirant: [
    {
      id: 'as-1',
      title: 'Training Batch Allotted: Retail Associate',
      message: 'You have been enrolled in Batch #B-914 at RSLDC Jaipur North Center.',
      timeAgo: '20m ago',
      isRead: false,
      isNew: true,
      route: '/aspirant'
    },
    {
      id: 'as-2',
      title: 'Orientation Class Scheduled',
      message: 'Training starts Monday at 09:30 AM. Bring your original Aadhaar card.',
      timeAgo: '2h ago',
      isRead: false,
      isNew: true
    },
    {
      id: 'as-3',
      title: 'Skill Assessment Result Uploaded',
      message: 'Your pre-training evaluation score has been published to your student profile.',
      timeAgo: '1d ago',
      isRead: true,
      isNew: false,
      route: '/profile'
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class PortalNotificationService {
  private authService = inject(AuthService);

  readonly notifications = signal<PortalNotification[]>([]);

  /** Total unread count */
  readonly unreadCount = computed(() => {
    return this.notifications().filter(n => !n.isRead).length;
  });

  /** Whether there is at least one unread notification */
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  /** Whether any newly arrived unread notification exists */
  readonly hasNewArrivals = computed(() => {
    return this.notifications().some(n => n.isNew && !n.isRead);
  });

  constructor() {
    // Whenever the logged-in user or active role changes, update notifications to match that role
    effect(() => {
      const user = this.authService.currentUser();
      const role: UserRole = user?.role || 'existing_user';
      this.loadRoleNotifications(role);
    });
  }

  private loadRoleNotifications(role: UserRole): void {
    const list = ROLE_NOTIFICATIONS[role] || ROLE_NOTIFICATIONS['existing_user'];
    // Deep clone to allow read state mutation
    this.notifications.set(list.map(item => ({ ...item })));
  }

  markAsRead(id: string): void {
    this.notifications.update(list =>
      list.map(n => (n.id === id ? { ...n, isRead: true, isNew: false } : n))
    );
  }

  markAllAsRead(): void {
    this.notifications.update(list =>
      list.map(n => ({ ...n, isRead: true, isNew: false }))
    );
  }
}
