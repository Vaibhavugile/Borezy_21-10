import React from 'react';
import './BRightsidebar.css'; // Import your styles

const BRightSidebar = ({ isOpen, onClose, booking }) => {
  return (
    <div className={`right-sidebar ${isOpen ? 'open' : ''}`}>
      <button onClick={onClose} className="close-button">Close</button>
      <h2>Booking Details</h2>
      {booking ? (
        <div>
          <h3>Receipt Number: {booking.receiptNumber}</h3>
          <p><strong>Username:</strong> {booking.username}</p>
          <p><strong>Contact No:</strong> {booking.contactNo}</p>
          <p><strong>Email:</strong> {booking.email}</p>
          <p><strong>Pickup Date:</strong> {new Date(booking.pickupDate).toLocaleDateString()}</p>
          <p><strong>Return Date:</strong> {new Date(booking.returnDate).toLocaleDateString()}</p>
          <p><strong>Quantity:</strong> {booking.quantity}</p>
          <p><strong>Stage:</strong> {booking.stage}</p>
          <p><strong>Price:</strong> {booking.price}</p>
          <p><strong>Deposit:</strong> {booking.deposit}</p>
          <p><strong>Price Type:</strong> {booking.priceType}</p>
          <p><strong>Minimum Rental Period:</strong> {booking.minimumRentalPeriod}</p>
          <p><strong>Discounted Grand Total:</strong> {booking.discountedGrandTotal}</p>
          <p><strong>Extra Rent:</strong> {booking.extraRent}</p>
          {/* Add more booking details here if needed */}
          {booking.products.map((product) => (
                            <div key={product.productCode}>
                                {product.productCode}: {product.quantity}:₹{product.price}:₹{product.deposit}
                            </div>
                            ))}
        </div>
      ) : (
        <p>No booking selected.</p>
      )}
    </div>
  );
};

export default BRightSidebar;