import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Spinner from '../ui/Spinner';

const ProductModal = ({ isOpen, onClose, onProductAdded, productToEdit }) => {
  const [formData, setFormData] = useState({
    productName: '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // This effect runs when the modal opens or when productToEdit changes
  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit); // If editing, fill the form with product data
    } else {
      // If adding, reset the form
      setFormData({
        productName: '', costPrice: '', sellingPrice: '', stockQuantity: ''
      });
    }
  }, [productToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { productName, costPrice, sellingPrice, stockQuantity } = formData;
    if (!productName || !costPrice || !sellingPrice || !stockQuantity) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const productData = {
        productName,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: Number(stockQuantity),
      };

      if (productToEdit) {
        // If we are editing, UPDATE the existing document
        const productDocRef = doc(db, 'products', productToEdit.id);
        await updateDoc(productDocRef, productData);
      } else {
        // If we are not editing, ADD a new document
        await addDoc(collection(db, 'products'), productData);
      }
      
      onProductAdded(); // Refresh the product list
      onClose();       // Close the modal
      
    } catch (err) {
      setError('Failed to save product. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="w-full max-w-lg p-8 bg-gray-800 rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            {productToEdit ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 rounded-full hover:bg-gray-700"><FiX /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-400">Product Name</label>
            <input name="productName" type="text" value={formData.productName} onChange={handleChange} className="w-full p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-gray-400">Cost Price (₹)</label>
              <input name="costPrice" type="number" value={formData.costPrice} onChange={handleChange} className="w-full p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-400">Selling Price (₹)</label>
              <input name="sellingPrice" type="number" value={formData.sellingPrice} onChange={handleChange} className="w-full p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Stock Quantity</label>
            <input name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} className="w-full p-2 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="pt-4 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-500">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-800 flex items-center">
              {loading ? <Spinner /> : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;