import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import { FiPlus } from 'react-icons/fi';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ExpenseModal from '../components/expenses/ExpenseModal';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'expenses'));
      const expensesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ensure expenseDate exists before sorting
      setExpenses(expensesData.sort((a, b) => {
        if (b.expenseDate && a.expenseDate) {
          return b.expenseDate.toDate() - a.expenseDate.toDate();
        }
        return 0;
      }));
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteDoc(doc(db, 'expenses', expenseId));
        fetchExpenses();
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    }
  };

  const handleOpenAddModal = () => {
    setCurrentExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setCurrentExpense(expense);
    setIsModalOpen(true);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0
  }).format(amount);

  const formatDate = (timestamp) => timestamp ? new Date(timestamp.seconds * 1000).toLocaleDateString('en-IN') : 'N/A';

  return (
    // Main container: Lock to screen height and prevent browser scroll
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Sidebar />
      
      {/* Main content area: Allow this part to scroll vertically if needed */}
      <main className="flex-1 overflow-y-auto">
        <Navbar />
        
        {/* Use responsive padding for the content area */}
        <div className="p-4 sm:p-6">
          
          {/* Header: Stack vertically on mobile, horizontally on larger screens */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold">Business Expenses</h2>
            <button 
              onClick={handleOpenAddModal} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <FiPlus /> Add Expense
            </button>
          </div>
          
          {/* Table container: Allows horizontal scrolling for the table on small screens */}
          <div className="overflow-x-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl">
            {loading ? (
              <div className="flex justify-center items-center h-64"><Spinner /></div>
            ) : (
              <table className="min-w-full text-sm text-left">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length > 0 ? (
                    expenses.map(expense => (
                      <tr key={expense.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="p-4 whitespace-nowrap">{formatDate(expense.expenseDate)}</td>
                        <td className="p-4 font-medium">{expense.category}</td>
                        <td className="p-4 text-gray-300">{expense.description}</td>
                        <td className="p-4 font-semibold whitespace-nowrap">{formatCurrency(expense.amount)}</td>
                        <td className="p-4 flex gap-2 sm:gap-4">
                          <button onClick={() => handleOpenEditModal(expense)} className="text-cyan-400 hover:text-cyan-300">Edit</button>
                          <button onClick={() => handleDelete(expense.id)} className="text-red-400 hover:text-red-300">Delete</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">
                        No expenses found. Click "Add Expense" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <br />
    <br />
    <br />
      </main>
      
      <ExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onExpenseSaved={fetchExpenses}
        expenseToEdit={currentExpense}
      />
    </div>
  );
};

export default ExpensesPage;