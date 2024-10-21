import React, { useState } from 'react';
import './ProductDetailSidebar.css';

const ProductDetailSidebar = ({ isOpen, onClose, product, customFields }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle image navigation
  const handleNext = () => {
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === product.imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevious = () => {
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? product.imageUrls.length - 1 : prevIndex - 1
      );
    }
  };

  return (
    <div className={`product-details-sidebar-container ${isOpen ? 'open' : ''}`}>
     <button onClick={onClose} className="close-button">Close</button>
      {product && (
        <div className="product-details">
          {product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0 ? (
            <div className="image-slider">
              <button onClick={handlePrevious} className="slider-button previous">‹</button>
              <img
                src={product.imageUrls[currentImageIndex]}
                alt={product.productName}
                className="product-image-sidebar"
              />
              <button onClick={handleNext} className="slider-button next">›</button>
            </div>
          ) : (
            product.imageUrls && (
              <img src={product.imageUrls} alt={product.productName} className="product-image-sidebar" />
            )
          )}
          <h2>{product.productName}</h2>
          <p>Product Code: {product.productCode}</p>
          <p>Brand: {product.brandName}</p>
          <p>Description: {product.description}</p>
          <p>Quantity: {product.quantity}</p>
          <p>Price: {product.price}</p>
          <p>Deposit: {product.deposit}</p>

          {/* Render custom fields */}
          {customFields.length > 0 && (
            <div className="custom-fields">
              <h3>Custom Fields:</h3>
              {customFields.map((field, index) => (
                <p key={index}>
                  {field.replace(/([A-Z])/g, ' $1')}: {product.customFields?.[field] || '-'}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
       
    </div>
  );
};

export default ProductDetailSidebar;
