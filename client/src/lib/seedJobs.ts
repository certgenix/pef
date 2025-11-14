import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const sampleJobs = [
  {
    employerId: "sample-user-1",
    userId: "sample-user-1",
    title: "Senior Software Engineer",
    company: "Tech Innovations Inc.",
    location: "Riyadh, Saudi Arabia",
    type: "Full-time",
    salary: "$100,000 - $150,000 per year",
    description: "We are seeking an experienced Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining scalable web applications. The ideal candidate has strong experience with React, Node.js, and cloud platforms.",
    requirements: [
      "5+ years of experience in software development",
      "Strong proficiency in JavaScript, TypeScript, React, and Node.js",
      "Experience with cloud platforms (AWS, GCP, or Azure)",
      "Excellent problem-solving and communication skills",
      "Bachelor's degree in Computer Science or related field"
    ],
    status: "approved" as const,
  },
  {
    employerId: "sample-user-1",
    userId: "sample-user-1",
    title: "Product Manager",
    company: "Digital Solutions Ltd.",
    location: "Dubai, UAE",
    type: "Full-time",
    salary: "$90,000 - $130,000 per year",
    description: "Join our product team as a Product Manager where you'll define product vision, strategy, and roadmap. You'll work closely with engineering, design, and marketing teams to deliver exceptional products that meet market needs.",
    requirements: [
      "3+ years of product management experience",
      "Proven track record of successful product launches",
      "Strong analytical and data-driven decision-making skills",
      "Excellent stakeholder management abilities",
      "Experience with Agile methodologies"
    ],
    status: "approved" as const,
  },
  {
    employerId: "sample-user-1",
    userId: "sample-user-1",
    title: "UX/UI Designer",
    company: "Creative Studios",
    location: "Remote",
    type: "Contract",
    salary: "$70,000 - $100,000 per year",
    description: "We're looking for a talented UX/UI Designer to create intuitive and beautiful user experiences. You'll collaborate with product managers and developers to design user-centered solutions for web and mobile applications.",
    requirements: [
      "3+ years of UX/UI design experience",
      "Proficiency in Figma, Sketch, or Adobe XD",
      "Strong portfolio demonstrating user-centered design",
      "Experience with design systems and component libraries",
      "Understanding of front-end development principles"
    ],
    status: "approved" as const,
  },
  {
    employerId: "sample-user-1",
    userId: "sample-user-1",
    title: "Data Analyst",
    company: "Analytics Pro",
    location: "Jeddah, Saudi Arabia",
    type: "Full-time",
    salary: "$60,000 - $90,000 per year",
    description: "As a Data Analyst, you'll transform complex data into actionable insights that drive business decisions. You'll work with large datasets, create visualizations, and collaborate with stakeholders across the organization.",
    requirements: [
      "2+ years of data analysis experience",
      "Proficiency in SQL and Python",
      "Experience with data visualization tools (Tableau, Power BI)",
      "Strong statistical analysis skills",
      "Excellent communication and presentation abilities"
    ],
    status: "pending" as const,
  },
];

export async function seedJobs() {
  try {
    console.log("Starting to seed jobs into Firestore...");
    
    for (const job of sampleJobs) {
      const docRef = await addDoc(collection(db, "jobs"), {
        ...job,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });
      console.log(`Job "${job.title}" added with ID: ${docRef.id}`);
    }
    
    console.log("All sample jobs have been seeded successfully!");
    return { success: true, message: "Jobs seeded successfully" };
  } catch (error) {
    console.error("Error seeding jobs:", error);
    return { success: false, error };
  }
}
