import { useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import DateRangePicker from '../../components/ui/DateRangePicker';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import Icon from '../../components/ui/Icon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useReportsOverview, useReportsKPIs, useExportData } from '../../services/queries';
import { useToastContext } from '../../contexts/ToastContext';
import SEO from '../../components/SEO';
import { format, subDays } from 'date-fns';

export default function Reports() {
  const toast = useToastContext();
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());

  const { data: overviewData, isLoading: isLoadingOverview } = useReportsOverview({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const { data: kpisData, isLoading: isLoadingKPIs } = useReportsKPIs({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const exportData = useExportData();

  const handleExport = async () => {
    try {
      const result = await exportData.mutateAsync({
        type: 'reports',
        format: 'csv',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      toast.success('Report exported successfully');
      // In a real app, you'd trigger a download here
    } catch (error) {
      toast.error(error?.message || 'Failed to export report');
    }
  };

  const kpis = kpisData || {};
  const overview = overviewData || {};

  // Prepare chart data
  const messagesOverTime = overview.messagesOverTime || [
    { name: 'Week 1', messages: 120 },
    { name: 'Week 2', messages: 150 },
    { name: 'Week 3', messages: 180 },
    { name: 'Week 4', messages: 200 },
  ];

  const deliveryStatusData = [
    { name: 'Delivered', value: kpis.delivered || 0 },
    { name: 'Failed', value: kpis.failed || 0 },
    { name: 'Pending', value: kpis.pending || 0 },
  ];

  const campaignPerformance = overview.campaignPerformance || [
    { name: 'Campaign 1', sent: 100, delivered: 95 },
    { name: 'Campaign 2', sent: 150, delivered: 140 },
    { name: 'Campaign 3', sent: 80, delivered: 75 },
  ];

  if (isLoadingOverview || isLoadingKPIs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Reports - Sendly SMS Marketing"
        description="View analytics and performance reports"
        path="/app/reports"
      />
      <div className="min-h-screen pt-8 pb-20 px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-h1 md:text-4xl font-bold mb-2">Reports</h1>
              <p className="text-body text-border-subtle">
                Analytics and performance insights
              </p>
            </div>
            <div className="flex gap-2">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
              <GlassButton
                variant="ghost"
                size="lg"
                onClick={handleExport}
                disabled={exportData.isPending}
              >
                <span className="flex items-center gap-2">
                  <Icon name="export" size="sm" variant="ice" />
                  Export
                </span>
              </GlassButton>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <GlassCard variant="ice" className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-ice-accent/20">
                  <Icon name="send" size="md" variant="ice" />
                </div>
              </div>
              <p className="text-2xl font-bold text-primary-light mb-1">
                {kpis.totalMessagesSent?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-border-subtle">Messages Sent</p>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-ice-accent/20">
                  <Icon name="check" size="md" variant="ice" />
                </div>
              </div>
              <p className="text-2xl font-bold text-ice-accent mb-1">
                {kpis.deliveryRate ? `${kpis.deliveryRate.toFixed(1)}%` : '0%'}
              </p>
              <p className="text-xs text-border-subtle">Delivery Rate</p>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-ice-accent/20">
                  <Icon name="view" size="md" variant="ice" />
                </div>
              </div>
              <p className="text-2xl font-bold text-primary-light mb-1">
                {kpis.openRate ? `${kpis.openRate.toFixed(1)}%` : '0%'}
              </p>
              <p className="text-xs text-border-subtle">Open Rate</p>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-ice-accent/20">
                  <Icon name="chart" size="md" variant="ice" />
                </div>
              </div>
              <p className="text-2xl font-bold text-primary-light mb-1">
                {kpis.conversionRate ? `${kpis.conversionRate.toFixed(1)}%` : '0%'}
              </p>
              <p className="text-xs text-border-subtle">Conversion Rate</p>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-zoom-fuchsia/20">
                  <Icon name="billing" size="md" className="text-zoom-fuchsia" />
                </div>
              </div>
              <p className="text-2xl font-bold text-zoom-fuchsia mb-1">
                ${kpis.revenueGenerated?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-border-subtle">Revenue</p>
            </GlassCard>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Messages Over Time */}
            <GlassCard className="p-6">
              <h3 className="text-h3 font-semibold mb-4">Messages Sent Over Time</h3>
              <LineChart
                data={messagesOverTime}
                dataKey="messages"
                name="Messages"
                stroke="#99B5D7"
              />
            </GlassCard>

            {/* Delivery Status */}
            <GlassCard className="p-6">
              <h3 className="text-h3 font-semibold mb-4">Delivery Status Breakdown</h3>
              <PieChart
                data={deliveryStatusData}
                dataKey="value"
                nameKey="name"
              />
            </GlassCard>
          </div>

          {/* Campaign Performance */}
          <GlassCard className="p-6">
            <h3 className="text-h3 font-semibold mb-4">Campaign Performance</h3>
            <BarChart
              data={campaignPerformance}
              dataKey="delivered"
              name="Delivered"
              fill="#99B5D7"
            />
          </GlassCard>
        </div>
      </div>
    </>
  );
}

