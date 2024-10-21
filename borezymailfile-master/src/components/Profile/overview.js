import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './Profile.css';
import { useUser } from '../Auth/UserContext'; // Assuming you're using a UserContext for branchCode

const SingleComponent = () => {
  const [totalRevenue, setTotalRevenue] = useState([]);
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [activityData, setActivityData] = useState([]); 
  const [superAdmins, setSuperAdmins] = useState([]);

  const { userData } = useUser(); // Assuming you have user data including branchCode in UserContext

  const fetchData = async () => {
    try {
      const branchesSnapshot = await getDocs(collection(db, 'branches'));

      const branches = branchesSnapshot.docs.map(doc => {
        const data = doc.data();
        const amount = parseFloat(data.amount) || 0;
        const activeDate = new Date(data.activeDate);
        const monthYear = `${activeDate.toLocaleString('default', { month: 'short' })} ${activeDate.getFullYear()}`;

        return {
          branchName: data.branchName || 'Unknown',
          amount,
          monthYear,
        };
      });

      const monthlyRevenue = branches.reduce((acc, branch) => {
        if (!acc[branch.monthYear]) {
          acc[branch.monthYear] = 0;
        }
        acc[branch.monthYear] += branch.amount;
        return acc;
      }, {});

      const formattedRevenueData = Object.keys(monthlyRevenue).map(monthYear => ({
        name: monthYear,
        value: monthlyRevenue[monthYear],
      }));
      setTotalRevenue(formattedRevenueData);

      const subscriptions = branches.reduce((acc, branch) => {
        if (!acc[branch.monthYear]) {
          acc[branch.monthYear] = 0;
        }
        acc[branch.monthYear] += 1;
        return acc;
      }, {});

      const formattedSubscriptionsData = Object.keys(subscriptions).map(monthYear => ({
        name: monthYear,
        count: subscriptions[monthYear],
      }));
      setSubscriptionsData(formattedSubscriptionsData);

      const activitySnapshot = await getDocs(collection(db, 'activityLogs'));

      const activity = activitySnapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate();
        const monthYear = timestamp ? `${timestamp.toLocaleString('default', { month: 'short' })} ${timestamp.getFullYear()}` : 'Unknown';

        return {
          name: monthYear,
          count: data.action === 'login' ? 1 : 0,
        };
      });

      const monthlyActivity = activity.reduce((acc, act) => {
        if (!acc[act.name]) {
          acc[act.name] = 0;
        }
        acc[act.name] += act.count;
        return acc;
      }, {});

      const formattedActivityData = Object.keys(monthlyActivity).map(month => ({
        name: month,
        value: monthlyActivity[month],
      }));
      setActivityData(formattedActivityData);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchSuperAdmins = async () => {
    try {
      if (userData && userData.branchCode) {
        // Query to get subusers where branchCode matches logged-in user's branchCode
        const subusersQuery = query(
          collection(db, 'subusers'),
          where('branchCode', '==', userData.branchCode)
        );
        const querySnapshot = await getDocs(subusersQuery);
        const adminsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSuperAdmins(adminsData);
      }
    } catch (error) {
      console.error('Error fetching Super Admins:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSuperAdmins();
  }, [userData]); // Refetch if userData changes

  return (
    <div className="dashboard-container2">
      <div className="content-wrapper">
        <h1>Overview</h1>
        <div className="overview">
          <div className="overview-item">
            <h3>User Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overview-item">
            <h3>Total Subscriptions</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={subscriptionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overview-item">
            <h3>Total Revenue</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={totalRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="performance">
          <h3>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={totalRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="super-admin-table">
          <h3>Recently Created Super Admin</h3>
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {superAdmins.length > 0 ? (
                superAdmins.map((admin, index) => (
                  <tr key={admin.id}>
                    <td>{index + 1}</td>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No Data Available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SingleComponent;
