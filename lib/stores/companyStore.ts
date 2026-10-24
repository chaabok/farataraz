import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompanyInfo {
  businessStructureId: number;
  title: string;
  title_en: string;
  logoUrl: string | null;
  businessStructure: number;
  parentRef?: number | string | null;
}

interface CompanyState {
  currentCompany: CompanyInfo | null;
  currentBranch: CompanyInfo | null;
  currentRep: CompanyInfo | null;

  setCurrentCompany: (company: CompanyInfo | null | ((prev: CompanyInfo | null) => CompanyInfo | null)) => void;
  setCurrentBranch: (branch: CompanyInfo | null | ((prev: CompanyInfo | null) => CompanyInfo | null)) => void;
  setCurrentRep: (rep: CompanyInfo | null | ((prev: CompanyInfo | null) => CompanyInfo | null)) => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      currentCompany: null,
      currentBranch: null,
      currentRep: null,

      setCurrentBranch: (branchAction) => set((state) => ({
        currentBranch: typeof branchAction === 'function' ? branchAction(state.currentBranch) : branchAction
      })),

      setCurrentRep: (repAction) => set((state) => ({
        currentRep: typeof repAction === 'function' ? repAction(state.currentRep) : repAction
      })),

      setCurrentCompany: (companyAction) => set((state) => ({
        currentCompany: typeof companyAction === 'function' ? companyAction(state.currentCompany) : companyAction,
        currentBranch: null,
        currentRep: null
      })),
    }),
    {
      name: 'app-company-storage',
    }
  )
);
