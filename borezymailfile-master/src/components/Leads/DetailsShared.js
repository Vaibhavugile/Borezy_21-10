import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import '../Admin/AdminDashboard.css';
import editIcon from '../../assets/Edit.png';
import deleteIcon from '../../assets/Trash Can - Copy.png';
import Header from './Header';
import Sidebar from './Sidebar';
import search from '../../assets/Search.png'

const DetailsShared = () => {
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeads = async () => {
      const leadsCollection = collection(db, 'leads');
      const leadSnapshot = await getDocs(leadsCollection);
      const leadList = leadSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(lead => lead.status === 'details shared'); // Filter leads by status
      setLeads(leadList);
    };

    fetchLeads();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'leads', id));
      setLeads(leads.filter(lead => lead.id !== id));
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-lead/${id}`);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric' 
    });
  };

  const filteredLeads = leads.filter(lead => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      lead.businessName?.toLowerCase().includes(lowerCaseQuery) ||
      lead.contactNumber?.toLowerCase().includes(lowerCaseQuery) ||
      lead.emailId?.toLowerCase().includes(lowerCaseQuery) ||
      lead.location?.toLowerCase().includes(lowerCaseQuery) ||
      lead.assignedTo?.toLowerCase().includes(lowerCaseQuery) ||
      lead.source?.toLowerCase().includes(lowerCaseQuery) ||
      formatDate(lead.dateTimestamp)?.toLowerCase().includes(lowerCaseQuery)
    );
  });

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="dashboard-content">
        <Header onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />
        <h2 style={{ marginLeft: '10px', marginTop: '100px' }}>
          Details Shared Leads ({filteredLeads.length})
        </h2>
        <div className="create-branch-container">
          <button onClick={() => navigate('/create-lead')}>Add Lead</button>
        </div>
        <div className="search-bar-container">
        <img src={search} alt="search icon" className="search-icon" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Serial No.</th>
                <th>Business Name</th>
                <th>Business Type</th>
                <th>Contact Number</th>
                <th>Email ID</th>
                <th>Location</th>
                <th>Assigned To</th>
                <th>Source</th>
                <th>Status</th>
                <th>Next Folllowup Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <tr key={lead.id}>
                  <td>{index + 1}</td>
                  <td><a 
                          href={`/lead-info/${lead.id}`} 
                          className="no-link-style"
                         >
                          {lead.businessName}
                        </a>
                    </td>
                  <td>{lead.businessType}</td>
                  <td>{lead.contactNumber}</td>
                  <td>{lead.emailId}</td>
                  <td>{lead.location}</td>
                  <td>{lead.assignedTo}</td>
                  <td>{lead.source}</td>
                  <td>{lead.status}</td>
                  <td>{formatDate(lead.nextFollowup)}</td>
                  <td className="actions">
                    <button onClick={() => handleEdit(lead.id)}>
                      <img src={editIcon} alt="Edit" className="icon" />
                    </button>
                    {/* <button onClick={() => handleDelete(lead.id)}>
                      <img src={deleteIcon} alt="Delete" className="icon" />
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailsShared;
