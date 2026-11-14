'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import {
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { MedicalInlineLoader } from '@/components/ui/MedicalLoader';
import { useI18n } from '@/components/i18n/I18nProvider';

interface DashboardData {
  summary: {
    total: number;
    new: number;
    assigned: number;
    inProgress: number;
    pending: number;
    submittedForReview: number;
    approved: number;
    reworkRequired: number;
    paid: number;
    denied: number;
    closed: number;
  };
  financials: {
    totalBilled: number;
    totalPaid: number;
    totalBalance: number;
  };
  activity: {
    todayUpdated: number;
    pendingReviews: number;
  };
  claimsByAssignee: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    yellow: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}

// Currency amounts stay USD; grouping/digits follow the chosen locale.

export default function DashboardPage() {
  const { t, formatCurrency } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const result = await res.json();
      if (res.ok) {
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <MedicalInlineLoader message={t('dashboard.loading')} />
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout title="Dashboard">
        <div className="text-center py-12 text-slate-500">
          {t('dashboard.failed')}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title={t('dashboard.totalClaims')}
          value={data.summary.total}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title={t('dashboard.pendingReview')}
          value={data.activity.pendingReviews}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title={t('dashboard.approved')}
          value={data.summary.approved}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title={t('dashboard.denied')}
          value={data.summary.denied}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title={t('dashboard.totalBilled')}
          value={formatCurrency(data.financials.totalBilled)}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title={t('dashboard.totalPaid')}
          value={formatCurrency(data.financials.totalPaid)}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title={t('dashboard.outstanding')}
          value={formatCurrency(data.financials.totalBalance)}
          icon={Activity}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claims by Status */}
        <Card>
          <CardHeader title={t('dashboard.claimsByStatus')} />
          <div className="space-y-3">
            {[
              { label: t('status.new'), value: data.summary.new, color: 'bg-blue-500' },
              { label: t('status.assigned'), value: data.summary.assigned, color: 'bg-purple-500' },
              { label: t('status.inProgress'), value: data.summary.inProgress, color: 'bg-amber-500' },
              { label: t('status.pending'), value: data.summary.pending, color: 'bg-slate-500' },
              { label: t('status.underReview'), value: data.summary.submittedForReview, color: 'bg-cyan-500' },
              { label: t('status.reworkRequired'), value: data.summary.reworkRequired, color: 'bg-red-500' },
              { label: t('status.approved'), value: data.summary.approved, color: 'bg-emerald-500' },
              { label: t('status.paid'), value: data.summary.paid, color: 'bg-green-500' },
              { label: t('status.denied'), value: data.summary.denied, color: 'bg-red-600' },
              { label: t('status.closed'), value: data.summary.closed, color: 'bg-slate-600' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span className="font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Claims by Assignee */}
        <Card>
          <CardHeader title={t('dashboard.claimsByAssignee')} />
          {data.claimsByAssignee.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {t('dashboard.noAssigned')}
            </div>
          ) : (
            <div className="space-y-3">
              {data.claimsByAssignee.map((assignee) => (
                <div
                  key={assignee.userId}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {assignee.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {assignee.userName}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {t('dashboard.claimsCount', { count: assignee.count })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Activity Summary */}
      <Card className="mt-6">
        <CardHeader title={t('dashboard.todayActivity')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">{t('dashboard.claimsUpdatedToday')}</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">
              {data.activity.todayUpdated}
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-600 font-medium">{t('dashboard.pendingReviews')}</p>
            <p className="text-3xl font-bold text-amber-700 mt-1">
              {data.activity.pendingReviews}
            </p>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
}
