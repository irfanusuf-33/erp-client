import { axiosInstance } from '../axiosInstance';
import { DashboardData } from '@/types/dashboard.types';

export const dashboardApi = {
  // Fetch all dashboard stats
  getDashboardStats: async (): Promise<DashboardData> => {
    try {
      const response = await axiosInstance.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return mock data as fallback
      return getMockDashboardData();
    }
  },

  // Fetch specific module stats
  getModuleStats: async (moduleId: string) => {
    try {
      const response = await axiosInstance.get(`/api/dashboard/module/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${moduleId} stats:`, error);
      throw error;
    }
  }
};

// Mock data for development
function getMockDashboardData(): DashboardData {
  return {
    userName: '', // Not used anymore, fetched from auth store
    modules: [
      {
        id: 'hrm',
        title: 'HR & Payroll',
        color: '#3b82f6',
        stats: {
          employees: 45,
          payrollDue: '₹520,000',
          leaveRequests: 8
        }
      },
      {
        id: 'iam',
        title: 'IAM',
        color: '#8b5cf6',
        stats: {
          totalUsers: 120,
          activeUsers: 98,
          pendingApprovals: 5
        }
      },
      {
        id: 'inventory',
        title: 'Inventory Status',
        color: '#10b981',
        stats: {
          inStock: 1250,
          lowStock: 85,
          totalValue: '₹2.5M'
        }
      },
      {
        id: 'crm',
        title: 'CRM Insights',
        color: '#f59e0b',
        stats: {
          newLeads: 45,
          openDeals: 32,
          followUps: 67
        }
      },
      {
        id: 'accounts',
        title: 'Finance Summary',
        color: '#06b6d4',
        stats: {
          expenses: '₹180K',
          profit: '₹95K',
          outstanding: '₹70K'
        }
      },
      {
        id: 'calendar',
        title: 'Calendar & Events',
        color: '#ec4899',
        stats: {
          upcomingEvents: 12,
          todayMeetings: 4,
          pendingRSVP: 3
        }
      }
    ]
  };
}
