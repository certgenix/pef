import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase-admin";

const sampleEmployerId = "sample-employer-001";
const sampleEmployerEmail = "employer@techcorp.com";

async function seedJobs() {
  console.log("Starting Firestore job seeding...");

  const userDoc = doc(db, "users", sampleEmployerId);
  const userSnapshot = await getDocs(query(collection(db, "users"), where("id", "==", sampleEmployerId)));

  if (userSnapshot.empty) {
    console.log("Creating sample employer user...");
    
    await setDoc(doc(db, "users", sampleEmployerId), {
      id: sampleEmployerId,
      email: sampleEmployerEmail,
      displayName: "TechCorp HR",
      createdAt: new Date(),
      lastLogin: null,
      approvalStatus: "approved",
    });

    const profileId = "profile-" + sampleEmployerId;
    await setDoc(doc(db, "userProfiles", profileId), {
      id: profileId,
      userId: sampleEmployerId,
      fullName: "TechCorp HR Team",
      country: "United States",
      phone: "+1-555-0123",
      city: "San Francisco",
      languages: null,
      headline: "Leading Technology Company",
      bio: "We are a fast-growing technology company looking for talented individuals to join our team.",
      linkedinUrl: null,
      websiteUrl: null,
      portfolioUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await setDoc(doc(db, "userRoles", sampleEmployerId), {
      id: sampleEmployerId,
      userId: sampleEmployerId,
      isProfessional: false,
      isJobSeeker: false,
      isEmployer: true,
      isBusinessOwner: false,
      isInvestor: false,
      createdAt: new Date(),
    });

    const employerProfileId = "employer-" + sampleEmployerId;
    await setDoc(doc(db, "employerProfiles", employerProfileId), {
      id: employerProfileId,
      userId: sampleEmployerId,
      companyName: "TechCorp Inc.",
      industry: "Technology",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("Sample employer created!");
  } else {
    console.log("Sample employer already exists!");
  }

  const jobs = [
    {
      id: "job-001",
      userId: sampleEmployerId,
      type: "job",
      title: "Senior Full Stack Developer",
      description: "We are seeking an experienced Full Stack Developer to join our engineering team. You will be responsible for developing and maintaining web applications using modern technologies. The ideal candidate has strong experience with React, Node.js, and cloud platforms.",
      sector: "Technology",
      country: "United States",
      city: "San Francisco",
      budgetOrSalary: "$120,000 - $160,000/year",
      contactPreference: "Apply through our careers portal",
      status: "open",
      approvalStatus: "approved",
      details: {
        employmentType: "full-time",
        salaryMin: 120000,
        salaryMax: 160000,
        salaryCurrency: "USD",
        experienceRequired: "5+ years in full-stack development",
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
        benefits: ["Health insurance", "401k matching", "Remote work option", "Professional development budget"],
        applicationEmail: "careers@techcorp.com",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "job-002",
      userId: sampleEmployerId,
      type: "job",
      title: "Product Manager",
      description: "Join our product team to help shape the future of our platform. You will work closely with engineering, design, and business teams to define product strategy and roadmap. We're looking for someone with strong analytical skills and a passion for building great products.",
      sector: "Technology",
      country: "United States",
      city: "New York",
      budgetOrSalary: "$130,000 - $170,000/year",
      contactPreference: "Email us at careers@techcorp.com",
      status: "open",
      approvalStatus: "approved",
      details: {
        employmentType: "full-time",
        salaryMin: 130000,
        salaryMax: 170000,
        salaryCurrency: "USD",
        experienceRequired: "3+ years in product management",
        skills: ["Product strategy", "User research", "Data analysis", "Agile methodologies"],
        benefits: ["Health insurance", "401k matching", "Stock options", "Flexible hours"],
        applicationEmail: "careers@techcorp.com",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "job-003",
      userId: sampleEmployerId,
      type: "job",
      title: "DevOps Engineer",
      description: "We're looking for a DevOps Engineer to help build and maintain our infrastructure. You'll be responsible for automating deployments, monitoring systems, and ensuring high availability. Experience with containerization and cloud platforms is essential.",
      sector: "Technology",
      country: "United States",
      city: "Austin",
      budgetOrSalary: "$110,000 - $150,000/year",
      contactPreference: "Apply at www.techcorp.com/careers",
      status: "open",
      approvalStatus: "approved",
      details: {
        employmentType: "full-time",
        salaryMin: 110000,
        salaryMax: 150000,
        salaryCurrency: "USD",
        experienceRequired: "4+ years in DevOps or SRE",
        skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Python"],
        benefits: ["Health insurance", "401k matching", "Remote work", "Learning stipend"],
        applicationEmail: "careers@techcorp.com",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "job-004",
      userId: sampleEmployerId,
      type: "job",
      title: "UI/UX Designer",
      description: "Join our design team to create beautiful and intuitive user experiences. You'll work on designing web and mobile applications, conducting user research, and collaborating with product and engineering teams. We value creativity, attention to detail, and user-centered thinking.",
      sector: "Design",
      country: "United States",
      city: "Remote",
      budgetOrSalary: "$90,000 - $130,000/year",
      contactPreference: "Send portfolio to design@techcorp.com",
      status: "open",
      approvalStatus: "approved",
      details: {
        employmentType: "remote",
        salaryMin: 90000,
        salaryMax: 130000,
        salaryCurrency: "USD",
        experienceRequired: "3+ years in UI/UX design",
        skills: ["Figma", "Adobe XD", "User research", "Prototyping", "Design systems"],
        benefits: ["Health insurance", "401k", "Fully remote", "Equipment allowance", "Professional development"],
        applicationEmail: "design@techcorp.com",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  console.log(`Adding ${jobs.length} job postings...`);

  for (const job of jobs) {
    const existingJob = await getDocs(query(collection(db, "opportunities"), where("id", "==", job.id)));

    if (existingJob.empty) {
      await setDoc(doc(db, "opportunities", job.id), job);
      console.log(`✓ Added: ${job.title}`);
    } else {
      console.log(`- Already exists: ${job.title}`);
    }
  }

  console.log("Firestore job seeding completed!");
}

seedJobs()
  .then(() => {
    console.log("All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding jobs:", error);
    process.exit(1);
  });
