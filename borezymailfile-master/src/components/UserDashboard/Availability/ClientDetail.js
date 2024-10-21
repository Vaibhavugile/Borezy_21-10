import React, { useEffect, useState } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, getDocs, query, where, orderBy , doc, updateDoc } from 'firebase/firestore';
import Papa from 'papaparse';
import searchIcon from '../../../assets/Search.png';
import downloadIcon from '../../../assets/Download.png';
import uploadIcon from '../../../assets/Upload.png';
import "../../Product/Product.css"; // Assuming styles are shared with Product
import UserHeader from '../../UserDashboard/UserHeader';
import UserSidebar from '../../UserDashboard/UserSidebar';
import { useUser } from '../../Auth/UserContext';
const ClientDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [uniqueBookings, setUniqueBookings] = useState([]); // For filtered/search results
  const [originalBookings, setOriginalBookings] = useState([]); // To keep a copy of the original data
  const [importedData, setImportedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('username'); // Default search field
  const [selectedBookings, setSelectedBookings] = useState([]); // Store bookings related to selected contactNo
  const [isDetailView, setIsDetailView] = useState(false); // New state variable
  const { userData } = useUser();
  const [stageFilter, setStageFilter] = useState('all'); // New state for filtering by stage

  const [editingStage, setEditingStage] = useState(null);
  // Fetch all product bookings with user information
  const fetchAllBookingsWithUserDetails = async () => {
    try {
      const q = query(
        collection(db, 'products'),
        where('branchCode', '==', userData.branchCode)
      );
      const productsSnapshot = await getDocs(q);
      let allBookings = [];
      for (const productDoc of productsSnapshot.docs) {
        const productCode = productDoc.data().productCode;
        const bookingsRef = collection(productDoc.ref, 'bookings');
        const bookingsQuery = query(bookingsRef, orderBy('pickupDate', 'asc'));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        bookingsSnapshot.forEach((doc) => {
          const bookingData = doc.data();
          const { userDetails, pickupDate, returnDate, quantity } = bookingData;
          allBookings.push({
            productCode,
            receiptNumber: bookingData.receiptNumber,
            bookingId: bookingData.bookingId,
            username: userDetails.name,
            contactNo: userDetails.contact,
            email: userDetails.email,
            pickupDate: pickupDate.toDate(),
            returnDate: returnDate.toDate(),
            quantity,
            price: bookingData.price, 
            deposit: bookingData.deposit, 
            minimumRentalPeriod: bookingData.minimumRentalPeriod, 
            discountedGrandTotal: bookingData.discountedGrandTotal, 
             extraRent: bookingData.extraRent,
            stage:userDetails.stage,
          });
        });
      }
      setBookings(allBookings);
      // Filter unique bookings by contact number
      const uniqueContacts = {};
      const unique = allBookings.filter((booking) => {
        if (!uniqueContacts[booking.contactNo]) {
          uniqueContacts[booking.contactNo] = true;
          return true; // Keep this booking
        }
        return false; // Skip this booking
      });
      setOriginalBookings(unique); // Store the original set of unique bookings
      setUniqueBookings(unique); // Display this initially
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };
 

  const handleStageChange = async (productCode, bookingId, newStage) => {
    console.log("Stage change initiated with:");
    console.log("Product Code:", productCode);
    console.log("Booking ID:", bookingId);
    console.log("New Stage:", newStage);
  
    if (!newStage) {
      console.error('Invalid stage selected:', newStage);
      return;
    }
  
    if (!productCode || !bookingId) {
      console.error('Missing productCode or bookingId:', { productCode, bookingId });
      return;
    }
  
    try {
      // Query for the document where bookingId matches
      const bookingsRef = collection(db, `products/${productCode}/bookings`);
      const q = query(bookingsRef, where("bookingId", "==", bookingId));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.error(`No booking found with bookingId: ${bookingId}`);
        return;
      }
  
      // Assume bookingId is unique, so take the first matching document
      const bookingDocRef = querySnapshot.docs[0].ref;
  
      // Update the stage field
      await updateDoc(bookingDocRef, { 'userDetails.stage': newStage });
      console.log('Booking stage updated successfully!');
  
      // Update the local state optimistically
      const updatedBookings = uniqueBookings.map((booking) => {
        if (booking.bookingId === bookingId) {
          return { ...booking, stage: newStage };
        }
        return booking;
      });
  
      setUniqueBookings(updatedBookings);
  
    } catch (error) {
      console.error('Error updating booking stage:', error);
    }
  };
  
  
  
  
  
  
  const filteredBookings = uniqueBookings.filter((booking) => {
    if (stageFilter === 'all') return true; // Show all bookings if 'all' is selected
    return booking.stage === stageFilter; // Only show bookings matching the selected stage
  });
  
  
  // Search functionality
  const handleSearch = () => {
    const lowerCaseQuery = searchQuery.toLowerCase();
  
    // If search query is empty, reset to the original bookings
    if (lowerCaseQuery === '') {
      setUniqueBookings(originalBookings);
    } else {
      const filteredBookings = originalBookings.filter((booking) => {
        if (searchField === 'pickupDate' || searchField === 'returnDate') {
          // Convert dates to YYYY-MM-DD for comparison
          const formattedDate = booking[searchField]
            .toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
          return formattedDate.includes(lowerCaseQuery);
        } else {
          return booking[searchField]?.toString().toLowerCase().includes(lowerCaseQuery);
        }
      });
      setUniqueBookings(filteredBookings);
    }
  };
  
  useEffect(() => {
    fetchAllBookingsWithUserDetails();
  }, [userData]);
  useEffect(() => {
    handleSearch();
  }, [searchQuery, searchField]); // Trigger search on query or field change
  // CSV export functionality
  const exportToCSV = () => {
    const csv = Papa.unparse(bookings);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bookings.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // CSV import functionality
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          const importedBookings = result.data.map((row) => ({ ...row }));
          setImportedData(importedBookings);
        },
      });
    }
  };
  // Booking detail click to show all bookings for selected contact number
  const handleBookingClick = (contactNo) => {
    const relatedBookings = bookings.filter(
      (booking) => booking.contactNo === contactNo
    );
    if (relatedBookings.length === 0) {
      console.error('No bookings found for contact:', contactNo);
    } else {
      console.log('Bookings for contact:', relatedBookings);
    }
    setSelectedBookings(relatedBookings);
    setIsDetailView(true); // Switch to detail view
  };
  // Function to go back to the main view
  const handleBack = () => {
    setIsDetailView(false);
    setSelectedBookings([]);
  };
  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <UserSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="dashboard-content">
        <UserHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />
        <h2 style={{ marginLeft: '10px', marginTop: '100px' }}>
          {isDetailView ? 'Client Bookings' : 'Client Dashboard'}
        </h2>
        <div className="filter-container">
          <button onClick={() => setStageFilter('all')}>All</button>
          <button onClick={() => setStageFilter('booking')}>Booking </button>
          <button onClick={() => setStageFilter('pickup')}>Pick Up</button>
          <button onClick={() => setStageFilter('pickupPending')}>Pickup Pending</button>
          <button onClick={() => setStageFilter('return')}>Return</button>
          <button onClick={() => setStageFilter('returnPending')}>Return Pending</button>
          <button onClick={() => setStageFilter('cancelled')}>Cancelled</button>
        </div>
        <div className="toolbar-container">
          <div className="search-bar-container">
            <img src={searchIcon} alt="search icon" className="search-icon" />
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="search-dropdown"
            >
              <option value="clientName">Client Name</option>
              <option value="email">Email</option>
              <option value="contactNo">Contact No</option>
              <option value="pickupDate">Pickup Date</option> {/* New search option */}
              <option value="returnDate">Return Date</option> {/* New search option */}
              <option value="recieptNumber">Reciept number</option>
              <option value="minimumRentalPeriod">Minimum Rental Period</option>
              <option value="extrarent">Extra Rent</option>
              <option value="discountedGrandTotal">Discounted Grand Total</option>
            </select>

            <input
              type="text"
              placeholder={
                searchField === 'pickupDate' || searchField === 'returnDate'
                  ? 'Search by YYYY-MM-DD'
                  : `Search by ${searchField.replace(/([A-Z])/g, ' $1')}`
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

          </div>
          <div className="action-buttons">
            <button onClick={exportToCSV} className="action-button">
              <img src={downloadIcon} alt="Export" className="icon" /> Export
            </button>
            <label htmlFor="import" className="action-button">
              <img src={uploadIcon} alt="Import" className="icon" /> Import
              <input
                type="file"
                id="import"
                accept=".csv"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
        <div className="table-container">
          {loading ? (
            <p>Loading bookings...</p>
          ) : isDetailView ? (
            <>
              <button onClick={handleBack}>Back to All Clients</button>
              <table className="table">
                <thead>
                  <tr>
                  <th>Sr.No.</th>
                  <th>Reciept No</th>
                  <th>Client Name</th>
                  <th>Email</th>
                  <th>Contact No</th>
                  <th>Product Code</th>
                  <th>Pickup Date</th>
                  <th>Return Date</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Deposit</th>
                  <th>Minimum Rental Period</th>
                  <th>Discounted Grand Total</th>
                  <th>Extra Rent</th>
                  <th>Stage</th>
                  <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBookings.map((booking, index) => (
                    <tr key={`${booking.bookingId}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{booking.receiptNumber}</td>
                      <td>{booking.username}</td>
                      <td>{booking.email.toLowerCase()}</td>
                      <td>{booking.contactNo}</td>
                      <td>{booking.productCode}</td>
                      <td>{booking.pickupDate.toLocaleDateString()}</td>
                      <td>{booking.returnDate.toLocaleDateString()}</td>
                      <td>{booking.quantity}</td>
                      <td>{booking.price}</td>
                      <td>{booking.deposit}</td>
                      <td>{booking.minimumRentalPeriod}</td>
                      <td>{booking.discountedGrandTotal}</td>
                      <td>{booking.extraRent}</td>
                      {/* Editable stage field */}
                      <td>
                        <select
                          value={booking.stage}
                          onChange={(e) => handleStageChange(booking.productCode, booking.bookingId, e.target.value)}
                        >
                          <option value="booking">Booking</option>
                          <option value="pickup">Pickup</option>
                          <option value="pickup pending">Pickup Pending</option>
                          <option value="return">Return</option>
                          <option value="returnPending">Return Pending</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>


                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : uniqueBookings.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Sr.No.</th>
                  <th>Reciept No</th>
                  <th>Client Name</th>
                  <th>Email</th>
                  <th>Contact No</th>
                  <th>Product Code</th>
                  <th>Pickup Date</th>
                  <th>Return Date</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Deposit</th>
                  <th>Minimum Rental Period</th>
                  <th>Discounted Grand Total</th>
                  <th>Extra Rent</th>
                  <th>Stage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
              {filteredBookings.map((booking, index) => (
    <tr key={`${booking.bookingId}-${index}`}>
      <td>{index + 1}</td>
      <td>{booking.receiptNumber}</td>
      <td>{booking.username}</td>
      <td>{booking.email.toLowerCase()}</td>
      <td>{booking.contactNo}</td>
      <td>{booking.productCode}</td>
      <td>{booking.pickupDate.toLocaleDateString()}</td>
      <td>{booking.returnDate.toLocaleDateString()}</td>
      <td>{booking.quantity}</td>
      <td>{booking.price}</td>
      <td>{booking.deposit}</td>
      <td>{booking.minimumRentalPeriod}</td>
      <td>{booking.discountedGrandTotal}</td>
      <td>{booking.extraRent}</td>
      {/* Editable stage field */}
      <td>
        <select
          value={booking.stage}
          onChange={(e) => handleStageChange(booking.productCode, booking.bookingId, e.target.value)}
        >
          <option value="booked">Booking</option>
          <option value="given">Pickup</option>
          <option value="pending">Pickup Pending</option>
          <option value="return">Return</option>
          <option value="returnPending">Return Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </td>
      <td>
        <button onClick={() => handleBookingClick(booking.contactNo)}>
          Details
        </button>
      </td>
    </tr>
  ))}
              </tbody>
            </table>
          ) : (
            <p>No bookings found</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default ClientDashboard ;  