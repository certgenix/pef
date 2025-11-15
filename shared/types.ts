export interface UserRoles {
  professional: boolean;
  jobSeeker: boolean;
  employer: boolean;
  businessOwner: boolean;
  investor: boolean;
  admin?: boolean;
}

export interface UserLinks {
  linkedin?: string;
  website?: string;
  portfolio?: string;
}

export interface ProfessionalData {
  industry?: string;
  title?: string;
  experience?: string;
  skills?: string[];
  certifications?: string[];
  achievements?: string;
}

export interface JobSeekerData {
  targetIndustry?: string;
  targetRole?: string;
  expectedSalary?: string;
  availability?: string;
  resume?: string;
  skills?: string[];
}

export interface EmployerData {
  companyName?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  description?: string;
}

export interface BusinessOwnerData {
  businessName?: string;
  businessType?: string;
  industry?: string;
  yearFounded?: number;
  employees?: string;
  revenue?: string;
  description?: string;
}

export interface InvestorData {
  investmentFocus?: string[];
  investmentRange?: string;
  preferredStage?: string;
  industries?: string[];
  portfolio?: string;
}

export type UserStatus = "pending" | "approved" | "rejected";

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  languages?: string[];
  headline?: string;
  bio?: string;
  links?: UserLinks;
  roles: UserRoles;
  status: UserStatus;
  createdAt: Date;
  lastUpdated: Date;
  professionalData?: ProfessionalData;
  jobSeekerData?: JobSeekerData;
  employerData?: EmployerData;
  businessOwnerData?: BusinessOwnerData;
  investorData?: InvestorData;
}

export interface JobListing {
  id: string;
  employerId: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  requirements: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  lastUpdated: Date;
}

export interface Opportunity {
  id: string;
  userId: string;
  type: "partnership" | "investment" | "other";
  title: string;
  description: string;
  requirements?: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  lastUpdated: Date;
}

export interface BusinessListing {
  id: string;
  ownerId: string;
  businessName: string;
  industry: string;
  description: string;
  lookingFor: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  lastUpdated: Date;
}

export interface InvestmentListing {
  id: string;
  investorId: string;
  title: string;
  investmentRange: string;
  focusAreas: string[];
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  lastUpdated: Date;
}
