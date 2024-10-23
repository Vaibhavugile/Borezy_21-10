import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';  // Import the Firebase config file
import './Dahboard.css';
import { useUser } from '../../Auth/UserContext';
import UserHeader from '../../UserDashboard/UserHeader';
import UserSidebar from '../../UserDashboard/UserSidebar';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [todaysBookings, setTodaysBookings] = useState(0);
  const [pickupPendingCount, setPickupPendingCount] = useState(0);
  const [returnPendingCount, setReturnPendingCount] = useState(0);
  const [successfulCount, setSuccessfulCount] = useState(0);
  const [monthlyPickupPending, setMonthlyPickupPending] = useState(0);
  const [monthlyReturnPending, setMonthlyReturnPending] = useState(0);
  const [monthlySuccessful, setMonthlySuccessful] = useState(0);
  const [monthlyTotalBookings, setMonthlyTotalBookings] = useState(0); // New state for total monthly bookings
  const [loading, setLoading] = useState(false);
  const { userData } = useUser();

  useEffect(() => {
    const fetchAllBookingsWithuserDetails = async () => {
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
            allBookings.push({
              productCode,
              ...bookingData,
              pickupDate: bookingData.pickupDate.toDate(),
              returnDate: bookingData.returnDate.toDate(),
              stage: bookingData.userDetails?.stage // Access the stage from userDetails
            });
          });
        }

        setBookings(allBookings);
        calculateTodaysBookings(allBookings);
        calculateBookingStages(allBookings);
        calculateMonthlyBookings(allBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false); // End loading
      }
    };

    // Helper function to compare dates (ignoring time)
    const isSameDay = (date1, date2) => {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    };

    // Helper function to get unique bookings by receiptNumber
    const getUniqueBookingsByReceiptNumber = (bookings) => {
      const uniqueBookings = new Set();
      return bookings.filter((booking) => {
        const isUnique = !uniqueBookings.has(booking.receiptNumber);
        if (isUnique) {
          uniqueBookings.add(booking.receiptNumber);
        }
        return isUnique;
      });
    };

    const calculateTodaysBookings = (allBookings) => {
      const today = new Date();
      const uniqueTodaysBookings = getUniqueBookingsByReceiptNumber(
        allBookings.filter((booking) => isSameDay(new Date(booking.pickupDate), today))
      );
      setTodaysBookings(uniqueTodaysBookings.length);
    };

    const calculateBookingStages = (allBookings) => {
      const today = new Date();

      const uniqueBookings = getUniqueBookingsByReceiptNumber(allBookings);

      // Today's bookings with pickup pending
      const pickupPending = uniqueBookings.filter((booking) => {
        const bookingPickupDate = new Date(booking.pickupDate);
        return booking.stage === 'pickupPending' && isSameDay(bookingPickupDate, today);
      }).length;

      // Today's bookings with return pending
      const returnPending = uniqueBookings.filter((booking) => {
        const bookingReturnDate = new Date(booking.returnDate);
        return booking.stage === 'returnPending' && isSameDay(bookingReturnDate, today);
      }).length;

      // Successful bookings (returned today)
      const successful = uniqueBookings.filter((booking) => {
        const bookingReturnDate = new Date(booking.returnDate);
        return booking.stage === 'return' && isSameDay(bookingReturnDate, today);
      }).length;

      setPickupPendingCount(pickupPending);
      setReturnPendingCount(returnPending);
      setSuccessfulCount(successful);
    };

    const calculateMonthlyBookings = (allBookings) => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const uniqueBookings = getUniqueBookingsByReceiptNumber(allBookings);

      // Monthly pick-up pending
      const monthlyPickupPendingBookings = uniqueBookings.filter((booking) => {
        const pickupMonth = new Date(booking.pickupDate).getMonth();
        const pickupYear = new Date(booking.pickupDate).getFullYear();
        return (
          pickupMonth === currentMonth &&
          pickupYear === currentYear &&
          booking.stage === 'pickupPending'
        );
      });

      // Monthly return pending
      const monthlyReturnPendingBookings = uniqueBookings.filter((booking) => {
        const returnMonth = new Date(booking.returnDate).getMonth();
        const returnYear = new Date(booking.returnDate).getFullYear();
        return (
          returnMonth === currentMonth &&
          returnYear === currentYear &&
          booking.stage === 'returnPending'
        );
      });

      // Monthly successful
      const monthlySuccessfulBookings = uniqueBookings.filter((booking) => {
        const returnMonth = new Date(booking.returnDate).getMonth();
        const returnYear = new Date(booking.returnDate).getFullYear();
        return (
          returnMonth === currentMonth &&
          returnYear === currentYear &&
          booking.stage === 'return'
        );
      });

      // Monthly total bookings
      const monthlyTotal = uniqueBookings.filter((booking) => {
        const pickupMonth = new Date(booking.pickupDate).getMonth();
        const pickupYear = new Date(booking.pickupDate).getFullYear();
        return pickupMonth === currentMonth && pickupYear === currentYear;
      }).length;

      setMonthlyPickupPending(monthlyPickupPendingBookings.length);
      setMonthlyReturnPending(monthlyReturnPendingBookings.length);
      setMonthlyTotalBookings(monthlyTotal); 
      setMonthlySuccessful(monthlySuccessfulBookings.length);
    };

    fetchAllBookingsWithuserDetails();
  }, [userData.branchCode]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <UserSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="reports-container">
        <UserHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />
        <h2 style={{ marginTop: '30px' }}>Dashboard</h2>

        <div className="sales-report">
          <h4>Daily Sales Report</h4>
          <div className="report-cards">
            <div className="card">Today's Booking <br /> {todaysBookings}</div>
            <div className="card">Pick-up Pending <br /> {pickupPendingCount}</div>
            <div className="card">Return Pending <br /> {returnPendingCount}</div>
            <div className="card">Successful <br /> {successfulCount}</div>
          </div>
        </div>

        <div className="sales-overview">
          <h4>Sales Overview (Monthly)</h4>
          <div className="report-cards">
            <div className="card">Monthly Total Booking <br /> {monthlyTotalBookings}</div>
            <div className="card">Monthly Pick-up Pending <br /> {monthlyPickupPending}</div>
            <div className="card">Monthly Return Pending <br /> {monthlyReturnPending}</div>
            <div className="card">Monthly Successful <br /> {monthlySuccessful}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
