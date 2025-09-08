import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultServices = [
  {
    title: "Web Development",
    description: "Custom websites and web applications tailored to your business needs",
    features: [
      "Responsive Design",
      "Modern Frameworks (Next.js, React)",
      "SEO Optimization", 
      "Performance Optimization",
      "E-commerce Solutions",
      "CMS Integration"
    ],
    icon: "Globe",
    category: "Web",
    price: 25000000,
    isVisible: true,
    order: 1
  },
  {
    title: "Mobile App Development",
    description: "Native and cross-platform mobile applications for iOS and Android",
    features: [
      "Native iOS & Android Apps",
      "Cross-platform Development",
      "App Store Submission",
      "Push Notifications",
      "Offline Functionality",
      "Third-party Integrations"
    ],
    icon: "Smartphone",
    category: "Mobile",
    price: 50000000,
    isVisible: true,
    order: 2
  },
  {
    title: "Desktop Applications", 
    description: "Powerful desktop software solutions for Windows, macOS, and Linux",
    features: [
      "Cross-platform Compatibility",
      "Rich User Interfaces",
      "Database Integration",
      "File System Access", 
      "System Integrations",
      "Auto-update Mechanisms"
    ],
    icon: "Monitor",
    category: "Desktop",
    price: 35000000,
    isVisible: true,
    order: 3
  },
  {
    title: "UI/UX Design",
    description: "Beautiful and intuitive user interface and experience design",
    features: [
      "User Research & Analysis",
      "Wireframing & Prototyping", 
      "Visual Design",
      "Interaction Design",
      "Usability Testing",
      "Design Systems"
    ],
    icon: "Palette",
    category: "Design",
    price: 15000000,
    isVisible: true,
    order: 4
  },
  {
    title: "Digital Marketing",
    description: "Comprehensive digital marketing strategies to grow your business",
    features: [
      "SEO & SEM",
      "Social Media Marketing",
      "Content Marketing",
      "Email Marketing",
      "Analytics & Reporting",
      "Brand Strategy"
    ],
    icon: "TrendingUp",
    category: "Marketing",
    price: 20000000,
    isVisible: true,
    order: 5
  },
  {
    title: "Cloud Solutions",
    description: "Scalable cloud infrastructure and deployment solutions",
    features: [
      "Cloud Migration",
      "DevOps & CI/CD",
      "Server Management",
      "Database Optimization",
      "Security & Monitoring", 
      "Cost Optimization"
    ],
    icon: "Cloud",
    category: "Infrastructure", 
    price: 30000000,
    isVisible: true,
    order: 6
  }
];

async function initServices() {
  try {
    console.log('🚀 Initializing default services...');
    
    // Check if services already exist
    const existingServices = await prisma.service.findMany();
    
    if (existingServices.length > 0) {
      console.log('✅ Services already exist, skipping initialization');
      return;
    }
    
    // Create default services
    for (const service of defaultServices) {
      await prisma.service.create({
        data: service
      });
      console.log(`✅ Created service: ${service.title}`);
    }
    
    console.log('🎉 Successfully initialized all default services!');
    
  } catch (error) {
    console.error('❌ Error initializing services:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Auto-run if this file is executed directly
initServices().catch((error) => {
  console.error(error);
  process.exit(1);
});

export { initServices };
