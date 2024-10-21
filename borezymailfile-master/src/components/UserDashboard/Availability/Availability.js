import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, updateDoc ,doc,getDoc,setDoc} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../../UserDashboard/UserHeader';
import UserSidebar from '../../UserDashboard/UserSidebar';
import { useUser } from '../../Auth/UserContext';
import search from '../../../assets/Search.png';
import { FaSearch, FaDownload, FaUpload, FaPlus, FaEdit, FaTrash, FaCopy } from 'react-icons/fa';
import './Availability.css'; // Create CSS for styling

const BookingDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptNumber, setSelectedReceiptNumber] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
 
  
  const [searchField, setSearchField] = useState('');
  const [importedData, setImportedData] = useState(null);
  
  const navigate = useNavigate();
  const [stageFilter, setStageFilter] = useState('all'); // New state for filtering by stage
  const { userData } = useUser();


  const handleBookingClick = (booking) => {
    setSelectedReceiptNumber(booking.receiptNumber); // Set the selected receipt number
  
  };

  
  
  useEffect(() => {
    const fetchAllBookingsWithUserDetails = async () => {
      setLoading(true); // Start loading
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
            const { 
              bookingId, 
              receiptNumber, 
              pickupDate, 
              returnDate, 
              quantity, 
              userDetails, 
              price, 
              deposit, 
              priceType, 
              minimumRentalPeriod, 
              discountedGrandTotal, 
              extraRent 
            } = bookingData;
  
            allBookings.push({
              bookingId,
              receiptNumber,
              username: userDetails.name,
              contactNo: userDetails.contact,
              email: userDetails.email,
              pickupDate: pickupDate.toDate(),
              returnDate: returnDate.toDate(),
              
              priceType,
              minimumRentalPeriod,
              discountedGrandTotal,
              extraRent,
              stage: userDetails.stage,
              products: [{ productCode, quantity: parseInt(quantity, 10),price,deposit, },], // Store product codes with quantities
            });
          });
        }
  
        // Group bookings by receiptNumber
        const groupedBookings = allBookings.reduce((acc, booking) => {
          const { receiptNumber, products } = booking;
          if (!acc[receiptNumber]) {
            acc[receiptNumber] = { ...booking, products: [...products] }; // Copy products array
          } else {
            acc[receiptNumber].products.push(...products); // Merge products arrays
          }
          return acc;
        }, {});
  
        // Convert grouped bookings object to array
        setBookings(Object.values(groupedBookings));
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false); // End loading
      }
    };
  
    fetchAllBookingsWithUserDetails();
  }, [userData.branchCode]);
  

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        // Add your delete logic here
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const handleAddBooking = () => {
    navigate('/usersidebar/availability'); // Navigate to an add booking page
  };
  
  

  


  const handleSearch = () => {
    const lowerCaseQuery = searchQuery.toLowerCase();
  
    if (lowerCaseQuery === '') {
      setBookings(bookings); // Show all bookings if search query is empty
    } else {
      const filteredBookings = bookings.filter(booking => {
        // For date comparison, we convert to a readable format
        const formattedPickupDate = booking.pickupDate.toLocaleDateString().toLowerCase();
        const formattedReturnDate = booking.returnDate.toLocaleDateString().toLowerCase();
  
        return (
          booking[searchField]?.toString().toLowerCase().includes(lowerCaseQuery) ||
          formattedPickupDate.includes(lowerCaseQuery) ||
          formattedReturnDate.includes(lowerCaseQuery)
        );
      });
      
      setBookings(filteredBookings);
    }
  };
  

  useEffect(() => {
    handleSearch();
  }, [searchQuery, searchField]);

  const exportToCSV = () => {
    const csv = Papa.unparse(bookings);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'bookings.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (result) => {
          const importedBookings = result.data.filter(row => row && Object.keys(row).length > 0);
          
          if (importedBookings.length === 0) {
            console.warn('No bookings to import.');
            return;
          }

          await Promise.all(importedBookings.map(async (booking) => {
            try {
              if (!booking.bookingCode) {
                console.error('Booking code is missing:', booking);
                return;
              }

              const bookingRef = doc(db, 'bookings', booking.bookingCode);
              await setDoc(bookingRef, booking);
              console.log('Booking saved successfully:', booking);
            } catch (error) {
              console.error('Error saving booking to Firestore:', error, booking);
            }
          }));

          setImportedData(importedBookings); // Store the imported bookings locally if needed
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        }
      });
    }
  };

  // Search function to filter bookings
  const filteredBookings = bookings.filter((booking) =>
    String(booking.bookingId).toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Add a filter based on the stageFilter
  const finalFilteredBookings = filteredBookings.filter((booking) => {
    if (stageFilter === 'all') {
      return true; // Include all bookings if "all" is selected
    }
    return booking.stage === stageFilter; // Match booking stage
  });
  

  const handleStageChange = async (receiptNumber, newStage) => {
    try {
      // Find the booking to update based on receiptNumber
      const bookingToUpdate = bookings.find(
        (booking) => booking.receiptNumber === receiptNumber
      );
  
      if (!bookingToUpdate) {
        console.error('Booking not found');
        return;
      }
  
      // Extracting productCode and bookingId
      const bookingId = String(bookingToUpdate.bookingId);
      const products = bookingToUpdate.products; // Get all products
  
      // Log values to check their types and the document path
      console.log('Booking ID:', receiptNumber, 'Type:', typeof receiptNumber);
  
      // Loop through all products
      for (const product of products) {
        const productCode = product.productCode; // Get product code
        const bookingsRef = collection(db, `products/${productCode}/bookings`);
        const q = query(bookingsRef, where("receiptNumber", "==", receiptNumber));
        const querySnapshot = await getDocs(q);
  
        // Check if any documents were found
        if (querySnapshot.empty) {
          console.error('No documents found for bookingId:', bookingId);
          // Create a new document if needed
          const bookingDocRef = doc(bookingsRef, bookingId); // Create a new reference
          await setDoc(bookingDocRef, {
            userDetails: {
              stage: newStage,
              // Include other default values as necessary
            },
            // Include other relevant fields from bookingToUpdate if needed
          });
  
          console.log('Document created successfully for product:', productCode, 'at path:', bookingDocRef.path);
        } else {
          // Reference to the specific booking document inside Firestore
          const bookingDocRef = querySnapshot.docs[0].ref;
  
          // Update the booking stage in Firestore
          await updateDoc(bookingDocRef, { 'userDetails.stage': newStage });
          console.log('Stage updated successfully for product:', productCode);
        }
      }
  
      // Update the state to reflect the change in the UI
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.receiptNumber === receiptNumber
            ? { ...booking, stage: newStage }
            : booking
        )
      );
  
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };
  

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <UserSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="dashboard-content">
        <UserHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <h2 style={{ marginLeft: '10px', marginTop: '100px' }}>
          Total Bookings
        </h2>
        <div className="filter-container">
          <button onClick={() => setStageFilter('all')}>All</button>
          <button onClick={() => setStageFilter('Booking')}>Booking </button>
          <button onClick={() => setStageFilter('pickup')}>Pick Up</button>
          <button onClick={() => setStageFilter('pickupPending')}>Pickup Pending</button>
          <button onClick={() => setStageFilter('return')}>Return</button>
          <button onClick={() => setStageFilter('returnPending')}>Return Pending</button>
          <button onClick={() => setStageFilter('cancelled')}>Cancelled</button>
        </div>

        <div className="toolbar-container">
          <div className="search-bar-container7">
            <img src={search} alt="search icon" className="search-icon7" />
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="search-dropdown7"
            >
             <option value="bookingId">Booking ID</option>
                <option value="receiptNumber">Receipt Number</option>
                <option value="productCode">Product Code</option>
                <option value="username">Clients Name</option>
                <option value="contactNo">Contact Number</option>
                <option value="pickupDate">Pickup Date</option>
                <option value="returnDate">Return Date</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              
              placeholder="Search..."
            />
            {/* <button onClick={handleSearch} className="search-button">Search</button> */}
          </div>
          <div className="toolbar-actions">
            <div className='action-buttons'>
            <button className="export-button" onClick={exportToCSV}>
              <FaDownload /> Export
            </button>
            <label htmlFor="import" className="import-button">
              <FaUpload /> Import
              <input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>
            <button className="add-product-button" onClick={handleAddBooking}>
              <FaPlus /> Add Booking
            </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p>Loading bookings...</p>
        ) : (
          <div className="booking-list">
            {finalFilteredBookings.length > 0 ? (
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Receipt Number</th>
                    
                    <th>Clients Name</th>
                    <th>Contact Number</th>
                    <th>Email id </th>
                    <th>Products</th>
                    <th>Pickup Date</th>
                    
                    <th>Return Date</th>
                    
                    <th>Stage</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {finalFilteredBookings.map((booking) => (
                    <tr key={`${booking.receiptNumber}`} onClick={() => handleBookingClick(booking)}>

                      <td>{booking.receiptNumber}</td>
                      
                      <td>{booking.username}</td>
                      <td>{booking.contactNo}</td>
                      <td>{booking.email}</td>
                      <td>
                            {booking.products.map((product) => (
                            <div key={product.productCode}>
                                {product.productCode}: {product.quantity}
                            </div>
                            ))}
                        </td>
                      <td>{booking.pickupDate.toLocaleString()}</td>
                      <td>{booking.returnDate.toLocaleString()}</td>
                      
                      <td>
                        <select
                          value={booking.stage}
                          onChange={(e) => handleStageChange(booking.receiptNumber, e.target.value)} // Make sure bookingId is being passed correctly
                        >
                          <option value="Booking">Booking</option>
                          <option value="pickupPending">Pickup Pending</option>
                          <option value="pickup">Pick Up</option>
                          <option value="returnPending">Return Pending</option>
                          <option value="return">Return</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No bookings found.</p>
            )}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default BookingDashboard;
