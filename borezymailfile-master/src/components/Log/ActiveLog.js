// src/components/ActiveLog.js
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './activeLog.css'; // Import the CSS file for styling

const ActiveLog = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logsQuery = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(logsQuery);
        const logsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLogs(logsData);
      } catch (error) {
        setError('Error fetching logs.');
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="active-log">
      <h2>Activity Logs</h2>
      {error && <p className="error-message">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Admin</th>
            <th>Time</th>
            <th>Action</th>
            <th>Old Values</th>
            <th>New Values</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.adminName}</td>
              <td>{new Date(log.timestamp.seconds * 1000).toLocaleString()}</td>
              <td>{log.action}</td>
              <td>{log.oldValues ? JSON.stringify(log.oldValues) : '-'}</td>
              <td>{log.newValues ? JSON.stringify(log.newValues) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveLog;
