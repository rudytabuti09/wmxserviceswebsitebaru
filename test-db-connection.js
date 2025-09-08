const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Get database info
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('\n📊 Database Info:');
    console.log('----------------');
    result.forEach(info => {
      console.log(`Database: ${info.current_database}`);
      console.log(`User: ${info.current_user}`);
      console.log(`Version: ${info.version.split(',')[0]}`);
    });
    
    // Count tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('\n📋 Available Tables:');
    console.log('-------------------');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Test a simple query
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const invoiceCount = await prisma.invoice.count();
    
    console.log('\n📈 Data Statistics:');
    console.log('------------------');
    console.log(`Users: ${userCount}`);
    console.log(`Projects: ${projectCount}`);
    console.log(`Invoices: ${invoiceCount}`);
    
    console.log('\n✨ All database tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'P1001') {
      console.error('\n💡 Hint: Check if the database server is running and accessible.');
    } else if (error.code === 'P1002') {
      console.error('\n💡 Hint: The database server was reached but timed out.');
    } else if (error.code === 'P1003') {
      console.error('\n💡 Hint: Database does not exist.');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the test
testConnection();
