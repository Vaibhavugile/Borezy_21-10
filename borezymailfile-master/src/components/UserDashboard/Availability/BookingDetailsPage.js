import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import './BookingDetailsPage.css';

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A'; // Handle empty timestamp
  const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
  return date.toLocaleDateString('en-US'); // Return formatted date
};

const BookingDetailsPage = () => {
  const { receiptNumber } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientType, setClientType] = useState('Booking Pickup Pending');

  useEffect(() => {
    const fetchBookingAndProductDetails = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);

        let allBookings = [];

        for (const productDoc of productsSnapshot.docs) {
          const bookingsCollection = collection(db, 'products', productDoc.id, 'bookings');
          const q = query(bookingsCollection, where('receiptNumber', '==', receiptNumber));
          const querySnapshot = await getDocs(q);

          querySnapshot.docs.forEach((bookingDoc) => {
            allBookings.push({ ...bookingDoc.data(), product: productDoc.data() });
          });
        }

        setBookings(allBookings);
      } catch (error) {
        console.error('Error fetching booking or product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingAndProductDetails();
  }, [receiptNumber]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (bookings.length === 0) {
    return <p>No booking data found for receipt number: {receiptNumber}</p>;
  }

  // Get user details from the first booking
  const userDetails = bookings[0].userDetails || {};

  const handleClientTypeChange = (event) => {
    setClientType(event.target.value);
  };

  return (
    <>
      <div className="booking-details-container">
        {/* Activity Log Section at the Top Right */}
        <div className="activity-log-container">
          <h3>Activity Log</h3>
          {bookings.map((booking, index) => (
            <div key={index} className="activity-log">
              {booking.activityLog && booking.activityLog.length > 0 ? (
                <ul>
                  {booking.activityLog.map((log, logIndex) => (
                    <li key={logIndex}>
                      <p>{formatTimestamp(log.timestamp)}: {log.action}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No activity log available for this booking.</p>
              )}
            </div>
          ))}
        </div>

        {/* Main Content Section */}
        <div className="main-content">
          <h2>Booking Details for Receipt Number: {receiptNumber}</h2>
          <div className="personal-info">
            <h2>Personal Details</h2>
            <div className="info-row">
              <p><strong>Name:</strong> {userDetails.name || 'N/A'}</p>
              <p><strong>Email:</strong> {userDetails.email || 'N/A'}</p>
            </div>
            <div className="info-row">
              <p><strong>Contact No:</strong> {userDetails.contact || 'N/A'}</p>
              <p><strong>Alternate Contact No:</strong> {userDetails.alternativecontactno || 'N/A'}</p>
            </div>
            <div className="info-row">
              <p><strong>Identity Proof:</strong> {userDetails.identityproof || 'N/A'}</p>
              <p><strong>Identity Number:</strong> {userDetails.identitynumber || 'N/A'}</p>
            </div>
            <div className="info-row">
              <p><strong>Source:</strong> {userDetails.source || 'N/A'}</p>
              <p><strong>Customer By:</strong> {userDetails.customerby || 'N/A'}</p>
            </div>
            <div className="info-row">
              <p><strong>Receipt By:</strong> {userDetails.receiptby || 'N/A'}</p>
            </div>
          </div>

          <div className="product-details-container">
            <h3>Product Details</h3>
            <table className="product-details-table">
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Product Image</th>
                  <th>Quantity</th>
                  <th>Deposit</th>
                  <th>Rent</th>
                  <th>Total Deposit</th>
                  <th>Total Rent</th>
                  <th>Pickup Date</th>
                  <th>Return Date</th>
                  <th>Alteration</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{booking.product.productCode || 'N/A'}</td>
                    <td>{booking.product.productName || 'N/A'}</td>
                    <td>
                      {booking.product.imageUrls ? (
                        <img src={booking.product.imageUrls} alt="Product" style={{ width: '100px', height: 'auto' }} />
                      ) : 'N/A'}
                    </td>
                    <td>{booking.quantity || 'N/A'}</td>
                    <td>₹{booking.deposit || 'N/A'}</td>
                    <td>₹{booking.extraRent || 'N/A'}</td>
                    <td>₹{booking.deposit || 'N/A'}</td>
                    <td>₹{booking.price || 'N/A'}</td>
                    <td>{formatTimestamp(booking.pickupDate)}</td>
                    <td>{formatTimestamp(booking.returnDate)}</td>
                    <td>{userDetails.alterations || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          

          <div className="payment-info">
            <h4>Payment Details</h4>
            <div className="info-row">
              <p><strong>Grand Total Rent:</strong> ₹{userDetails.grandTotalRent || 'N/A'}</p>
              <p><strong>Discount on Rent:</strong> ₹{userDetails.discountOnRent || 'N/A'}</p>
            </div>
            <div className="info-row">
              <p><strong>Final Rent:</strong> ₹{userDetails.finalrent || 'N/A'}</p>
              <p><strong>Grand Total Deposit:</strong> ₹{userDetails.grandTotalDeposit || 'N/A'}</p>
            </div>
            <div className="info-row">
              <p><strong>Discount on Deposit:</strong> ₹{userDetails.discountOnDeposit || 'N/A'}</p>
              <p><strong>Final Deposit:</strong> ₹{userDetails.finaldeposite || 'N/A'}</p>
            </div>
            <div className="info-row">
              <p><strong>Amount to be Paid:</strong> ₹{userDetails.totalamounttobepaid || 'N/A'}</p>
              <p><strong>Amount Paid:</strong> ₹{userDetails.amountpaid || 'N/A'}</p>
            </div>
            <div className="info-row">
              <p><strong>Balance:</strong> ₹{userDetails.balance || 'N/A'}</p>
              <p><strong>Payment Status:</strong> {userDetails.paymentstatus || 'N/A'}</p>
            </div>
            <div className="info-row">
              <p><strong>firstpaymentdtails:</strong> ₹{userDetails.firstpaymentdtails || 'N/A'}</p>
              <p><strong>firstpaymentmode:</strong> {userDetails.firstpaymentmode || 'N/A'}</p>
            </div>
            <div className="info-row">
              <p><strong>secondpaymentmode:</strong> ₹{userDetails.secondpaymentmode || 'N/A'}</p>
              <p><strong>secondpaymentdetails:</strong> {userDetails.secondpaymentdetails || 'N/A'}</p>
            </div>
            <div className="info-row">
              <p><strong>specialnote:</strong> {userDetails.specialnote || 'N/A'}</p>
            </div>
          </div>

          <div className="client-type-container">
            <h5>Client Type</h5>
            <div className="info-row">
              <select id="clientType" value={clientType}>
                <option value="Booking">Booking</option>
                <option value="Pickup Pending">Pickup Pending</option>
                <option value="Pickup">Pickup</option>
                <option value="Return Pending">Return Pending</option>
                <option value="Return">Return</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingDetailsPage;
