import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import { FiCalendar, FiDownload } from 'react-icons/fi';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const ReportsPage = () => {
  // Get today's date and the first day of the current month
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);

    const startTimestamp = Timestamp.fromDate(new Date(startDate));
    // Set end date to the end of the selected day
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    try {
      // 1. Fetch Sales Data
      const salesQuery = query(collection(db, 'sales'), where('saleDate', '>=', startTimestamp), where('saleDate', '<=', endTimestamp));
      const salesSnapshot = await getDocs(salesQuery);
      let totalRevenue = 0;
      let costOfGoods = 0;
      salesSnapshot.forEach(doc => {
        totalRevenue += doc.data().totalAmount;
        costOfGoods += doc.data().costOfGoods;
      });

      // 2. Fetch Expenses Data
      const expensesQuery = query(collection(db, 'expenses'), where('expenseDate', '>=', startTimestamp), where('expenseDate', '<=', endTimestamp));
      const expensesSnapshot = await getDocs(expensesQuery);
      let totalExpenses = 0;
      expensesSnapshot.forEach(doc => {
        totalExpenses += doc.data().amount;
      });
      
      // 3. Calculate Profits
      const grossProfit = totalRevenue - costOfGoods;
      const netProfit = grossProfit - totalExpenses;

      setReportData({
        totalRevenue,
        costOfGoods,
        grossProfit,
        totalExpenses,
        netProfit,
        salesCount: salesSnapshot.size,
        expensesCount: expensesSnapshot.size
      });

    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0
  }).format(amount);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Sidebar />
      <main className="flex-1">
        <Navbar />
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Financial Reports</h2>
          
          {/* Date Range Picker and Button */}
          <div className="flex flex-wrap items-center gap-4 p-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-400">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg"/>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-400">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg"/>
            </div>
            <button onClick={handleGenerateReport} disabled={loading} className="flex items-center gap-2 px-6 py-2 mt-5 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-800">
              {loading ? <Spinner/> : <FiCalendar/>}
              Generate Report
            </button>
          </div>

          {/* Report Display */}
          {reportData && (
            <div className="p-8 bg-gray-800/50 backdrop-blur-lg rounded-2xl animate-fade-in-up">
              <h3 className="text-xl font-semibold mb-6">Summary for {startDate} to {endDate}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-lg">
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(reportData.totalRevenue)}</p>
                  <p className="text-xs text-gray-500">{reportData.salesCount} sales</p>
                </div>
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-400">Cost of Goods (COGS)</p>
                  <p className="text-2xl font-bold text-yellow-400">{formatCurrency(reportData.costOfGoods)}</p>
                </div>
                 <div className="p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-400">Gross Profit</p>
                  <p className="text-2xl font-bold text-cyan-400">{formatCurrency(reportData.grossProfit)}</p>
                </div>
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-400">Business Expenses</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(reportData.totalExpenses)}</p>
                   <p className="text-xs text-gray-500">{reportData.expensesCount} expenses logged</p>
                </div>
                <div className="p-4 col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-r from-cyan-500/20 to-gray-700/30 rounded-lg">
                  <p className="text-gray-300">Net Profit (Final Take-Home)</p>
                  <p className="text-4xl font-extrabold text-white">{formatCurrency(reportData.netProfit)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <br />
    <br />
    <br />
    </div>
  );
};

export default ReportsPage;