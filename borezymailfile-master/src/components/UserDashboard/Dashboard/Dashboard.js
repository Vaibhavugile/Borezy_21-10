import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';  // Import the Firebase config file
import './Dahboard.css';
import { useUser } from '../../Auth/UserContext';

const Dashboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [todaysBookings, setTodaysBookings] = useState(0);
  const [pickupPendingCount, setPickupPendingCount] = useState(0);
  const [returnPendingCount, setReturnPendingCount] = useState(0);
  const [successfulCount, setSuccessfulCount] = useState(0);
  const [monthlyPickupPending, setMonthlyPickupPending] = useState(0);
  const [monthlyReturnPending, setMonthlyReturnPending] = useState(0);
  const [loading, setLoading] = useState(false);
  const { userData } = useUser();

  useEffect(() => {
    // Fetch all bookings with user details
    const fetchAllBookingsWithUserDetails = async () => {
      setLoading(true); // Start loading
      try {
        const q = query(
          collection(db, 'products'),
          where('branchCode', '==', userData.branchCode)
        );
        const productsSnapshot = await getDocs(q);
        let allBookings = [];

        // Loop through products and get related bookings
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
              productCode,
              bookingId,
              receiptNumber,
              username: userDetails.name,
              contactNo: userDetails.contact,
              email: userDetails.email,
              pickupDate: pickupDate.toDate(),
              returnDate: returnDate.toDate(),
              quantity: parseInt(quantity, 10),
              price,
              deposit,
              priceType,
              minimumRentalPeriod,
              discountedGrandTotal,
              extraRent,
              stage: userDetails.stage,
            });
          });
        }

        setBookings(allBookings); // Store all bookings
        calculateTodaysBookings(allBookings); // Calculate today's bookings
        calculateBookingStages(allBookings);
        calculateMonthlyBookings(allBookings); // Calculate counts for different stages
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false); // End loading
      }
    };

    // Calculate number of bookings with today's pickup date
    const calculateTodaysBookings = (allBookings) => {
      const today = new Date();
      const todaysBookingsCount = allBookings.filter((booking) => {
        const bookingPickupDate = new Date(booking.pickupDate);
        return (
          bookingPickupDate.getDate() === today.getDate() &&
          bookingPickupDate.getMonth() === today.getMonth() &&
          bookingPickupDate.getFullYear() === today.getFullYear()
        );
      }).length;
      setTodaysBookings(todaysBookingsCount);
    };

    // Calculate counts for different booking stages
    const calculateBookingStages = (allBookings) => {
      const pickupPending = allBookings.filter((booking) => booking.stage === 'pickupPending').length;
      const returnPending = allBookings.filter((booking) => booking.stage === 'returnPending').length;
      const successful = allBookings.filter((booking) => booking.stage === 'return').length;

      setPickupPendingCount(pickupPending);
      setReturnPendingCount(returnPending);
      setSuccessfulCount(successful);
    };
    const calculateMonthlyBookings = (allBookings) => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
  
        // Filter bookings for the current month where stage is "pickupPending"
        const monthlyPickupPendingBookings = allBookings.filter((booking) => {
          const pickupMonth = new Date(booking.pickupDate).getMonth();
          const pickupYear = new Date(booking.pickupDate).getFullYear();
          return (
            pickupMonth === currentMonth &&
            pickupYear === currentYear &&
            booking.stage === 'pickupPending'
          );
        });
  
        // Filter bookings for the current month where stage is "returnPending"
        const monthlyReturnPendingBookings = allBookings.filter((booking) => {
          const returnMonth = new Date(booking.returnDate).getMonth();
          const returnYear = new Date(booking.returnDate).getFullYear();
          return (
            returnMonth === currentMonth &&
            returnYear === currentYear &&
            booking.stage === 'returnPending'
          );
        });
  
        setMonthlyPickupPending(monthlyPickupPendingBookings.length);
        setMonthlyReturnPending(monthlyReturnPendingBookings.length);
      };
  

    fetchAllBookingsWithUserDetails();
  }, [userData.branchCode]);

  return (
    <div className="dashboard-container">
      <div className="reports-container">
        
        <div className="sales-report">
          <h4>Daily Sales Report</h4>
          <div className="report-cards">
            <div className="card">Today's Booking <br /> {todaysBookings}</div>
            <div className="card">Pick-up Pending <br /> {pickupPendingCount}</div>
            <div className="card">Return Pending <br /> {returnPendingCount}</div>
            <div className="card">Refund Pending <br /> 01</div>
            <div className="card">Successful <br /> {successfulCount}</div>
          </div>
        </div>

        <div className="sales-overview">
          <h4>Sales Overview (Monthly)</h4>
          <div className="report-cards">
            <div className="card">Total Bookings <br /> 12,050</div>
            <div className="card">Monthly Pick-up Pending <br /> {monthlyPickupPending}</div>
            <div className="card">Monthly Return Pending <br /> {monthlyReturnPending}</div>
            <div className="card">Refund Pending <br /> 14</div>
            <div className="card">Successful <br /> 12,017</div>
          </div>
        </div>
        
        <div className="tables-contain">
        <div className="tble1">
          <h4>Top Users</h4>
          <table>
            <thead>
              <tr>
                <th>Sr. No</th>
                <th>User Name</th>
                <th>Contact No.</th>
                <th>Booking Count</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{user.userName}</td>
                  <td>{user.contactNo}</td>
                  <td>{user.bookingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tble2">
          <h4>Top Clients</h4>
          <table>
            <thead>
              <tr>
                <th>Sr. No</th>
                <th>Client Name</th>
                <th>Contact No.</th>
                <th>Booking Count</th>
              </tr>
            </thead>
            <tbody>
              {topClients.map((client, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{client.clientName}</td>
                  <td>{client.contactNo}</td>
                  <td>{client.bookingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="tble3">
          <h4>Top Products</h4>
          <table>
            <thead>
              <tr>
                <th>Sr. No</th>
                <th>Image</th>
                <th>Product Name</th>
                <th>Product Code</th>
                <th>Booking Count</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td><img src={product.image} alt={product.productName} /></td>
                  <td>{product.productName}</td>
                  <td>{product.productCode}</td>
                  <td>{product.bookingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard; 