import { PrismaClient, Role, WorkType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database…');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@careerverse.ai' },
    update: {},
    create: {
      email: 'admin@careerverse.ai',
      password: adminPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Sample startup
  const startupPassword = await bcrypt.hash('Startup@123', 12);
  const startupUser = await prisma.user.upsert({
    where: { email: 'hr@techstartup.io' },
    update: {},
    create: {
      email: 'hr@techstartup.io',
      password: startupPassword,
      role: Role.STARTUP,
      isVerified: true,
    },
  });

  const company = await prisma.company.upsert({
    where: { userId: startupUser.id },
    update: {},
    create: {
      userId: startupUser.id,
      name: 'TechStartup.io',
      website: 'https://techstartup.io',
      industry: 'SaaS',
      size: '11-50',
      description: 'Building the next generation of developer tools.',
      location: 'Bangalore, India',
      isVerified: true,
    },
  });

  // Sample internship
  await prisma.internship.upsert({
    where: { id: 'sample-internship-1' },
    update: {},
    create: {
      id: 'sample-internship-1',
      companyId: company.id,
      position: 'Full Stack Developer Intern',
      description: 'Join our team to build scalable web applications using React and Node.js.',
      skillsRequired: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      duration: '3 months',
      stipend: '₹15,000/month',
      location: 'Bangalore',
      workType: WorkType.HYBRID,
      openings: 3,
      status: 'ACTIVE',
    },
  });

  // Sample student
  const studentPassword = await bcrypt.hash('Student@123', 12);
  const studentUser = await prisma.user.upsert({
    where: { email: 'raj@example.com' },
    update: {},
    create: {
      email: 'raj@example.com',
      password: studentPassword,
      role: Role.STUDENT,
      isVerified: true,
    },
  });

  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      name: 'Raj Kumar',
      location: 'Chennai, India',
      bio: 'Passionate backend developer with a love for building scalable systems.',
      college: 'IIT Madras',
      degree: 'B.Tech',
      branch: 'Computer Science',
      graduationYear: 2025,
      cgpa: 8.5,
      githubUsername: 'rajkumar',
      programmingLangs: ['JavaScript', 'TypeScript', 'Python', 'Go'],
      frameworks: ['Node.js', 'Express', 'React', 'NestJS'],
      databases: ['PostgreSQL', 'MongoDB', 'Redis'],
      cloudPlatforms: ['AWS', 'Docker'],
      tools: ['Git', 'Linux', 'VS Code'],
      profileCompleted: true,
      profileScore: 85,
      aiSummary: 'Raj is a backend developer specializing in Node.js and PostgreSQL with three production-ready projects and consistent GitHub activity.',
      aiSkillScores: { 'Node.js': 92, 'TypeScript': 88, 'React': 78, 'PostgreSQL': 85, 'Python': 72 },
      aiStrengths: ['Strong backend architecture skills', 'Active open-source contributor', 'Production deployment experience'],
      aiImprovements: ['Learn Kubernetes for container orchestration', 'Build a larger SaaS project', 'Contribute to major open-source projects'],
    },
  });

  // Projects for student
  await prisma.project.createMany({
    skipDuplicates: true,
    data: [
      {
        studentId: student.id,
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce platform with cart, payments, and admin dashboard.',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe'],
        githubUrl: 'https://github.com/rajkumar/ecommerce',
        liveUrl: 'https://shop.rajkumar.dev',
      },
      {
        studentId: student.id,
        title: 'Real-Time Chat App',
        description: 'WebSocket-based chat application supporting multiple rooms and file sharing.',
        technologies: ['Socket.io', 'React', 'Node.js', 'MongoDB'],
        githubUrl: 'https://github.com/rajkumar/chat-app',
      },
      {
        studentId: student.id,
        title: 'DevOps Dashboard',
        description: 'Monitoring dashboard for containerized applications with real-time metrics.',
        technologies: ['React', 'Docker', 'Prometheus', 'Grafana'],
        githubUrl: 'https://github.com/rajkumar/devops-dashboard',
      },
    ],
  });

  console.log('✅ Sample data seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('  Admin:   admin@careerverse.ai / Admin@123');
  console.log('  Startup: hr@techstartup.io / Startup@123');
  console.log('  Student: raj@example.com / Student@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
