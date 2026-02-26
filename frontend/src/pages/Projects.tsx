import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import ProjectList from '../components/ProjectList';
import '../styles/pages.css';

const Projects: React.FC = () => {
  const { projects, isLoading, error } = useProjects();
  const [filter, setFilter] = useState<'all' | 'active' | 'funded'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'active') {
      return matchesSearch && project.status === 1; // Active status
    } else if (filter === 'funded') {
      return matchesSearch && project.status === 2; // FundsRaised status
    }

    return matchesSearch;
  });

  return (
    <div className="page projects-page">
      <div className="page-header">
        <h1>Infrastructure Projects</h1>
        <p>Discover tokenized municipal bonds supporting real infrastructure in Africa</p>
      </div>

      <div className="projects-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by project name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Projects ({projects.length})
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active Fundraising
          </button>
          <button
            className={`filter-btn ${filter === 'funded' ? 'active' : ''}`}
            onClick={() => setFilter('funded')}
          >
            Funded & In Progress
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading">
          <p>Loading projects...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>⚠️ Error loading projects: {error}</p>
        </div>
      )}

      {!isLoading && filteredProjects.length === 0 ? (
        <div className="empty-state">
          <p>📭 No projects found matching your criteria</p>
        </div>
      ) : (
        <ProjectList projects={filteredProjects} />
      )}

      {!isLoading && projects.length === 0 && (
        <div className="info-box">
          <h3>No Projects Available Yet</h3>
          <p>
            Projects will appear here once they are deployed on the Creditcoin testnet.
            Make sure to deploy the smart contracts first.
          </p>
        </div>
      )}
    </div>
  );
};

export default Projects;
