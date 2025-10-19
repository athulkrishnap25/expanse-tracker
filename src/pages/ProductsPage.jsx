import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import ProductModal from '../components/products/ProductModal';
import Spinner from '../components/ui/Spinner';
import { FiPlus } from 'react-icons/fi';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const ProductsPage = () => {
  // State for the list of products
  const [products, setProducts] = useState([]);
  
  // State for loading indicators
  const [loading, setLoading] = useState(true);
  
  // State to manage the modal's visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State to hold the product being edited
  const [currentProduct, setCurrentProduct] = useState(null);

  // --- DATA FETCHING ---

  // Function to fetch all products from Firestore
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsCollectionRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsCollectionRef);
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect runs once when the page loads to fetch initial data
  useEffect(() => {
    fetchProducts();
  }, []);

  // --- HANDLERS ---

  // Opens the modal in "Add" mode
  const handleOpenAddModal = () => {
    setCurrentProduct(null); // Ensure no product is selected for editing
    setIsModalOpen(true);
  };

  // Opens the modal in "Edit" mode with the selected product's data
  const handleOpenEditModal = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  // Handles the deletion of a product
  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const productDocRef = doc(db, 'products', productId);
        await deleteDoc(productDocRef);
        fetchProducts(); // Refresh the product list after deleting
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  // Helper function to format numbers into Indian Rupees
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0
  }).format(amount);

  // --- JSX RENDER ---

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Sidebar />
        <main className="flex-1">
          <Navbar />
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Your Products</h2>
              <button 
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition duration-300"
              >
                <FiPlus />
                Add Product
              </button>
            </div>
            
            <div className="overflow-x-auto bg-gray-800/50 backdrop-blur-lg rounded-2xl">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner />
                </div>
              ) : (
                <table className="min-w-full text-sm text-left">
                  <thead className="border-b border-gray-700">
                    <tr>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Cost Price</th>
                      <th className="p-4">Selling Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length > 0 ? (
                      products.map(product => (
                        <tr key={product.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="p-4 font-medium">{product.productName}</td>
                          <td className="p-4 text-gray-300">{formatCurrency(product.costPrice)}</td>
                          <td className="p-4 text-green-400">{formatCurrency(product.sellingPrice)}</td>
                          <td className="p-4">{product.stockQuantity}</td>
                          <td className="p-4 flex gap-4">
                            <button 
                              onClick={() => handleOpenEditModal(product)}
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-400">
                          No products found. Click "Add Product" to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onProductAdded={fetchProducts}
        productToEdit={currentProduct}
      />
    </>
  );
};

export default ProductsPage;