import React, { useState } from 'react';
import './LeadForm.css'; // Import the CSS file

const LeadForm = () => {
    const [formData, setFormData] = useState({
        businessName: '',
        email: '',
        assignTo: '',
        source: '',
        date: '',
        time: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form data:', formData);

        // Optional: Send data to Firebase or another backend
        // firebase.database().ref('leads').push(formData).then(() => {
        //     console.log('Data saved to Firebase');
        // }).catch(error => {
        //     console.error('Error saving data:', error);
        // });

        // Clear the form
        setFormData({
            businessName: '',
            email: '',
            assignTo: '',
            source: '',
            date: '',
            time: ''
        });
    };

    return (
        <div className="container">
            <h1 className="new-lead-title">New Lead Entry</h1>
            <p className="form-description">Fill out the form below to add a new lead to your account</p>

            <form id="lead-form" onSubmit={handleSubmit}>
                <label className="form-label" htmlFor="business-name">Business Name</label>
                <input
                    className="form-input input-business-name"
                    id="business-name"
                    name="businessName"
                    type="text"
                    placeholder="Enter business name"
                    value={formData.businessName}
                    onChange={handleChange}
                />

                <label className="form-label" htmlFor="email">Email Id</label>
                <input
                    className="form-input input-email"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <label className="form-label" htmlFor="assign-to">Assign to</label>
                <input
                    className="form-input input-assign-to"
                    id="assign-to"
                    name="assignTo"
                    type="text"
                    placeholder="Assign to"
                    value={formData.assignTo}
                    onChange={handleChange}
                />

                <label className="form-label" htmlFor="source">Source</label>
                <input
                    className="form-input input-source"
                    id="source"
                    name="source"
                    type="text"
                    placeholder="Source"
                    value={formData.source}
                    onChange={handleChange}
                />

                <label className="form-label" htmlFor="date">Date</label>
                <input
                    className="form-input input-date"
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                />

                <label className="form-label" htmlFor="time">Time</label>
                <input
                    className="form-input input-time"
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                />

                <button type="button" className="cancel-button" onClick={() => setFormData({
                    businessName: '',
                    email: '',
                    assignTo: '',
                    source: '',
                    date: '',
                    time: ''
                })}>Cancel</button>
                <button type="submit" className="submit-button">Submit</button>
            </form>
        </div>
    );
};

export default LeadForm;
