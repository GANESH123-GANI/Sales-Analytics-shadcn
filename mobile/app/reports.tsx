import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  FileText,
  Coins,
  Clock,
  AlertTriangle,
  Download,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Layers,
  Award,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Briefcase,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { AppShell } from '../components/AppShell';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { EnterpriseStatCard } from '../components/EnterpriseStatCard';
import { DataTable, StatusPill, IdBadge, Column } from '../components/DataTable';
import { LoadingView } from '../components/LoadingView';
import { DetailModal } from '../components/ActionModal';
import { getReports } from '../services/api';
import {
  Report,
  ExecutiveReview,
  OperatingExpense,
  EnterpriseContract,
  ReportSummaryRow,
} from '../types/sales';

const REPORT_TABS = [
  'P&L & Margins',
  'Quarterly Board Audit',
  'Enterprise Contracts',
  'Territory Settlements',
];

export default function ReportsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('P&L & Margins');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q3 2026');
  const [detailContract, setDetailContract] = useState<EnterpriseContract | null>(null);

  const fetchData = useCallback(
    async (silent = false, bypass = false) => {
      try {
        if (!silent && !report) setLoading(true);
        setError(null);
        const repData = await getReports(bypass);
        setReport(repData);
      } catch (err: any) {
        setError(err.message || 'Unable to load executive reports.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [report]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true, true);
  };

  const financial = report?.financialMetrics || {
    grossRevenue: report?.totalRevenue || 898634,
    cogs: 283968,
    grossProfit: 614666,
    grossMarginPercent: '68.4%',
    operatingExpenses: 246125,
    netOperatingIncome: 368541,
    netMarginPercent: '41.0%',
    collectionsRate: '95.7%',
  };

  const reviews = report?.executiveReviews || [];
  const expenses = report?.operatingExpenses || [];
  const contracts = report?.enterpriseContracts || [];
  const summaryTable = report?.summaryTable || [];

  const activeReview =
    reviews.find((r) => r.quarter === selectedQuarter) || reviews[reviews.length - 1] || null;

  const totalContractValue = contracts.reduce((a, c) => a + c.dealValue, 0);
  const settledContracts = contracts.filter((c) => c.paymentStatus === 'Settled');
  const inEscrowContracts = contracts.filter((c) => c.paymentStatus === 'In Escrow');

  // Columns for Enterprise Contracts
  const contractColumns: Column<EnterpriseContract>[] = [
    {
      key: 'contractCode',
      header: 'Contract Code',
      width: 140,
      render: (item) => <IdBadge label={item.contractCode} />,
    },
    {
      key: 'clientName',
      header: 'Corporate Account',
      flex: 1.5,
      render: (item) => (
        <View>
          <Text style={st.bold} numberOfLines={1}>
            {item.clientName}
          </Text>
          <View style={st.subTagRow}>
            <Text style={st.tierTag}>{item.tier}</Text>
            <Text style={st.regionTag}>{item.region}</Text>
          </View>
        </View>
      ),
    },
    {
      key: 'dealValue',
      header: 'Contract Value',
      width: 130,
      align: 'right',
      render: (item) => (
        <Text style={st.amount}>₹{item.dealValue.toLocaleString('en-IN')}</Text>
      ),
    },
    {
      key: 'terms',
      header: 'Payment Terms',
      width: 130,
      render: (item) => <Text style={st.cellText}>{item.terms}</Text>,
    },
    {
      key: 'paymentStatus',
      header: 'Audit Status',
      width: 120,
      align: 'center',
      render: (item) => (
        <StatusPill
          status={
            item.paymentStatus === 'Settled'
              ? 'Approved'
              : item.paymentStatus === 'In Escrow'
              ? 'In Escrow'
              : item.paymentStatus === 'Invoice Sent'
              ? 'Pending'
              : 'Under Review'
          }
        />
      ),
    },
  ];

  // Columns for Regional Site Summary
  const regionalColumns: Column<ReportSummaryRow>[] = [
    {
      key: 'region',
      header: 'Operating Site',
      flex: 1.4,
      render: (item) => <Text style={st.bold}>{item.region}</Text>,
    },
    {
      key: 'totalOrders',
      header: 'Total Bookings',
      width: 120,
      align: 'center',
      render: (item) => <Text style={st.cellText}>{item.totalOrders}</Text>,
    },
    {
      key: 'completedOrders',
      header: 'Delivered',
      width: 120,
      align: 'center',
      render: (item) => <Text style={st.cellText}>{item.completedOrders}</Text>,
    },
    {
      key: 'totalRevenue',
      header: 'Settled Revenue',
      width: 140,
      align: 'right',
      render: (item) => (
        <Text style={st.amount}>₹{item.totalRevenue.toLocaleString('en-IN')}</Text>
      ),
    },
  ];

  const agingRows = [
    { bucket: 'Current (<30d)', value: 580000, rate: 65, color: '#10b981' },
    { bucket: '31-60 days', value: 210000, rate: 23, color: '#3b82f6' },
    { bucket: '61-90 days', value: 78000, rate: 9, color: '#f59e0b' },
    { bucket: '>90 days (Past Due)', value: 30634, rate: 3, color: '#ef4444' },
  ];

  return (
    <AppShell
      activeTab="Reports"
      title="Corporate Reports & Financial Intelligence"
      subtitle="Executive P&L statements, audited quarterly board reviews, and contract governance"
    >
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={THEME.colors.primary}
      />

      <LoadingView isLoading={loading} error={error} onRetry={() => fetchData(false, true)}>
        {/* ─── Top Executive Audit KPIs with Sparklines ─── */}
        <View style={st.statsRow}>
          <EnterpriseStatCard
            label="Gross Invoiced"
            value={`₹${(financial.grossRevenue / 1000).toFixed(0)}k`}
            icon={Coins}
            trend="+18.4%"
            trendPositive={true}
            sparklineData={[123, 177, 298, 420, 715, 898]}
            subtitle="audited revenue line"
          />
          <EnterpriseStatCard
            label="Gross Margin"
            value={financial.grossMarginPercent}
            icon={TrendingUp}
            trend="+3.2% pts"
            trendPositive={true}
            sparklineData={[62, 65, 67, 68.4]}
            subtitle={`₹${(financial.grossProfit / 1000).toFixed(0)}k gross profit`}
          />
          <EnterpriseStatCard
            label="Operating EBITDA"
            value={`₹${(financial.netOperatingIncome / 1000).toFixed(0)}k`}
            icon={DollarSign}
            variant="success"
            trend={financial.netMarginPercent}
            trendPositive={true}
            sparklineData={[52, 94, 185, 260, 368]}
            subtitle="net income post-OpEx"
          />
          <EnterpriseStatCard
            label="Cash Collections"
            value={financial.collectionsRate}
            icon={Percent}
            trend="100% audited"
            trendPositive={true}
            sparklineData={[91, 93, 94, 95.7]}
            subtitle="low default rate"
          />
        </View>

        {/* ─── Segmented Tabs ─── */}
        <SegmentedTabs
          tabs={REPORT_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          scrollable
        />

        {/* ─── TAB 1: P&L & Operating Margins ─── */}
        {activeTab === 'P&L & Margins' && (
          <View style={st.tabPanel}>
            {/* Executive P&L Statement Card */}
            <View style={st.statementCard}>
              <View style={st.statementHeader}>
                <View style={st.statementTitleRow}>
                  <Briefcase size={16} color="#0f172a" />
                  <Text style={st.statementTitle}>Enterprise P&L Waterfall Statement (FY 2026)</Text>
                </View>
                <View style={st.statementBadge}>
                  <Text style={st.statementBadgeText}>Audited GAAP Standard</Text>
                </View>
              </View>

              <View style={st.waterfallList}>
                {/* 1. Gross Revenue */}
                <View style={st.waterfallRow}>
                  <View style={st.waterfallLeft}>
                    <Text style={st.waterfallLine}>Gross Commercial Revenue</Text>
                    <Text style={st.waterfallSub}>Total product & fleet billings</Text>
                  </View>
                  <Text style={st.waterfallValPos}>
                    ₹{financial.grossRevenue.toLocaleString('en-IN')}
                  </Text>
                </View>

                {/* 2. COGS */}
                <View style={st.waterfallRow}>
                  <View style={st.waterfallLeft}>
                    <Text style={st.waterfallLine}>Cost of Goods Sold (COGS)</Text>
                    <Text style={st.waterfallSub}>Manufacturing, procurement & supplier costs (31.6%)</Text>
                  </View>
                  <Text style={st.waterfallValNeg}>
                    -₹{financial.cogs.toLocaleString('en-IN')}
                  </Text>
                </View>

                {/* 3. Gross Profit */}
                <View style={[st.waterfallRow, st.waterfallRowSubtotal]}>
                  <View style={st.waterfallLeft}>
                    <Text style={st.waterfallBold}>Gross Operating Profit</Text>
                    <Text style={st.waterfallSub}>Gross Contribution Margin: {financial.grossMarginPercent}</Text>
                  </View>
                  <Text style={st.waterfallBoldVal}>
                    ₹{financial.grossProfit.toLocaleString('en-IN')}
                  </Text>
                </View>

                {/* 4. Operating Expenses */}
                <View style={st.waterfallRow}>
                  <View style={st.waterfallLeft}>
                    <Text style={st.waterfallLine}>Total Operating Expenses (OpEx)</Text>
                    <Text style={st.waterfallSub}>Logistics, infrastructure, marketing & regional hubs</Text>
                  </View>
                  <Text style={st.waterfallValNeg}>
                    -₹{financial.operatingExpenses.toLocaleString('en-IN')}
                  </Text>
                </View>

                {/* 5. Net Operating Income */}
                <View style={[st.waterfallRow, st.waterfallRowTotal]}>
                  <View style={st.waterfallLeft}>
                    <Text style={st.waterfallNetLabel}>Net Operating Income (EBITDA)</Text>
                    <Text style={st.waterfallNetSub}>Net Operating Margin: {financial.netMarginPercent}</Text>
                  </View>
                  <Text style={st.waterfallNetVal}>
                    ₹{financial.netOperatingIncome.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Operating Expenses Breakdown Table */}
            <View style={st.card}>
              <View style={st.cardHeader}>
                <View style={st.statementTitleRow}>
                  <Layers size={15} color="#0f172a" />
                  <Text style={st.cardTitle}>Operating Expenses by Cost Center</Text>
                </View>
                <Text style={st.cardSubtitle}>
                  Budgeted vs Actuals: ₹{expenses.reduce((a, c) => a + c.amount, 0).toLocaleString('en-IN')} Total
                </Text>
              </View>

              <View style={st.expenseTable}>
                {expenses.map((exp, idx) => (
                  <View key={exp.id || idx} style={st.expenseRow}>
                    <View style={st.expenseLeft}>
                      <Text style={st.expenseCat}>{exp.category}</Text>
                      <Text style={st.expenseDept}>{exp.department} • {exp.quarter}</Text>
                    </View>
                    <View style={st.expenseRight}>
                      <Text style={st.expenseAmt}>₹{exp.amount.toLocaleString('en-IN')}</Text>
                      <Text
                        style={[
                          st.expenseVar,
                          exp.variance <= 0 ? st.varUnderBudget : st.varOverBudget,
                        ]}
                      >
                        {exp.variance <= 0
                          ? `₹${Math.abs(exp.variance).toLocaleString('en-IN')} under budget`
                          : `+₹${exp.variance.toLocaleString('en-IN')} over budget`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ─── TAB 2: Quarterly Board Audit ─── */}
        {activeTab === 'Quarterly Board Audit' && (
          <View style={st.tabPanel}>
            {/* Quarter Selector Pills */}
            <View style={st.quarterPillRow}>
              {reviews.map((rev) => {
                const isSelected = selectedQuarter === rev.quarter;
                return (
                  <TouchableOpacity
                    key={rev.quarter}
                    style={[st.quarterPill, isSelected && st.quarterPillActive]}
                    onPress={() => setSelectedQuarter(rev.quarter)}
                    activeOpacity={0.7}
                  >
                    <Text style={[st.quarterPillText, isSelected && st.quarterPillTextActive]}>
                      {rev.quarter} Review
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected Quarter Executive Dossier */}
            {activeReview && (
              <View style={st.boardDossierCard}>
                <View style={st.dossierHeader}>
                  <View>
                    <View style={st.statementTitleRow}>
                      <ShieldCheck size={16} color="#047857" />
                      <Text style={st.dossierTitle}>
                        {activeReview.quarter} Corporate Performance Review
                      </Text>
                    </View>
                    <Text style={st.dossierSub}>
                      Audit closed on {activeReview.auditDate} • Verified by {activeReview.auditorSignoff}
                    </Text>
                  </View>
                  <View style={st.dossierBeatBadge}>
                    <Text style={st.dossierBeatText}>{activeReview.growthRate}</Text>
                  </View>
                </View>

                {/* Scorecard Grid */}
                <View style={st.scorecardGrid}>
                  <View style={st.scorecardCol}>
                    <Text style={st.scorecardLabel}>Revenue Target</Text>
                    <Text style={st.scorecardVal}>₹{activeReview.revenueTarget.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={st.scorecardCol}>
                    <Text style={st.scorecardLabel}>Actual Achieved</Text>
                    <Text style={st.scorecardValGreen}>₹{activeReview.actualRevenue.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={st.scorecardCol}>
                    <Text style={st.scorecardLabel}>COGS & Fulfillment</Text>
                    <Text style={st.scorecardVal}>₹{activeReview.cogs.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={st.scorecardCol}>
                    <Text style={st.scorecardLabel}>Net Quarterly Income</Text>
                    <Text style={st.scorecardValBlue}>₹{activeReview.netProfit.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {/* Executive Strategic Commentary */}
                <View style={st.commentaryBox}>
                  <View style={st.commentaryRow}>
                    <Sparkles size={14} color="#0f172a" />
                    <Text style={st.commentaryHeader}>Strategic Highlights & Outperformance Drivers</Text>
                  </View>
                  <Text style={st.commentaryBody}>{activeReview.strategicHighlights}</Text>
                </View>

                {/* Operational Risk Management */}
                <View style={st.riskBox}>
                  <View style={st.commentaryRow}>
                    <AlertTriangle size={14} color="#b45309" />
                    <Text style={st.riskHeader}>Operational Risk Factors & Mitigation Actions Taken</Text>
                  </View>
                  <Text style={st.riskBody}>{activeReview.operationalRisks}</Text>
                </View>

                {/* Sign-off Seal */}
                <View style={st.signoffBar}>
                  <CheckCircle2 size={14} color="#059669" />
                  <Text style={st.signoffText}>
                    Officially endorsed by: <Text style={st.signoffBold}>{activeReview.auditorSignoff}</Text>
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ─── TAB 3: Enterprise Contracts ─── */}
        {activeTab === 'Enterprise Contracts' && (
          <View style={st.tabPanel}>
            {/* Contract Summary Strip */}
            <View style={st.contractSummaryCard}>
              <View style={st.summaryHeader}>
                <View style={st.statementTitleRow}>
                  <Building2 size={16} color="#0f172a" />
                  <Text style={st.statementTitle}>Master Enterprise Agreements & Fleet Contracts</Text>
                </View>
                <Text style={st.contractTotalVal}>
                  Portfolio Value: ₹{(totalContractValue / 100000).toFixed(2)} Lakhs
                </Text>
              </View>

              <View style={st.contractStatusRow}>
                <Text style={st.contractStatusText}>
                  ✅ Settled: {settledContracts.length} agreements (₹{(settledContracts.reduce((a, c) => a + c.dealValue, 0) / 1000).toFixed(0)}k)
                </Text>
                <Text style={st.contractStatusText}>
                  🔒 In Escrow: {inEscrowContracts.length} agreements (₹{(inEscrowContracts.reduce((a, c) => a + c.dealValue, 0) / 1000).toFixed(0)}k)
                </Text>
              </View>
            </View>

            <DataTable
              title="Corporate contracts register"
              count={contracts.length}
              columns={contractColumns}
              data={contracts}
              keyExtractor={(item) => item.contractCode}
              actionButtonLabel="Audit"
              onRowAction={(item) => setDetailContract(item)}
            />
          </View>
        )}

        {/* ─── TAB 4: Territory Settlements & Aging ─── */}
        {activeTab === 'Territory Settlements' && (
          <View style={st.tabPanel}>
            {/* Accounts Receivable Aging Strip */}
            <View style={st.statementCard}>
              <View style={st.statementHeader}>
                <View style={st.statementTitleRow}>
                  <CheckCircle2 size={15} color="#0f172a" />
                  <Text style={st.statementTitle}>Receivables Aging & Recovery Schedule</Text>
                </View>
                <Text style={st.agingTotalText}>
                  Total Outstanding: ₹{(agingRows.reduce((a, c) => a + c.value, 0) / 100000).toFixed(1)}L
                </Text>
              </View>

              <View style={st.agingBarTrack}>
                {agingRows.map((row) => (
                  <View
                    key={row.bucket}
                    style={{
                      width: `${row.rate}%`,
                      height: '100%',
                      backgroundColor: row.color,
                    }}
                  />
                ))}
              </View>

              <View style={st.agingLegend}>
                {agingRows.map((row) => (
                  <View key={row.bucket} style={st.legendItem}>
                    <View style={[st.legendDot, { backgroundColor: row.color }]} />
                    <Text style={st.legendText}>
                      {row.bucket}: {row.rate}% (₹{(row.value / 1000).toFixed(0)}k)
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Regional Performance Table */}
            <DataTable
              title="Regional settlement audits"
              count={summaryTable.length}
              columns={regionalColumns}
              data={summaryTable}
              keyExtractor={(item) => item.region}
            />
          </View>
        )}
      </LoadingView>

      {/* Contract Detail Modal */}
      {detailContract && (
        <DetailModal
          title={`Contract ${detailContract.contractCode}`}
          subtitle={detailContract.clientName}
          data={{
            'Client Account': detailContract.clientName,
            Tier: detailContract.tier,
            'Contract Value': `₹${detailContract.dealValue.toLocaleString('en-IN')}`,
            'Payment Terms': detailContract.terms,
            Status: detailContract.paymentStatus,
            'Settlement Date': detailContract.settlementDate,
            'Operating Territory': detailContract.region,
          }}
          onClose={() => setDetailContract(null)}
        />
      )}
    </AppShell>
  );
}

const st = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  tabPanel: {
    gap: 12,
  },

  /* P&L Waterfall Statement */
  statementCard: {
    backgroundColor: '#ffffff',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    ...THEME.shadow.card,
    gap: 12,
  },
  statementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#09090b',
  },
  statementBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statementBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  waterfallList: {
    gap: 8,
  },
  waterfallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  waterfallRowSubtotal: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    backgroundColor: '#fbfcfd',
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  waterfallRowTotal: {
    borderTopWidth: 2,
    borderColor: '#0f172a',
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  waterfallLeft: {
    flex: 1,
  },
  waterfallLine: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  waterfallSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  waterfallValPos: {
    fontSize: 14,
    fontWeight: '700',
    color: '#09090b',
  },
  waterfallValNeg: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b91c1c',
  },
  waterfallBold: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#09090b',
  },
  waterfallBoldVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#047857',
  },
  waterfallNetLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  waterfallNetSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 1,
  },
  waterfallNetVal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#047857',
  },

  /* Card General */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    ...THEME.shadow.card,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#09090b',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  expenseTable: {
    gap: 4,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  expenseLeft: {
    flex: 1,
  },
  expenseCat: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  expenseDept: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
  expenseVar: {
    fontSize: 10.5,
    marginTop: 1,
  },
  varUnderBudget: { color: '#047857' },
  varOverBudget: { color: '#b91c1c' },

  /* Board Review Tab */
  quarterPillRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 2,
    alignSelf: 'flex-start',
    gap: 2,
  },
  quarterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  quarterPillActive: {
    backgroundColor: '#ffffff',
    elevation: 1,
    ...(Platform.OS === 'web' ? { boxShadow: '0 1px 2px rgba(0,0,0,0.06)' } : {}),
  },
  quarterPillText: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
  },
  quarterPillTextActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  boardDossierCard: {
    backgroundColor: '#ffffff',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    ...THEME.shadow.card,
    gap: 14,
  },
  dossierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dossierTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#09090b',
  },
  dossierSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  dossierBeatBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  dossierBeatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  scorecardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexWrap: 'wrap',
    gap: 8,
  },
  scorecardCol: {
    flex: 1,
    minWidth: 120,
  },
  scorecardLabel: {
    fontSize: 10.5,
    color: '#64748b',
    marginBottom: 2,
  },
  scorecardVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#09090b',
  },
  scorecardValGreen: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
  },
  scorecardValBlue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  commentaryBox: {
    backgroundColor: '#fbfcfd',
    borderLeftWidth: 3,
    borderLeftColor: '#0f172a',
    padding: 12,
    borderRadius: 4,
    gap: 6,
  },
  commentaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentaryHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  commentaryBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  riskBox: {
    backgroundColor: '#fffdfb',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    padding: 12,
    borderRadius: 4,
    gap: 6,
  },
  riskHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  riskBody: {
    fontSize: 12,
    color: '#451a03',
    lineHeight: 18,
  },
  signoffBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  signoffText: {
    fontSize: 11,
    color: '#64748b',
  },
  signoffBold: {
    fontWeight: '700',
    color: '#09090b',
  },

  /* Contracts Tab */
  contractSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    ...THEME.shadow.card,
    gap: 10,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  contractTotalVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  contractStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  contractStatusText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  subTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  tierTag: {
    fontSize: 9.5,
    color: '#0f172a',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    fontWeight: '600',
  },
  regionTag: {
    fontSize: 10.5,
    color: '#64748b',
  },

  /* Aging Strip */
  agingTotalText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#047857',
  },
  agingBarTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  agingLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },

  bold: {
    fontSize: 13,
    fontWeight: '600',
    color: '#09090b',
  },
  cellText: {
    fontSize: 13,
    color: '#334155',
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
});
