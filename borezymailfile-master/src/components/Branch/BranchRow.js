// src/components/BranchRow.js
import React from 'react';
import { Link } from 'react-router-dom';

const BranchRow = ({ branch, onDelete }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0' }}>
      <div>
        <p>Branch Name: {branch.branchName}</p>
        <p>Location: {branch.branchLocation}</p>
        <p>Owner: {branch.ownerName}</p>
        {/* Add other details as needed */}
      </div>
      <div>
        <Link to={`/edit-branch/${branch.id}`}>Edit</Link>
        <button onClick={() => onDelete(branch.id)}>Delete</button>
      </div>
    </div>
  );
};

export default BranchRow;
