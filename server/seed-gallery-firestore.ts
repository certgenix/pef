import { db } from "./firebase-admin";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const sampleGalleryData = [
  {
    title: "Annual Leadership Summit 2024",
    description: "Our flagship event bringing together industry leaders and professionals from across the globe.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    category: "Conference",
    eventDate: new Date("2024-03-15"),
    visible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    title: "Executive Networking Dinner",
    description: "Intimate gathering of C-suite executives discussing future business trends.",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
    category: "Networking",
    eventDate: new Date("2024-02-20"),
    visible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    title: "Innovation Workshop Series",
    description: "Hands-on workshops focusing on emerging technologies and innovation strategies.",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    category: "Workshop",
    eventDate: new Date("2024-01-10"),
    visible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    title: "Professional Development Seminar",
    description: "Expert-led sessions on career advancement and professional growth.",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
    category: "Seminar",
    eventDate: new Date("2023-12-05"),
    visible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    title: "Industry Panel Discussion",
    description: "Leading executives share insights on market trends and opportunities.",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
    category: "Panel",
    eventDate: new Date("2023-11-18"),
    visible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    title: "Global Business Forum",
    description: "International forum connecting business leaders and investors worldwide.",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
    category: "Forum",
    eventDate: new Date("2023-10-22"),
    visible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    title: "Mentorship Program Launch",
    description: "Kickoff event for our executive mentorship program.",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    category: "Program",
    eventDate: new Date("2023-09-30"),
    visible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    title: "Investment Summit",
    description: "Bringing together investors and entrepreneurs for strategic partnerships.",
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
    category: "Summit",
    eventDate: new Date("2023-08-14"),
    visible: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

async function seedGallery() {
  console.log("Starting gallery data seeding...");
  
  try {
    const galleryCollection = collection(db, "gallery");
    
    for (const image of sampleGalleryData) {
      const docRef = await addDoc(galleryCollection, image);
      console.log(`Added gallery image: ${image.title} with ID: ${docRef.id}`);
    }
    
    console.log(`Successfully seeded ${sampleGalleryData.length} gallery images!`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding gallery data:", error);
    process.exit(1);
  }
}

seedGallery();
