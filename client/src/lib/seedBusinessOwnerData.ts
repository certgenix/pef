import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function seedBusinessOwnerOpportunities(userId: string) {
  const opportunities = [
    {
      userId,
      type: "investment",
      title: "Seeking $2M Series A for Renewable Energy Expansion",
      description: "We are a renewable energy company looking to expand operations across the GCC region. Seeking Series A investment of $2M to scale our solar panel installation business. Current revenue: $1.2M annually with 45% YoY growth. Strong partnerships with government entities and private developers.",
      sector: "Clean Energy",
      country: "United Arab Emirates",
      city: "Dubai",
      budgetOrSalary: "$2M",
      contactPreference: "via email",
      status: "open",
      approvalStatus: "approved",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      userId,
      type: "partnership",
      title: "Strategic Partnership for Middle East Market Entry",
      description: "Established European logistics company seeking local partner for market entry in Saudi Arabia and UAE. We bring advanced logistics technology and operational expertise. Looking for partner with local market knowledge, distribution networks, and regulatory understanding.",
      sector: "Logistics & Supply Chain",
      country: "Saudi Arabia",
      city: "Riyadh",
      contactPreference: "through PEF messaging",
      status: "open",
      approvalStatus: "approved",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      userId,
      type: "investment",
      title: "Growth Capital for FinTech Platform - $5M",
      description: "Fast-growing FinTech platform serving SMEs across MENA region. Currently processing $50M in transactions monthly. Seeking $5M growth capital to expand to 3 new markets and enhance our product suite. Strong regulatory approvals and partnerships with major banks.",
      sector: "Financial Technology",
      country: "United Arab Emirates",
      city: "Abu Dhabi",
      budgetOrSalary: "$5M",
      contactPreference: "via email",
      status: "open",
      approvalStatus: "approved",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      userId,
      type: "collaboration",
      title: "Technology Partnership for Smart City Solutions",
      description: "Looking to collaborate with technology partners to develop integrated smart city solutions for urban development projects in the GCC. We have secured contracts with city planners and need partners specializing in IoT, AI, and sustainable infrastructure.",
      sector: "Smart Cities & Technology",
      country: "Qatar",
      city: "Doha",
      contactPreference: "via email",
      status: "open",
      approvalStatus: "approved",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ];

  const createdOpportunities = [];
  for (const opportunity of opportunities) {
    const docRef = await addDoc(collection(db, "opportunities"), opportunity);
    createdOpportunities.push({ id: docRef.id, ...opportunity });
  }

  console.log("✅ Seeded", createdOpportunities.length, "business owner opportunities");
  return createdOpportunities;
}

// You can call this function from the browser console when logged in as a business owner:
// import { seedBusinessOwnerOpportunities } from './lib/seedBusinessOwnerData';
// seedBusinessOwnerOpportunities('your-user-id').then(console.log);
