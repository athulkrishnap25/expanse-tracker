import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { FiSearch, FiShoppingCart, FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

const NewSalePage = () => {
  const { currentUser } = useAuth();

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);

  // State for the current sale cart
  const [cart, setCart] = useState([]);

  // --- SEARCH LOGIC ---
  useEffect(() => {
    // Debounce to prevent querying on every keystroke
    const debounceFetch = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }
      
      const fetchProducts = async () => {
        setSearchLoading(true);
        try {
          const productsRef = collection(db, 'products');
          const q = query(
            productsRef,
            where('productName', '>=', searchQuery.toLowerCase()),
            where('productName', '<=', searchQuery.toLowerCase() + '\uf8ff'),
            limit(10)
          );
          const querySnapshot = await getDocs(q);
          const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSearchResults(results);
        } catch (error) {
          console.error("Error searching products:", error);
        } finally {
          setSearchLoading(false);
        }
      };

      fetchProducts();
    }, 300); // 300ms delay

    return () => clearTimeout(debounceFetch);
  }, [searchQuery]);

  // --- CART LOGIC ---
  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };
  
  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, amount) => {
    setCart(prevCart => prevCart.map(item =>
      item.id === productId 
      ? { ...item, quantity: Math.max(1, item.quantity + amount) }
      : item
    ));
  };
  
  // --- SALE RECORDING LOGIC ---
  const handleRecordSale = async () => {
    if (cart.length === 0 || recordLoading) return;
    setRecordLoading(true);

    try {
      const saleItems = cart.map(item => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        priceAtTimeOfSale: item.sellingPrice,
        costAtTimeOfSale: item.costPrice,
      }));

      await addDoc(collection(db, 'sales'), {
        saleDate: serverTimestamp(),
        items: saleItems,
        totalAmount: total,
        costOfGoods: cart.reduce((acc, item) => acc + item.costPrice * item.quantity, 0),
        discount: discount,
        recordedBy: currentUser.uid,
      });

      setCart([]);
      setSearchQuery('');
      alert('Sale recorded successfully!');

    } catch (error) {
      console.error("Error recording sale:", error);
      alert('Failed to record sale. Please try again.');
    } finally {
      setRecordLoading(false);
    }
  };

  // --- CALCULATIONS & FORMATTING ---
  const subtotal = cart.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);
  const discount = 0;
  const total = subtotal - discount;

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0
  }).format(amount);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <Sidebar />
      <main className="flex-1">
        <Navbar />
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Product Selection */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Select Products</h3>
              <div className="relative mb-4">
                <FiSearch className="absolute w-5 h-5 text-gray-400 top-3 left-3" />
                <input
                  type="text"
                  placeholder="Search by product name..."
                  className="w-full py-2 pl-10 pr-4 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="h-96 overflow-y-auto">
                {searchLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                {!searchLoading && searchResults.map(product => (
                  <div 
                    key={product.id} 
                    className="flex justify-between items-center p-3 hover:bg-cyan-500/10 rounded-lg cursor-pointer transition-colors"
                    onClick={() => handleAddToCart(product)}
                  >
                    <div>
                      <p className="font-semibold">{product.productName}</p>
                      <p className="text-sm text-gray-400">In Stock: {product.stockQuantity}</p>
                    </div>
                    <p className="font-bold text-lg text-green-400">{formatCurrency(product.sellingPrice)}</p>
                  </div>
                ))}
                 {!searchLoading && searchResults.length === 0 && searchQuery && (
                  <p className="text-center text-gray-400 pt-10">No products found matching "{searchQuery}"</p>
                 )}
              </div>
            </div>
          </div>

          {/* Right Column: Current Sale (Cart) */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-4">
                <FiShoppingCart className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-semibold">Current Sale</h3>
              </div>
              
              <div className="space-y-3 h-64 overflow-y-auto pr-2">
                {cart.length === 0 && <p className="text-center text-gray-400 pt-10">Your cart is empty</p>}
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => handleUpdateQuantity(item.id, -1)} className="p-1 rounded-full bg-gray-600 hover:bg-gray-500"><FiMinus size={12}/></button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.id, 1)} className="p-1 rounded-full bg-gray-600 hover:bg-gray-500"><FiPlus size={12}/></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{formatCurrency(item.sellingPrice * item.quantity)}</p>
                      <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-400 hover:text-red-300"><FiX size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-gray-300"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-gray-300"><span>Discount</span><span>{formatCurrency(discount)}</span></div>
                <div className="flex justify-between text-white font-bold text-lg"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>

              <button 
                onClick={handleRecordSale}
                className="w-full mt-6 py-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition duration-300 disabled:bg-cyan-800 disabled:cursor-not-allowed flex justify-center" 
                disabled={cart.length === 0 || recordLoading}
              >
                {recordLoading ? <Spinner /> : 'Record Sale'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewSalePage;