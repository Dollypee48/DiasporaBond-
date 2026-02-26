// useProjects Hook - Fetch and manage projects
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "../utils/constants";
import { CONTRACT_ABIS } from "../contracts/contractABIs";
import { getContract } from "../utils/ethersHelper";

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

interface Milestone {
  title: string;
  description: string;
  targetDate: number;
  fundAmount: string;
  completed: boolean;
  approved: boolean;
  completionDate: number;
}

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  totalProjects: number;
}

export function useProjects() {
  const [state, setState] = useState<ProjectsState>({
    projects: [],
    isLoading: false,
    error: null,
    totalProjects: 0,
  });

  const [milestones, setMilestones] = useState<{ [key: number]: Milestone[] }>({});

  const fetchProjects = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const contract = await getContract(
        CONTRACT_ADDRESSES.ProjectRegistry,
        CONTRACT_ABIS.ProjectRegistry,
        true
      );

      const total = await contract.getTotalProjects();
      const count = typeof total === "bigint" ? Number(total) : total;

      const projectList: Project[] = [];

      for (let i = 0; i < count; i++) {
        const project = await contract.getProject(i);
        projectList.push({
          id: i,
          name: project.name,
          description: project.description,
          municipality: project.municipality,
          location: project.location,
          targetAmount: project.targetAmount.toString(),
          raisedAmount: project.raisedAmount.toString(),
          yieldPercentage: Number(project.yieldPercentage),
          duration: Number(project.duration),
          createDate: Number(project.createDate),
          status: Number(project.status),
          ipfsHash: project.ipfsHash,
          bondTokenAddress: project.bondTokenAddress,
          totalMilestones: Number(project.totalMilestones),
          insuranceRequired: project.insuranceRequired,
        });
      }

      setState((prev) => ({
        ...prev,
        projects: projectList,
        totalProjects: count,
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to fetch projects",
        isLoading: false,
      }));
    }
  }, []);

  const fetchProjectMilestones = useCallback(async (projectId: number) => {
    try {
      const contract = await getContract(
        CONTRACT_ADDRESSES.ProjectRegistry,
        CONTRACT_ABIS.ProjectRegistry,
        true
      );

      const milestonesData = await contract.getProjectMilestones(projectId);

      const parsed = milestonesData.map((m: any) => ({
        title: m.title,
        description: m.description,
        targetDate: Number(m.targetDate),
        fundAmount: m.fundAmount.toString(),
        completed: m.completed,
        approved: m.approved,
        completionDate: Number(m.completionDate),
      }));

      setMilestones((prev) => ({
        ...prev,
        [projectId]: parsed,
      }));

      return parsed;
    } catch (error) {
      console.error("Error fetching milestones:", error);
      return [];
    }
  }, []);

  const getProjectById = useCallback(
    (projectId: number): Project | undefined => {
      return state.projects.find((p) => p.id === projectId);
    },
    [state.projects]
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    ...state,
    milestones,
    refreshProjects: fetchProjects,
    fetchProjectMilestones,
    getProjectById,
  };
}
