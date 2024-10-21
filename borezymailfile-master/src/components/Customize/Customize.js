import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './customize.css';

const Customize = () => {
  const [customFields, setCustomFields] = useState([]);
  const [newField, setNewField] = useState({ type: '', label: '', options: '' });

  useEffect(() => {
    const fetchCustomization = async () => {
      if (!auth.currentUser) {
        alert('User is not authenticated');
        return;
      }

      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCustomFields(docSnap.data().customFields || []);
        }
      } catch (error) {
        console.error('Error fetching custom fields: ', error);
      }
    };

    fetchCustomization();
  }, []);

  const handleAddField = () => {
    if (newField.type && newField.label) {
      setCustomFields([...customFields, newField]);
      setNewField({ type: '', label: '', options: '' });
    } else {
      alert('Please fill in both the type and label fields.');
    }
  };

  const handleRemoveField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      alert('User is not authenticated');
      return;
    }

    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(docRef, { customFields });
      alert('Custom fields saved successfully');
    } catch (error) {
      console.error('Error saving custom fields: ', error);
      alert('Error saving custom fields: ' + error.message);
    }
  };

  return (
    <div className="customize-form">
      <h2>Customize Product Form</h2>
      <div>
        {customFields.map((field, index) => (
          <div key={index} className="field-row">
            <span>{field.label} ({field.type})</span>
            <button onClick={() => handleRemoveField(index)}>Remove</button>
          </div>
        ))}
      </div>

      <div className="new-field-form">
        <h3>Add New Field</h3>
        <label>
          Field Type:
          <select
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
          >
            <option value="">Select Field Type</option>
            <option value="text">Text Box</option>
            <option value="number">Number Box</option>
            <option value="date">Date Picker</option>
            <option value="time">Time Picker</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </label>
        <label>
          Field Label:
          <input
            type="text"
            value={newField.label}
            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
          />
        </label>
        {newField.type === 'dropdown' && (
          <label>
            Dropdown Options (comma separated):
            <input
              type="text"
              value={newField.options}
              onChange={(e) => setNewField({ ...newField, options: e.target.value })}
            />
          </label>
        )}
        <button onClick={handleAddField}>Add Field</button>
      </div>

      <button onClick={handleSave}>Save Customization</button>
    </div>
  );
};

export default Customize;
