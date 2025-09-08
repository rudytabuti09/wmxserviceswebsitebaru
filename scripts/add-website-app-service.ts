import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const websiteAppService = {
  title: "Website App Development",
  description: "Full-stack web applications with modern frameworks, databases, and real-time features",
  features: [
    "Single Page Applications (SPA)",
    "Progressive Web Apps (PWA)",
    "Real-time Features (WebSocket)",
    "Database Integration",
    "Authentication & Authorization",
    "API Development & Integration",
    "Payment Gateway Integration",
    "Admin Dashboard Development",
    "Content Management System",
    "Cloud Deployment & Hosting"
  ],
  icon: "Globe",
  category: "Web",
  price: 45000000, // Rp 45,000,000 (between Web Dev and Mobile App)
  isVisible: true,
  order: 7 // Will be positioned after existing services
};

async function addWebsiteAppService() {
  try {
    console.log('🚀 Adding Website App Development service...');
    
    // Check if service already exists
    const existingService = await prisma.service.findFirst({
      where: {
        title: websiteAppService.title
      }
    });
    
    if (existingService) {
      console.log('⚠️ Website App Development service already exists!');
      console.log(`📋 Existing service ID: ${existingService.id}`);
      return existingService;
    }
    
    // Create the new service
    const newService = await prisma.service.create({
      data: websiteAppService
    });
    
    console.log('✅ Successfully created Website App Development service!');
    console.log(`📋 Service ID: ${newService.id}`);
    console.log(`💰 Price: Rp ${newService.price.toLocaleString('id-ID')}`);
    console.log(`📂 Category: ${newService.category}`);
    console.log(`👁️ Visible: ${newService.isVisible ? 'Yes' : 'No'}`);
    console.log(`📊 Order: ${newService.order}`);
    
    return newService;
    
  } catch (error) {
    console.error('❌ Error adding Website App Development service:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Auto-run if this file is executed directly
if (require.main === module) {
  addWebsiteAppService().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { addWebsiteAppService, websiteAppService };
