import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where,setDoc,addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import './Product.css';
import UserHeader from '../UserDashboard/UserHeader';
import UserSidebar from '../UserDashboard/UserSidebar';
import searchIcon from '../../assets/Search.png';
import { FaSearch, FaFilter, FaDownload, FaUpload, FaPlus, FaEdit, FaTrash, FaCopy } from 'react-icons/fa';
import { useUser } from '../Auth/UserContext';
import ProductDetailSidebar from './ProductDetailSidebar';

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('productName');
  const [importedData, setImportedData] = useState(null);
  const navigate = useNavigate();
  const { userData } = useUser();
  const [customFields, setCustomFields] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);  // State for selected product

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('branchCode', '==', userData.branchCode)
        );
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Gather all custom fields from products
        const allCustomFields = new Set();
        fetchedProducts.forEach((product) => {
          if (product.customFields) {
            Object.keys(product.customFields).forEach(field => allCustomFields.add(field));
          }
        });

        setProducts(fetchedProducts);
        setTotalProducts(fetchedProducts.length);
        setCustomFields([...allCustomFields]);
      } catch (error) {
        console.error('Error fetching products data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsData();
  }, [userData]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter((product) => product.id !== id));
      setTotalProducts(totalProducts - 1);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (productCode) => {
    navigate(`/editproduct/${productCode}`);
  };

  const handleAddProduct = () => {
    navigate('/addproduct');
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = () => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    if (lowerCaseQuery === '') {
      setProducts(products); // Show all products if search query is empty
    } else {
      const filteredProducts = products.filter(product =>
        product[searchField]?.toLowerCase().includes(lowerCaseQuery)
      );
      setProducts(filteredProducts);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, searchField]);

  const exportToCSV = () => {
    const csv = Papa.unparse(products);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'products.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

 // Ensure you have the Firebase config file with Firestore initialization

 
 
  // Ensure this imports a valid Firestore instance
 
 const handleImport = (event) => {
   const file = event.target.files[0];
   console.log('Selected file:', file); // Log the selected file
 
   if (file) {
     Papa.parse(file, {
       header: true,
       complete: async (result) => {
         console.log('Parsed CSV Data:', result.data); // Log parsed CSV data
 
         const importedProducts = result.data
           .filter(row => row && Object.keys(row).length > 0) // Filter out empty rows
           .map(row => {
             const { customFields, imageUrls, ...productWithoutCustomFields } = row; // Exclude customFields
             
             // Safeguard for imageUrls
             let imageUrlsArray = [];
             if (imageUrls) {
               try {
                 imageUrlsArray = Array.isArray(imageUrls) 
                   ? imageUrls 
                   : imageUrls.split(',').map(url => url.trim()); // Split by comma and trim
               } catch (error) {
                 console.error('Error parsing imageUrls:', error);
               }
             }
 
             return { 
               ...productWithoutCustomFields, 
               imageUrls: imageUrlsArray // Save imageUrls as an array
             }; 
           });
 
         // Check if there are products to save
         if (importedProducts.length === 0) {
           console.warn('No products to import.');
           return;
         }
 
         // Loop through each product and save to Firestore using productCode as the document ID
         await Promise.all(importedProducts.map(async (product) => {
           try {
             // Ensure productCode is defined
             if (!product.productCode) {
               console.error('Product code is missing:', product);
               return; // Skip saving this product
             }
 
             const productRef = doc(db, 'products', product.productCode); // Create a reference using productCode
             await setDoc(productRef, product); // Set the document with product data
             console.log('Product saved successfully:', product);
           } catch (error) {
             console.error('Error saving product to Firestore:', error, product);
           }
         }));
 
         setImportedData(importedProducts); // Store the imported products locally if needed
         console.log('Imported products:', importedProducts);
       },
       error: (error) => {
         console.error('Error parsing CSV:', error);
       }
     });
   }
 };
 

 const handlecopy = (product) => {
  // Destructure product details from the product object
  const { productName, productCode, brandName, description, quantity, price, deposit } = product;

  // Format the text for copying
  const formattedText = `
    Product Name: ${productName || '-'}
    Product Code: ${productCode || '-'}
    Brand Name: ${brandName || '-'}
    Description: ${description || '-'}
    Quantity: ${quantity || '-'}
    Rent: ${price || '-'}
    Deposit: ${deposit || '-'}
  `;

  // Copy to clipboard
  navigator.clipboard.writeText(formattedText.trim());

  // Display a confirmation alert
  alert("Product details copied to clipboard:\n" );
};
  
  
  const handleProductCodeClick = (product) => {
    setSelectedProduct(product);
    setRightSidebarOpen(true);
  };
  const closeRightSidebar = () => {
    setRightSidebarOpen(false);
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <UserSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="dashboard-content">
        <UserHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />
        <h2 style={{ marginLeft: '10px', marginTop: '100px' }}>
          Total Products
        </h2>
        <p style={{ marginLeft: '10px' }}>{totalProducts} Products</p>
        <div className="toolbar-container">
          <div className="search-bar-container7">
            <img src={searchIcon} alt="search icon" className="search-icon7" />
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="search-dropdown7"
            >
              <option value="productName">Product Name</option>
              <option value="brandName">Brand Name</option>
              <option value="productCode">Product Code</option>
              <option value="description">Description</option>
            </select>
            <input
              type="text"
              placeholder={`Search by ${searchField.replace(/([A-Z])/g, ' $1')}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="action-buttons">
          <label className="export-button" onClick={exportToCSV}>
              <FaDownload/>
              Export
            </label>
            <label htmlFor="import" className="import-button">
              <FaUpload/>
              Import
              <input
                type="file"
                id="import"
                accept=".csv"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>
            <label className="add-product-button" onClick={handleAddProduct}>
          <FaPlus />
              Add Product
            </label> 
          </div>
        </div>
        <div className="table-container">
          {loading ? (
            <p>Loading products...</p>
          ) : products.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Sr.No.</th>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Product Code</th>
                  <th>Brand Name</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Rent</th>
                  <th>Deposit</th>
                  {/* Dynamically add custom field headers */}
                  {customFields.map((field, index) => (
                    <th key={index}>{field.replace(/([A-Z])/g, ' $1')}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>
                      {Array.isArray(product.imageUrls) && product.imageUrls.length > 0 ? (
                        <img src={product.imageUrls[0]} alt={product.productName} className="product-image" />
                      ) : (
                        product.imageUrl && (
                          <img src={product.imageUrl} alt={product.productName} className="product-image" />
                        )
                      )}
                    </td>
                    <td>{product.productName}</td>
                    <td onClick={() => handleProductCodeClick(product)} style={{ cursor: 'pointer' }} className="clickable">
                      {product.productCode}
                    </td>

                    <td>{product.brandName}</td>
                    <td>{product.description}</td>
                    <td>{product.quantity}</td>
                    <td>{product.price}</td>
                    <td>{product.deposit}</td>
                    {/* Render custom field values */}
                    {customFields.map((field, fieldIndex) => (
                      <td key={fieldIndex}>{product.customFields?.[field] || '-'}</td>
                    ))}
                    <td>
                      <div className="action-buttons">
                        <label onClick={() => handlecopy(product)}><FaCopy style={{ color: '#757575', cursor: 'pointer' }} /> </label> {/* Pass the product object */}
                        <label onClick={() => handleEdit(product.id)}><FaEdit style={{ color: '#757575' , cursor: 'pointer'}} /></label>
                        <label onClick={() => handleDelete(product.id)}><FaTrash style={{ color: '#757575', cursor: 'pointer' }} /></label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No products found</p>
          )}
        </div>
        <ProductDetailSidebar
          isOpen={rightSidebarOpen}
          onClose={() =>  closeRightSidebar(false)}
          product={selectedProduct}
          customFields={customFields}
        />
      </div>
    </div>
  );
};

export default ProductDashboard;
