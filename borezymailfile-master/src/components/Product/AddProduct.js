import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Assuming you have Firebase initialized here
import { useUser } from '../Auth/UserContext'; // Assuming you're using a UserContext for branchCode
import '../Product/Addproduct.css';
import { FaPlus} from 'react-icons/fa';

import UserHeader from '../UserDashboard/UserHeader';
import UserSidebar from '../UserDashboard/UserSidebar';



function AddProduct() {
  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [productCode, setProductCode] = useState('');
  const [description, setDescription] = useState('');
  const [minimumRentalPeriod,setMinimumRentalPeriod] = useState(1)
  const [images, setImages] = useState([]); // Handle multiple images
  const [imagePreview, setImagePreview] = useState(null); // For showing image preview
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [branchCode, setBranchCode] = useState(''); // Store branch code
  const [customFields, setCustomFields] = useState([]); // Store custom fields
  const [showCustomFieldForm, setShowCustomFieldForm] = useState(false); // Toggle form visibility
  const [newFieldLabel, setNewFieldLabel] = useState(''); // New field label
  const [newFieldType, setNewFieldType] = useState('text'); // New field input type
  const [customFieldValues, setCustomFieldValues] = useState({}); // Store values for custom fields
  const [bookingId, setBookingId] = useState(''); // State for booking ID
  const [priceType, setPriceType] = useState('');
  const [extraRent, setExtraRent] = useState(1);
  const [extraChargeType, setExtraChargeType] = useState('%'); // State to toggle between percentage and fixed


  // const [gender,setGender]=useState('')
  // States for Size-Gender selection
  const [sidebarOpen, setSidebarOpen] = useState(false);

  
  const { userData } = useUser(); // Get user data from context
  const navigate = useNavigate(); // Initialize navigate
  const imageInputRef = useRef(); // Ref for the file input element

  useEffect(() => {
    if (userData && userData.branchCode) {
      setBranchCode(userData.branchCode);
    }
  }, [userData]);

  // Handle image change and preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    console.log("Files selected:", files); // Check if files are selected

    if (files.length > 0) {
      setImages(files); // Store all selected images
      
      const reader = new FileReader();
      reader.onload = (event) => {
        console.log("Image loaded, preview set:", event.target.result); // Log image preview result
        setImagePreview(event.target.result); // Preview the first image
      };

      console.log("Reading first image file:", files[0]);
      reader.readAsDataURL(files[0]); // Read and display the first image
    }
  };

  // Trigger file input when clicking on the image box
  const handleImageClick = () => {
    if (imageInputRef.current) {
      console.log("Image box clicked, triggering file input");
      imageInputRef.current.click(); // Simulate click on hidden input
    }
  };

  const handleAddCustomField = () => {
    if (newFieldLabel) {
      setCustomFields([...customFields, { label: newFieldLabel, type: newFieldType }]);
      setNewFieldLabel('');
      setNewFieldType('text');
      setShowCustomFieldForm(false);
    }
  };

  const handleDeleteCustomField = (index) => {
    const updatedCustomFields = customFields.filter((_, i) => i !== index);
    setCustomFields(updatedCustomFields);
  };

 

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        brandName,
        quantity: parseInt(quantity, 10),
        price: parseFloat(price),
        deposit: parseFloat(deposit),
        productCode,
        description,
        imageUrls,
        branchCode,
        customFields: customFieldValues,
        // Include selected gender in product data
        priceType,
        extraRent: parseInt(extraRent, 10),
        minimumRentalPeriod:parseInt(minimumRentalPeriod,10),
      };

      // Use setDoc to explicitly set the document ID as productCode
      const productRef = doc(collection(db, 'products'), productCode);
      await setDoc(productRef, productData);

      // Add an empty bookings sub-collection
      await addDoc(collection(productRef, 'bookings'), {}); // Empty document with bookingId as ID

      alert('Product and bookings added successfully!');
      navigate('/productdashboard');
      
      // Reset form
      setProductName('');
      setBrandName('');
      setQuantity('');
      setPrice('');
      setDeposit('');
      setProductCode('');
      setDescription('');
      setImages([]);
      setCustomFieldValues({});
      // Reset gender
      setPriceType('')

    } catch (error) {
      console.error("Error adding product: ", error);
      alert('Error adding product. Please try again.');
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
            Add new product
          </h2>

      <form className="product-form">
        <div className="general-info">
        <div className='left'>
            <label className='pd'>Product Details</label>
          <label>Product Name</label>
          <input value={productName} onChange={(e) => setProductName(e.target.value)} required />

          <label>Product Code</label>
          <input value={productCode} onChange={(e) => setProductCode(e.target.value)} required />
          
          <label>Quantity</label>
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} required />

          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

          {/* Size and Gender inputs */}
          
          </div>
        </div>
        <div className='right'>
          <label>Upload Images</label>
          <div
            className="image-upload-box"
            onClick={handleImageClick} // Trigger file input on click
            style={{
              backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
              backgroundSize: 'cover', // Adjust the image size to cover the box
              backgroundPosition: 'center', // Center the image in the box
              border: imagePreview ? 'none' : '1px dashed gray',
              display: 'flex',            // Make the div a flex container
              justifyContent: 'center',   // Center content horizontally
              alignItems: 'center',       // Center content vertically
              height: '200px',            // Set the height for your image box
            }}
          >
            {!imagePreview && (
              <span style={{ fontSize: '24px', color: '#999' }}> {/* Optional styling for the icon */}
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

       

        {/* Pricing and Quantity */}
        <div className="pricing">
          <div className='bottom-left'>
          <label>Base Rent</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <label>Deposit</label>
            <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} required />
            <label>Rent Calculated By</label>
            <select value={priceType} onChange={(e) => setPriceType(e.target.value)}>
              <option value= "">Select Price Type</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
            <label>Minimum Rental Period</label>
            <input type="number" value={minimumRentalPeriod} onChange={(e) => setMinimumRentalPeriod(e.target.value)} required />
            <label>Add-On Charges</label>
            <div className="extra-rent-group">
              <input
                type="number"
                value={extraRent}
                onChange={(e) => setExtraRent(e.target.value)}
                required
                style={{ width: '90%' }}
              />
              {/* Toggle Buttons */}
              <button
                type="button"
                className={`toggle-button ${extraChargeType === '%' ? 'active' : ''}`}
                onClick={() => setExtraChargeType('%')}
                
              >
                %
              </button>
              <button
                type="button"
                className={`toggle-button ${extraChargeType === '₹' ? 'active' : ''}`}
                onClick={() => setExtraChargeType('₹')}
              >
                ₹
              </button>
            </div>
          </div>

         
        </div>

        <div className='right1'>
          <label>Brand Name</label>
          <input value={brandName} onChange={(e) => setBrandName(e.target.value)} required />
          <div className="submit-button5" >
          <button onClick={() => navigate('/productdashboard')} type="button" className='can'>Cancel</button>
          <button onClick={handleSubmit}>Add Product</button>
        </div>
          </div>
      </form>
    </div>
    </div>
  );
}

export default AddProduct;