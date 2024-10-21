import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Assuming you have Firebase initialized here
import { useUser } from '../Auth/UserContext'; // Assuming you're using a UserContext for branchCode
import '../Product/Addproduct.css';
import { FaPlus } from 'react-icons/fa';
import UserHeader from '../UserDashboard/UserHeader';
import UserSidebar from '../UserDashboard/UserSidebar';

function EditProduct() {
  const { productCode } = useParams(); // Get productCode from URL
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [description, setDescription] = useState('');
  const [minimumRentalPeriod, setMinimumRentalPeriod] = useState(1);
  const [priceType, setPriceType] = useState('');
  const [extraRent, setExtraRent] = useState(1);
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [branchCode, setBranchCode] = useState('');
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { userData } = useUser();
  const navigate = useNavigate();
  const imageInputRef = useRef();

  useEffect(() => {
    if (userData && userData.branchCode) {
      setBranchCode(userData.branchCode);
    }

    // Fetch product data when component mounts
    const fetchProductData = async () => {
      const productRef = doc(db, 'products', productCode);
      const productDoc = await getDoc(productRef);
      if (productDoc.exists()) {
        const productData = productDoc.data();
        setProductName(productData.productName);
        setBrandName(productData.brandName);
        setQuantity(productData.quantity);
        setPrice(productData.price);
        setDeposit(productData.deposit);
        setDescription(productData.description);
        setMinimumRentalPeriod(productData.minimumRentalPeriod);
        setExtraRent(productData.extraRent);
        setPriceType(productData.priceType);
       
        // Set image previews if available
        if (productData.imageUrls) {
          setImages(productData.imageUrls);
          setImagePreview(productData.imageUrls[0]); // Set first image as preview
        }
        setCustomFieldValues(productData.customFields || {});
      }
    };

    fetchProductData();
  }, [productCode, userData]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages(files);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleImageClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check for required fields
   
  
    try {
      const storage = getStorage();
      const imageUrls = [];
  
      for (const image of images) {
        const storageRef = ref(storage, `products/${image.name}`);
        await uploadBytes(storageRef, image);
        const imageUrl = await getDownloadURL(storageRef);
        imageUrls.push(imageUrl);
      }
  
      const productData = {
        productName,
        productCode,
        brandName,
        quantity: parseInt(quantity, 10),
        price: parseFloat(price),
        deposit: parseFloat(deposit),
        description,
        imageUrls,
        branchCode,
        customFields: customFieldValues,
        
        priceType,
        extraRent: parseInt(extraRent, 10), // Provide default gender if not selected
        minimumRentalPeriod: parseInt(minimumRentalPeriod, 10),

      };
  
      const productRef = doc(db, 'products', productCode);
      await setDoc(productRef, productData);
  
      alert('Product updated successfully!');
      navigate('/productdashboard');
    } catch (error) {
      console.error('Error updating product: ', error);
      alert('Failed to update product');
    }
  };
  

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };



  return (
      <div className={`add-product-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <UserSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
        <div className="add-product-name">
          <UserHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />
          <h2 style={{ marginLeft: '20px', marginTop: '70px' }}>
            Edit Product
          </h2>

      <form className="product-form" onSubmit={handleSubmit}>
        <div className="general-info">
          <div className='left'>
            <label className='pd'>Product Details</label>
            <label>Product Name</label>
            <input value={productName} onChange={(e) => setProductName(e.target.value)} required />

            <label>Product Code</label>
            <input value={productCode} readOnly required /> {/* Product Code should not be editable */}

            <label>Quantity</label>
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} required />

            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

            
          </div>
        </div>
        <div className='right'>
          <label>Upload Images</label>
          <div
            className="image-upload-box"
            onClick={handleImageClick}
            style={{
              backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: imagePreview ? 'none' : '1px dashed gray',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
            }}
          >
            {!imagePreview && (
              <span style={{ fontSize: '24px', color: '#999' }}>
                <FaPlus />
              </span>
            )}
          </div>
          <input
            type="file"
            multiple
            onChange={handleImageChange}
            ref={imageInputRef}
            style={{ display: 'none' }} // Hide file input
          />
        </div>

        <div className="pricing">
          <div className='bottom-left'>
            <label>Base Rent</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <label>Deposit</label>
            <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} required />
            <label>Rent Calculated By</label>
            <select value={priceType} onChange={(e) => setPriceType(e.target.value)}>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
            <label>Minimum Rental Period</label>
            <input type="number" value={minimumRentalPeriod} onChange={(e) => setMinimumRentalPeriod(e.target.value)} />
            <label>Add-On Charges</label>
            <div className="extra-rent-group">
              <input
                type="number"
                value={extraRent}
                onChange={(e) => setExtraRent(e.target.value)}
                
                style={{ width: '90%' }}
              />
              </div>
          </div>
        </div>

        <div className='right1'>
          <label>Brand Name</label>
          <input value={brandName} onChange={(e) => setBrandName(e.target.value)}  />
        </div>
        <div className="submit-button5">
          <button type="submit">Update Product</button>
        </div>
      </form>
    </div>
    </div>
  );
}

export default EditProduct;
