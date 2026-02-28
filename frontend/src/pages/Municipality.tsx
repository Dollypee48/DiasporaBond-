import React, { useState } from 'react';
import { useWeb3Context } from '../context/Web3Context';
import '../styles/pages.css';

const Municipality: React.FC = () => {
  const { isConnected, connect } = useWeb3Context();
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    location: '',
    targetAmount: '',
    yieldPercentage: '',
    duration: '365',
    ipfsHash: '',
    insuranceRequired: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Project submission:', formData);
    // TODO: Call smart contract to create project
  };

  if (!isConnected) {
    return (
      <div className="page municipality-page">
        <div className="empty-state">
          <h2>Municipality Dashboard</h2>
          <p>Connect an authorized municipality wallet to create new infrastructure bond projects and manage milestones.</p>
          <button className="btn btn-primary" onClick={connect}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page municipality-page">
      <div className="page-header">
        <h1>🏛️ Municipality Dashboard</h1>
        <p>Create projects, track milestones, and manage repayments</p>
      </div>

      <section className="create-project-section">
        <h2>Create New Infrastructure Project</h2>
        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label htmlFor="projectName">Project Name *</label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              placeholder="e.g., Water Supply Expansion"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your infrastructure project..."
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., City, Country"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="targetAmount">Target Amount (USD) *</label>
              <input
                type="number"
                id="targetAmount"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleInputChange}
                placeholder="100000"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="yieldPercentage">Annual Yield (%) *</label>
              <input
                type="number"
                id="yieldPercentage"
                name="yieldPercentage"
                value={formData.yieldPercentage}
                onChange={handleInputChange}
                placeholder="10"
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Project Duration (Days) *</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="365"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ipfsHash">Project Documentation IPFS Hash</label>
            <input
              type="text"
              id="ipfsHash"
              name="ipfsHash"
              value={formData.ipfsHash}
              onChange={handleInputChange}
              placeholder="QmXxxx..."
            />
            <small>Upload documents to IPFS first, then paste the hash here</small>
          </div>

          <div className="form-group checkbox">
            <label htmlFor="insuranceRequired">
              <input
                type="checkbox"
                id="insuranceRequired"
                name="insuranceRequired"
                checked={formData.insuranceRequired}
                onChange={handleInputChange}
              />
              Enable Default Insurance (1.5% premium)
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-lg">
            📝 Create Project
          </button>
        </form>
      </section>

      <section className="active-projects-section">
        <h2>Your Active Projects</h2>
        <div className="empty-state">
          <p>Projects will appear here after creation</p>
        </div>
      </section>

      <section className="milestone-tracking">
        <h2>Milestone Management</h2>
        <div className="empty-state">
          <p>Manage milestones and track completion for your projects</p>
        </div>
      </section>

      <section className="repayment-section">
        <h2>Record Repayments</h2>
        <div className="empty-state">
          <p>Submit repayment transactions here after investor funds are received</p>
        </div>
      </section>
    </div>
  );
};

export default Municipality;
