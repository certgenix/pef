import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "./firebase-admin";

const sampleEmployerId = "sample-employer-001";

async function addMoreJobs() {
  console.log("Adding additional job postings to Firestore...");

  const additionalJobs = [
    {
      id: "job-005",
      userId: sampleEmployerId,
      type: "job",
      title: "Marketing Manager",
      description: "We're looking for a creative and data-driven Marketing Manager to lead our marketing efforts. You'll develop and execute marketing strategies, manage campaigns across multiple channels, and analyze performance metrics. Experience with digital marketing and team leadership is essential.",
      sector: "Marketing",
      country: "United States",
      city: "Los Angeles",
      budgetOrSalary: "$95,000 - $135,000/year",
      contactPreference: "Apply at careers@techcorp.com",
      status: "open",
      approvalStatus: "approved",
      details: {
        employmentType: "full-time",
        salaryMin: 95000,
        salaryMax: 135000,
        salaryCurrency: "USD",
        experienceRequired: "5+ years in marketing",
        skills: ["Digital marketing", "SEO/SEM", "Content strategy", "Analytics", "Team leadership"],
        benefits: ["Health insurance", "401k", "Flexible hours", "Marketing budget", "Conference attendance"],
        applicationEmail: "careers@techcorp.com",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "job-006",
      userId: sampleEmployerId,
      type: "job",
      title: "Data Scientist",
      description: "Join our data science team to extract insights from complex datasets and build predictive models. You'll work with large-scale data, develop machine learning algorithms, and collaborate with product teams to drive data-informed decisions. Strong Python and statistical analysis skills required.",
      sector: "Technology",
      country: "United States",
      city: "Seattle",
      budgetOrSalary: "$140,000 - $180,000/year",
      contactPreference: "Email careers@techcorp.com with your portfolio",
      status: "open",
      approvalStatus: "approved",
      details: {
        employmentType: "full-time",
        salaryMin: 140000,
        salaryMax: 180000,
        salaryCurrency: "USD",
        experienceRequired: "4+ years in data science or related field",
        skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Statistical Analysis", "Data Visualization"],
        benefits: ["Health insurance", "401k matching", "Stock options", "Remote work", "Learning budget"],
        applicationEmail: "careers@techcorp.com",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "job-007",
      userId: sampleEmployerId,
      type: "job",
      title: "Customer Success Manager",
      description: "Help our customers achieve their goals and maximize value from our platform. You'll build strong relationships, provide strategic guidance, and ensure high customer satisfaction and retention. Experience in SaaS and consultative selling is a plus.",
      sector: "Customer Success",
      country: "United States",
      city: "Boston",
      budgetOrSalary: "$75,000 - $105,000/year",
      contactPreference: "Apply through our careers portal",
      status: "open",
      approvalStatus: "approved",
      details: {
        employmentType: "full-time",
        salaryMin: 75000,
        salaryMax: 105000,
        salaryCurrency: "USD",
        experienceRequired: "3+ years in customer success or account management",
        skills: ["Customer relationship management", "SaaS knowledge", "Communication", "Problem solving", "Data analysis"],
        benefits: ["Health insurance", "401k", "Commission", "Remote flexibility", "Career development"],
        applicationEmail: "careers@techcorp.com",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  console.log(`Adding ${additionalJobs.length} more job postings...`);

  for (const job of additionalJobs) {
    const existingJob = await getDocs(query(collection(db, "opportunities"), where("id", "==", job.id)));

    if (existingJob.empty) {
      await setDoc(doc(db, "opportunities", job.id), job);
      console.log(`✓ Added: ${job.title}`);
    } else {
      console.log(`- Already exists: ${job.title}`);
    }
  }

  // Show total count
  const allJobsQuery = query(collection(db, "opportunities"), where("type", "==", "job"));
  const allJobsSnapshot = await getDocs(allJobsQuery);
  console.log(`\nTotal jobs in Firestore: ${allJobsSnapshot.size}`);
  
  console.log("\nAll jobs:");
  allJobsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    console.log(`- ${data.title} (${data.city}, ${data.budgetOrSalary})`);
  });

  console.log("\nAdditional jobs added successfully!");
}

addMoreJobs()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error adding jobs:", error);
    process.exit(1);
  });
