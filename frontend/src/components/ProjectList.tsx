import React from 'react';
import { formatUSD, formatDuration, formatPercentage } from '../utils/formatters';
import '../styles/components.css';

interface Project {
  id: number;
  name: string;
  description: string;
  municipality: string;
  location: string;
  targetAmount: string;
  raisedAmount: string;
  yieldPercentage: number;
  duration: number;
  createDate: number;
  status: number;
  ipfsHash: string;
  bondTokenAddress: string;
  totalMilestones: number;
  insuranceRequired: boolean;
}

interface ProjectListProps {
  projects: Project[];
}

const STATUS_LABELS = {
  0: '⏳ Pending',
  1: '🚀 Active',
  2: '✅ Funded',
  3: '🔨 In Progress',
  4: '🎉 Completed',
  5: '❌ Defaulted',
};

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  return (
    <div className="projects-list">
      <div className="projects-grid">
        {projects.map((project) => {
          const raised = typeof project.raisedAmount === 'string'
            ? parseFloat(project.raisedAmount)
            : Number(project.raisedAmount);
          const target = typeof project.targetAmount === 'string'
            ? parseFloat(project.targetAmount)
            : Number(project.targetAmount);
          const progress = (raised / target) * 100;
          const statusLabel = STATUS_LABELS[project.status as keyof typeof STATUS_LABELS] || 'Unknown';

          return (
            <div key={project.id} className="project-card">
              <div className="project-status">
                <span className={`status-badge status-${project.status}`}>
                  {statusLabel}
                </span>
              </div>

              <div className="project-header">
                <h3 className="project-name">{project.name}</h3>
                <p className="project-location">📍 {project.location}</p>
              </div>

              <p className="project-description">
                {project.description.substring(0, 120)}...
              </p>

              <div className="project-details">
                <div className="detail-item">
                  <span className="label">Annual Yield</span>
                  <span className="value">{formatPercentage(project.yieldPercentage / 100)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Duration</span>
                  <span className="value">{formatDuration(project.createDate, project.createDate + project.duration)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Milestones</span>
                  <span className="value">{project.totalMilestones}</span>
                </div>
                {project.insuranceRequired && (
                  <div className="detail-item">
                    <span className="label">Insurance</span>
                    <span className="value">🛡️ Included</span>
                  </div>
                )}
              </div>

              <div className="fundraising-section">
                <div className="fundraise-header">
                  <span className="label">Fundraising Progress</span>
                  <span className="percentage">{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="fundraise-amounts">
                  <span className="raised">{formatUSD(raised)} raised</span>
                  <span className="target">of {formatUSD(target)}</span>
                </div>
              </div>

              <div className="project-actions">
                <button className="btn btn-primary btn-block">
                  💰 View & Invest
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectList;
