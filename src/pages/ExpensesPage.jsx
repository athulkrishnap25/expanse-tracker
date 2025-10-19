import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import { FiPlus } from 'react-icons/fi';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ExpenseModal from '../components/expenses/ExpenseModal'; // We will create this next

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
      setExpenses(expensesData.sort((a, b) => b.expenseDate.toDate() - a.expenseDate.toDate()));
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
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Sidebar />
        <main className="flex-1">
          <Navbar />
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Business Expenses</h2>
              <button onClick={handleOpenAddModal} className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700">
                <FiPlus /> Add Expense
              </button>
            </div>
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
                    {expenses.map(expense => (
                      <tr key={expense.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="p-4">{formatDate(expense.expenseDate)}</td>
                        <td className="p-4 font-medium">{expense.category}</td>
                        <td className="p-4 text-gray-300">{expense.description}</td>
                        <td className="p-4 font-semibold">{formatCurrency(expense.amount)}</td>
                        <td className="p-4 flex gap-4">
                          <button onClick={() => handleOpenEditModal(expense)} className="text-cyan-400 hover:text-cyan-300">Edit</button>
                          <button onClick={() => handleDelete(expense.id)} className="text-red-400 hover:text-red-300">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
      <ExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onExpenseSaved={fetchExpenses}
        expenseToEdit={currentExpense}
      />
    </>
  );
};

export default ExpensesPage;