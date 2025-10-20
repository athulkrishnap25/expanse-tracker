import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import { FiArrowUpRight, FiArrowDownRight, FiDollarSign, FiPackage } from 'react-icons/fi';
import SimpleChart from '../components/ui/SimpleChart';

// This reusable component displays a single statistic.
const StatCard = ({ title, value, change, icon, changeType, loading }) => {
  const isPositive = changeType === 'positive';
  if (loading) {
    return (
      <div className="p-4 sm:p-6 h-28 sm:h-36 flex justify-center items-center bg-gray-800/50 backdrop-blur-lg rounded-2xl">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs sm:text-sm text-gray-400">{title}</p>
        <div className={`p-2 rounded-lg bg-cyan-500/20 text-cyan-400`}>{icon}</div>
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white truncate">{value}</h2>
      {change && (
        <div className={`flex items-center mt-2 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <FiArrowUpRight /> : <FiArrowDownRight />}
          <span className="ml-1 truncate">{change} vs last month</span>
        </div>
      )}
    </div>
  );
};

// This is the main Dashboard Page component.
const DashboardPage = () => {
  // State to hold all calculated dashboard values and their changes.
  const [stats, setStats] = useState({
    totalRevenue: 0,
    netProfit: 0,
    totalExpenses: 0,
    lowStockCount: 0,
    revenueChange: null,
    profitChange: null,
    expensesChange: null,
  });
  const [loading, setLoading] = useState(true);
  const [salesChartData, setSalesChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // Helper function to safely calculate percentage change.
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? '+100%' : '0%'; // Handle division by zero.
    }
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // This effect runs once to fetch all necessary data.
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // --- 1. Define Date Ranges ---
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // --- 2. Create a reusable function to fetch data for a specific period ---
        const fetchDataForPeriod = async (startDate, endDate) => {
          const startTimestamp = Timestamp.fromDate(startDate);
          const endTimestamp = Timestamp.fromDate(endDate);
          
          const salesQuery = query(collection(db, 'sales'), where('saleDate', '>=', startTimestamp), where('saleDate', '<=', endTimestamp));
          const expensesQuery = query(collection(db, 'expenses'), where('expenseDate', '>=', startTimestamp), where('expenseDate', '<=', endTimestamp));
          
          const [salesSnapshot, expensesSnapshot] = await Promise.all([getDocs(salesQuery), getDocs(expensesQuery)]);

          let totalRevenue = 0, totalCost = 0;
          salesSnapshot.forEach(doc => {
            totalRevenue += doc.data().totalAmount || 0;
            totalCost += doc.data().costOfGoods || 0;
          });

          let totalExpenses = 0;
          expensesSnapshot.forEach(doc => {
            totalExpenses += doc.data().amount || 0;
          });

          return { totalRevenue, netProfit: totalRevenue - totalCost, totalExpenses };
        };

        // --- 3. Fetch data for both periods and for low stock items ---
        const [thisMonthData, lastMonthData] = await Promise.all([
          fetchDataForPeriod(thisMonthStart, now),
          fetchDataForPeriod(lastMonthStart, lastMonthEnd)
        ]);

        // --- 3a. Build chart datasets from sales documents for this month ---
        const salesRef = collection(db, 'sales');
        const salesQuery = query(salesRef, where('saleDate', '>=', Timestamp.fromDate(thisMonthStart)), where('saleDate', '<=', Timestamp.fromDate(now)));
        const salesSnapshot = await getDocs(salesQuery);

        // daily totals for current month (1..today)
        const daysInMonthSoFar = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        // we'll only show up to today
        const todayDay = now.getDate();
        const dailyTotals = Array.from({ length: todayDay }, () => 0);

        // product weekly aggregation (4 weeks buckets)
        const productWeekly = {}; // { productName: [w1,w2,w3,w4] }

        salesSnapshot.forEach(doc => {
          const data = doc.data();
          const saleDate = data.saleDate && data.saleDate.toDate ? data.saleDate.toDate() : null;
          if (!saleDate) return;

          const dayIndex = saleDate.getDate() - 1; // 0-based index for dailyTotals
          if (dayIndex >= 0 && dayIndex < dailyTotals.length) {
            dailyTotals[dayIndex] += data.totalAmount || 0;
          }

          // distribute items into weekly buckets for product charts
          const weekIndex = Math.min(3, Math.floor((saleDate - thisMonthStart) / (7 * 24 * 60 * 60 * 1000)));
          const items = data.items || [];
          items.forEach(item => {
            const name = item.productName || item.id || 'Unknown';
            const rev = (item.priceAtTimeOfSale ?? item.sellingPrice ?? 0) * (item.quantity ?? 1);
            if (!productWeekly[name]) productWeekly[name] = [0, 0, 0, 0];
            productWeekly[name][weekIndex] += rev;
          });
        });

        // prepare chart arrays
        const salesChartArr = dailyTotals.map(v => Math.round(v));

        // top products by total revenue across the month
        const top = Object.entries(productWeekly)
          .map(([name, weeks]) => ({ name, weeks, total: weeks.reduce((a, b) => a + b, 0) }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 3);

        setSalesChartData(salesChartArr);
        setTopProducts(top);
        
        const productsSnapshot = await getDocs(collection(db, 'products'));
        let lowStockCount = 0;
        productsSnapshot.forEach(doc => {
          const product = doc.data();
          if (product.stockQuantity <= (product.lowStockThreshold || 5)) {
            lowStockCount++;
          }
        });

        // --- 4. Calculate percentages and update the state ---
        setStats({
          totalRevenue: thisMonthData.totalRevenue,
          netProfit: thisMonthData.netProfit,
          totalExpenses: thisMonthData.totalExpenses,
          lowStockCount: lowStockCount,
          revenueChange: calculatePercentageChange(thisMonthData.totalRevenue, lastMonthData.totalRevenue),
          profitChange: calculatePercentageChange(thisMonthData.netProfit, lastMonthData.netProfit),
          expensesChange: calculatePercentageChange(thisMonthData.totalExpenses, lastMonthData.totalExpenses),
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper to format numbers into Indian Rupees.
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0
  }).format(amount);

  return (
    <div className="app-scrollable min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <Navbar />
          <div className="content-scrollable p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            <StatCard 
              title="Revenue (This Month)" 
              value={formatCurrency(stats.totalRevenue)} 
              change={stats.revenueChange} 
              icon={<FiDollarSign />} 
              // FIX: The color is now based on the percentage change, not the total value.
              changeType={parseFloat(stats.revenueChange) >= 0 ? 'positive' : 'negative'}
              loading={loading}
            />
            
            <StatCard 
              title="Net Profit (This Month)" 
              value={formatCurrency(stats.netProfit)} 
              change={stats.profitChange} 
              icon={<FiDollarSign />} 
              // FIX: The color is now based on the percentage change.
              changeType={parseFloat(stats.profitChange) >= 0 ? 'positive' : 'negative'}
              loading={loading}
            />
            
            <StatCard 
              title="Expenses (This Month)" 
              value={formatCurrency(stats.totalExpenses)} 
              change={stats.expensesChange} 
              icon={<FiDollarSign />} 
              // This logic is correct: an increase in expenses is a negative outcome (red).
              changeType={parseFloat(stats.expensesChange) >= 0 ? 'negative' : 'positive'}
              loading={loading}
            />
            
            <StatCard 
              title="Low Stock Items" 
              value={stats.lowStockCount} 
              change={null} 
              icon={<FiPackage />} 
              changeType="negative"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 mt-6 lg:grid-cols-3">
            <div className="p-4 sm:p-6 lg:col-span-2 bg-gray-800/50 backdrop-blur-lg rounded-2xl animate-fade-in-up">
              <h3 className="mb-4 text-lg font-semibold">Sales Trend</h3>
              <SimpleChart data={salesChartData.length ? salesChartData : [12000, 15000, 13000, 18000, 16000, stats.totalRevenue || 10000]} color="#06b6d4" />
            </div>
            <div className="p-4 sm:p-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl animate-fade-in-up">
              <h3 className="mb-4 text-lg font-semibold">Most Profitable Items</h3>
              <div className="flex flex-col gap-3">
                {topProducts.length === 0 && <p className="text-gray-400">No product data for this month yet</p>}
                {topProducts.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-400">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(p.total)}</p>
                    </div>
                    <div className="w-24">
                      <SimpleChart data={p.weeks.map(v => Math.round(v))} height={32} color={p.total > 0 ? '#34d399' : '#9ca3af'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    <br />
    <br />
    <br />

  </div>
  );
};

export default DashboardPage;