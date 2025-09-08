const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPortfolioCreate() {
  try {
    console.log('Testing portfolio creation...');
    
    const portfolio = await prisma.portfolioItem.create({
      data: {
        title: "Test Portfolio via Script",
        description: "This is a test portfolio item created via script",
        imageUrl: "https://via.placeholder.com/600x400",
        category: "Web",
        featured: false,
        // liveUrl is optional, so we don't include it
      }
    });
    
    console.log('Portfolio created successfully:', portfolio);
  } catch (error) {
    console.error('Error creating portfolio:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPortfolioCreate();
