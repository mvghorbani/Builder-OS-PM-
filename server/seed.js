
const bcrypt = require('bcrypt');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { users } = require('../shared/schema');
const ws = require('ws');

// Configure neon for serverless
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

async function seedAdminUser() {
  try {
    // Create database connection
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool });

    // Define the admin user data
    const adminEmail = 'mvghorbani@gmail.com';
    const plainPassword = '2424Ghorbani!';
    
    // Hash the password with bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Create the admin user object
    const adminUser = {
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      passwordHash: hashedPassword,
    };

    // Insert the user into the database
    const [createdUser] = await db.insert(users).values(adminUser).returning();

    console.log('Admin user created successfully!');
    console.log('User ID:', createdUser.id);
    console.log('Email:', createdUser.email);
    console.log('Role:', createdUser.role);

    // Close the database connection
    await pool.end();
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the seed function
seedAdminUser();
