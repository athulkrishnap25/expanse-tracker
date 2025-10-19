import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Spinner from '../ui/Spinner';

const ExpenseModal = ({ isOpen, onClose, onExpenseSaved, expenseToEdit }) => {
  const [formData, setFormData] = useState({ description: '', category: '', amount: '', expenseDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        ...expenseToEdit,
        expenseDate: expenseToEdit.expenseDate.toDate().toISOString().split('T')[0]
      });
    } else {
      setFormData({ description: '', category: 'Utilities', amount: '', expenseDate: new Date().toISOString().split('T')[0] });
    }
  }, [expenseToEdit, isOpen]);

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.category || !formData.amount || !formData.expenseDate) {
      setError('Date, Category, and Amount are required.');
      setLoading(false);
      return;
    }

    try {
      const expenseData = {
        ...formData,
        amount: Number(formData.amount),
        expenseDate: Timestamp.fromDate(new Date(formData.expenseDate))
      };

      if (expenseToEdit) {
        await updateDoc(doc(db, 'expenses', expenseToEdit.id), expenseData);
      } else {
        await addDoc(collection(db, 'expenses'), expenseData);
      }
      onExpenseSaved();
      onClose();
    } catch (err) {
      setError('Failed to save expense.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    // ✨ RESPONSIVE CHANGE: Added px-4 for padding on mobile screens
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      {/* ✨ RESPONSIVE CHANGE: Adjusted padding and max-width for different screen sizes */}
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-2xl shadow-2xl animate-fade-in-up md:max-w-lg md:p-8">
        <div className="flex justify-between items-center mb-6">
          {/* ✨ RESPONSIVE CHANGE: Adjusted heading size for mobile */}
          <h3 className="text-lg font-semibold text-white sm:text-xl">{expenseToEdit ? 'Edit Expense' : 'Add New Expense'}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 rounded-full hover:bg-gray-700"><FiX /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-400">Description (Optional)</label>
            <input name="description" type="text" value={formData.description} onChange={handleChange} className="w-full p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg"/>
          </div>
          {/* ✨ RESPONSIVE CHANGE: Grid now stacks to 1 column on mobile, 2 on small screens and up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-gray-400">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg">
                <option>Utilities</option>
                <option>Rent</option>
                <option>Salary</option>
                <option>Marketing</option>
                <option>Other</option>
              </select>
            </div>
             <div>
              <label className="block mb-1 text-sm text-gray-400">Amount (₹)</label>
              <input name="amount" type="number" value={formData.amount} onChange={handleChange} className="w-full p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg"/>
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Expense Date</label>
            <input name="expenseDate" type="date" value={formData.expenseDate} onChange={handleChange} className="w-full p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg"/>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* ✨ RESPONSIVE CHANGE: Buttons stack vertically on mobile, horizontally on small screens and up */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-500">Cancel</button>
            <button type="submit" disabled={loading} className="w-full sm:w-auto px-4 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700">
              {loading ? <Spinner /> : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;