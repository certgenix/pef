export interface FirestoreUserRoles {
  professional: boolean;
  jobSeeker: boolean;
  employer: boolean;
  businessOwner: boolean;
  investor: boolean;
  admin: boolean;
}

export interface FirestoreProfessionalData {
  title?: string;
  experience?: string;
  industry?: string;
  skills?: string[];
  certifications?: string[];
  achievements?: string;
}

export interface FirestoreJobSeekerData {
  targetIndustry?: string;
  targetRole?: string;
  expectedSalary?: string;
  availability?: string;
  resume?: string;
  skills?: string[];
}

export interface FirestoreEmployerData {
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  description?: string;
}

export interface FirestoreBusinessOwnerData {
  businessName?: string;
  businessType?: string;
  industry?: string;
  yearFounded?: number;
  employees?: string;
  revenue?: string;
  description?: string;
}

export interface FirestoreInvestorData {
  investmentFocus?: string[];
  investmentRange?: string;
  preferredStage?: string;
  industries?: string[];
  portfolio?: string;
}

export interface FirestoreUser {
  uid: string;
  fullName: string;
  email: string;
  country: string;
  city?: string;
  phone?: string;
  languages?: string[];
  headline?: string;
  bio?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  roles: FirestoreUserRoles;
  profileCompleted: boolean;
  professionalData?: FirestoreProfessionalData;
  jobSeekerData?: FirestoreJobSeekerData;
  employerData?: FirestoreEmployerData;
  businessOwnerData?: FirestoreBusinessOwnerData;
  investorData?: FirestoreInvestorData;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: Date | string;
  lastUpdated: Date | string;
}

export interface FirestoreJobPost {
  id: string;
  employerId: string;
  title: string;
  description: string;
  location: string;
  country?: string;
  city?: string;
  employmentType?: "full-time" | "part-time" | "remote" | "contract";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  requirements: string[];
  skills?: string[];
  benefits?: string[];
  applicants: string[];
  status: "open" | "closed";
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FirestoreBusinessOpportunity {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  industry?: string;
  country?: string;
  city?: string;
  investmentNeeded?: string;
  collaboratorsNeeded?: number;
  type: "investment" | "partnership" | "collaboration";
  interestedInvestors: string[];
  status: "open" | "closed";
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FirestoreApplication {
  id: string;
  userId: string;
  jobPostId: string;
  status: "applied" | "under_review" | "interview" | "offer" | "rejected" | "withdrawn";
  coverLetter?: string;
  resume?: string;
  metadata?: Record<string, any>;
  appliedAt: Date | string;
  updatedAt: Date | string;
}

export interface FirestoreInvestorInterest {
  id: string;
  userId: string;
  opportunityId: string;
  message?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: Date | string;
}
