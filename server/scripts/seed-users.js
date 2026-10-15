import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('[Error] MONGO_URI is not configured in server/.env');
  process.exit(1);
}

const maskUri = (uri) => uri ? uri.replace(/\/\/(.*?):(.*?)@/, '//$1:*****@') : '';

// 5 Administrators
const ADMINS = [
  { name: 'Eleanor Vance', email: 'eleanor.vance@enterprise.corp' },
  { name: 'Marcus Sterling', email: 'marcus.sterling@enterprise.corp' },
  { name: 'Sophia Rodriguez', email: 'sophia.rodriguez@enterprise.corp' },
  { name: 'Liam O\'Connor', email: 'liam.oconnor@enterprise.corp' },
  { name: 'Maya Patel', email: 'maya.patel@enterprise.corp' },
];

// 20 Asset Managers
const MANAGERS = [
  { name: 'David Kim', email: 'david.kim@enterprise.corp' },
  { name: 'Rachel Green', email: 'rachel.green@enterprise.corp' },
  { name: 'Vikram Malhotra', email: 'vikram.malhotra@enterprise.corp' },
  { name: 'Sarah Jenkins', email: 'sarah.jenkins@enterprise.corp' },
  { name: 'Carlos Mendez', email: 'carlos.mendez@enterprise.corp' },
  { name: 'Emily Watson', email: 'emily.watson@enterprise.corp' },
  { name: 'James Thornton', email: 'james.thornton@enterprise.corp' },
  { name: 'Priya Sharma', email: 'priya.sharma@enterprise.corp' },
  { name: 'Daniel Fischer', email: 'daniel.fischer@enterprise.corp' },
  { name: 'Olivia Dubois', email: 'olivia.dubois@enterprise.corp' },
  { name: 'Andrew Chen', email: 'andrew.chen@enterprise.corp' },
  { name: 'Jessica Taylor', email: 'jessica.taylor@enterprise.corp' },
  { name: 'Robert Martinez', email: 'robert.martinez@enterprise.corp' },
  { name: 'Hannah Schmidt', email: 'hannah.schmidt@enterprise.corp' },
  { name: 'Michael Chang', email: 'michael.chang@enterprise.corp' },
  { name: 'Lauren Bennett', email: 'lauren.bennett@enterprise.corp' },
  { name: 'Tariq Al-Mansoor', email: 'tariq.almansoor@enterprise.corp' },
  { name: 'Chloe Lefevre', email: 'chloe.lefevre@enterprise.corp' },
  { name: 'Kevin Nakamura', email: 'kevin.nakamura@enterprise.corp' },
  { name: 'Natalie Brooks', email: 'natalie.brooks@enterprise.corp' },
];

// 25 Technicians
const TECHNICIANS = [
  { name: 'Benjamin Scott', email: 'benjamin.scott@enterprise.corp' },
  { name: 'Lucas Miller', email: 'lucas.miller@enterprise.corp' },
  { name: 'Aarav Joshi', email: 'aarav.joshi@enterprise.corp' },
  { name: 'Tyler Reed', email: 'tyler.reed@enterprise.corp' },
  { name: 'Mateo Rossi', email: 'mateo.rossi@enterprise.corp' },
  { name: 'Nathan Drake', email: 'nathan.drake@enterprise.corp' },
  { name: 'Samuel Cooper', email: 'samuel.cooper@enterprise.corp' },
  { name: 'Rohan Verma', email: 'rohan.verma@enterprise.corp' },
  { name: 'Gabriel Silva', email: 'gabriel.silva@enterprise.corp' },
  { name: 'Ethan Hunt', email: 'ethan.hunt@enterprise.corp' },
  { name: 'Jordan Bell', email: 'jordan.bell@enterprise.corp' },
  { name: 'Zachary Young', email: 'zachary.young@enterprise.corp' },
  { name: 'Devendra Nair', email: 'devendra.nair@enterprise.corp' },
  { name: 'Sean Murphy', email: 'sean.murphy@enterprise.corp' },
  { name: 'Patrick Hayes', email: 'patrick.hayes@enterprise.corp' },
  { name: 'Julian King', email: 'julian.king@enterprise.corp' },
  { name: 'Dylan Foster', email: 'dylan.foster@enterprise.corp' },
  { name: 'Aditya Rao', email: 'aditya.rao@enterprise.corp' },
  { name: 'Christian Meyer', email: 'christian.meyer@enterprise.corp' },
  { name: 'Leo Tanaka', email: 'leo.tanaka@enterprise.corp' },
  { name: 'Isaac Newton', email: 'isaac.newton@enterprise.corp' },
  { name: 'Brandon Lee', email: 'brandon.lee@enterprise.corp' },
  { name: 'Derek Vance', email: 'derek.vance@enterprise.corp' },
  { name: 'Haruto Sato', email: 'haruto.sato@enterprise.corp' },
  { name: 'Felix Weber', email: 'felix.weber@enterprise.corp' },
];

// 100 Employees
const EMPLOYEES = [
  { name: 'Aaron Paulson', email: 'aaron.paulson@enterprise.corp' },
  { name: 'Abigail Wright', email: 'abigail.wright@enterprise.corp' },
  { name: 'Adam Sandler', email: 'adam.sandler@enterprise.corp' },
  { name: 'Adrian Brody', email: 'adrian.brody@enterprise.corp' },
  { name: 'Aileen Wu', email: 'aileen.wu@enterprise.corp' },
  { name: 'Aisha Khan', email: 'aisha.khan@enterprise.corp' },
  { name: 'Alan Turing', email: 'alan.turing@enterprise.corp' },
  { name: 'Albert Einstein', email: 'albert.einstein@enterprise.corp' },
  { name: 'Alina Popova', email: 'alina.popova@enterprise.corp' },
  { name: 'Amanda Seyfried', email: 'amanda.seyfried@enterprise.corp' },
  { name: 'Amber Heard', email: 'amber.heard@enterprise.corp' },
  { name: 'Amelia Earhart', email: 'amelia.earhart@enterprise.corp' },
  { name: 'Ananya Deshmukh', email: 'ananya.deshmukh@enterprise.corp' },
  { name: 'Anthony Hopkins', email: 'anthony.hopkins@enterprise.corp' },
  { name: 'Ariana Grande', email: 'ariana.grande@enterprise.corp' },
  { name: 'Arthur Conan', email: 'arthur.conan@enterprise.corp' },
  { name: 'Audrey Hepburn', email: 'audrey.hepburn@enterprise.corp' },
  { name: 'Austin Butler', email: 'austin.butler@enterprise.corp' },
  { name: 'Beatrice Webb', email: 'beatrice.webb@enterprise.corp' },
  { name: 'Bella Thorne', email: 'bella.thorne@enterprise.corp' },
  { name: 'Bradley Cooper', email: 'bradley.cooper@enterprise.corp' },
  { name: 'Brian Cox', email: 'brian.cox@enterprise.corp' },
  { name: 'Caitlyn Jenner', email: 'caitlyn.jenner@enterprise.corp' },
  { name: 'Cameron Diaz', email: 'cameron.diaz@enterprise.corp' },
  { name: 'Carl Sagan', email: 'carl.sagan@enterprise.corp' },
  { name: 'Catherine Zeta', email: 'catherine.zeta@enterprise.corp' },
  { name: 'Chadwick Boseman', email: 'chadwick.boseman@enterprise.corp' },
  { name: 'Charles Darwin', email: 'charles.darwin@enterprise.corp' },
  { name: 'Charlotte Bronte', email: 'charlotte.bronte@enterprise.corp' },
  { name: 'Christopher Nolan', email: 'christopher.nolan@enterprise.corp' },
  { name: 'Clara Barton', email: 'clara.barton@enterprise.corp' },
  { name: 'Colin Firth', email: 'colin.firth@enterprise.corp' },
  { name: 'Daisy Ridley', email: 'daisy.ridley@enterprise.corp' },
  { name: 'Damian Lewis', email: 'damian.lewis@enterprise.corp' },
  { name: 'Daniel Craig', email: 'daniel.craig@enterprise.corp' },
  { name: 'Daphne Blake', email: 'daphne.blake@enterprise.corp' },
  { name: 'Deepak Chopra', email: 'deepak.chopra@enterprise.corp' },
  { name: 'Denis Villeneuve', email: 'denis.villeneuve@enterprise.corp' },
  { name: 'Diana Prince', email: 'diana.prince@enterprise.corp' },
  { name: 'Dominic West', email: 'dominic.west@enterprise.corp' },
  { name: 'Dustin Hoffman', email: 'dustin.hoffman@enterprise.corp' },
  { name: 'Edward Norton', email: 'edward.norton@enterprise.corp' },
  { name: 'Elena Gilbert', email: 'elena.gilbert@enterprise.corp' },
  { name: 'Elizabeth Bennet', email: 'elizabeth.bennet@enterprise.corp' },
  { name: 'Elliot Page', email: 'elliot.page@enterprise.corp' },
  { name: 'Emilia Clarke', email: 'emilia.clarke@enterprise.corp' },
  { name: 'Eric Bana', email: 'eric.bana@enterprise.corp' },
  { name: 'Eva Green', email: 'eva.green@enterprise.corp' },
  { name: 'Fabian Delph', email: 'fabian.delph@enterprise.corp' },
  { name: 'Fiona Gallagher', email: 'fiona.gallagher@enterprise.corp' },
  { name: 'Florence Pugh', email: 'florence.pugh@enterprise.corp' },
  { name: 'Gemma Chan', email: 'gemma.chan@enterprise.corp' },
  { name: 'George Clooney', email: 'george.clooney@enterprise.corp' },
  { name: 'Grace Kelly', email: 'grace.kelly@enterprise.corp' },
  { name: 'Guy Pearce', email: 'guy.pearce@enterprise.corp' },
  { name: 'Hailee Steinfeld', email: 'hailee.steinfeld@enterprise.corp' },
  { name: 'Harry Styles', email: 'harry.styles@enterprise.corp' },
  { name: 'Harvey Specter', email: 'harvey.specter@enterprise.corp' },
  { name: 'Helen Mirren', email: 'helen.mirren@enterprise.corp' },
  { name: 'Henry Cavill', email: 'henry.cavill@enterprise.corp' },
  { name: 'Hugh Jackman', email: 'hugh.jackman@enterprise.corp' },
  { name: 'Ian McKellen', email: 'ian.mckellen@enterprise.corp' },
  { name: 'Iris West', email: 'iris.west@enterprise.corp' },
  { name: 'Jack Nicholson', email: 'jack.nicholson@enterprise.corp' },
  { name: 'Jacob Elordi', email: 'jacob.elordi@enterprise.corp' },
  { name: 'James McAvoy', email: 'james.mcavoy@enterprise.corp' },
  { name: 'Jane Austen', email: 'jane.austen@enterprise.corp' },
  { name: 'Jared Leto', email: 'jared.leto@enterprise.corp' },
  { name: 'Javier Bardem', email: 'javier.bardem@enterprise.corp' },
  { name: 'Jennifer Connelly', email: 'jennifer.connelly@enterprise.corp' },
  { name: 'Jeremy Renner', email: 'jeremy.renner@enterprise.corp' },
  { name: 'Jesse Eisenberg', email: 'jesse.eisenberg@enterprise.corp' },
  { name: 'Joaquin Phoenix', email: 'joaquin.phoenix@enterprise.corp' },
  { name: 'Jodie Foster', email: 'jodie.foster@enterprise.corp' },
  { name: 'John Krasinski', email: 'john.krasinski@enterprise.corp' },
  { name: 'Joseph Gordon', email: 'joseph.gordon@enterprise.corp' },
  { name: 'Jude Law', email: 'jude.law@enterprise.corp' },
  { name: 'Kate Winslet', email: 'kate.winslet@enterprise.corp' },
  { name: 'Keanu Reeves', email: 'keanu.reeves@enterprise.corp' },
  { name: 'Kieran Culkin', email: 'kieran.culkin@enterprise.corp' },
  { name: 'Kirsten Dunst', email: 'kirsten.dunst@enterprise.corp' },
  { name: 'Kit Harington', email: 'kit.harington@enterprise.corp' },
  { name: 'Kunal Nayyar', email: 'kunal.nayyar@enterprise.corp' },
  { name: 'Laura Dern', email: 'laura.dern@enterprise.corp' },
  { name: 'Leonardo DiCaprio', email: 'leonardo.dicaprio@enterprise.corp' },
  { name: 'Liam Neeson', email: 'liam.neeson@enterprise.corp' },
  { name: 'Lily Collins', email: 'lily.collins@enterprise.corp' },
  { name: 'Lucy Liu', email: 'lucy.liu@enterprise.corp' },
  { name: 'Luke Evans', email: 'luke.evans@enterprise.corp' },
  { name: 'Madelyn Cline', email: 'madelyn.cline@enterprise.corp' },
  { name: 'Maggie Smith', email: 'maggie.smith@enterprise.corp' },
  { name: 'Mahershala Ali', email: 'mahershala.ali@enterprise.corp' },
  { name: 'Margot Robbie', email: 'margot.robbie@enterprise.corp' },
  { name: 'Mark Ruffalo', email: 'mark.ruffalo@enterprise.corp' },
  { name: 'Matt Damon', email: 'matt.damon@enterprise.corp' },
  { name: 'Matthew McConaughey', email: 'matthew.mcconaughey@enterprise.corp' },
  { name: 'Mia Goth', email: 'mia.goth@enterprise.corp' },
  { name: 'Mila Kunis', email: 'mila.kunis@enterprise.corp' },
  { name: 'Naomi Watts', email: 'naomi.watts@enterprise.corp' },
  { name: 'Nicholas Hoult', email: 'nicholas.hoult@enterprise.corp' },
];

const STANDARD_DEPARTMENTS = [
  { name: 'Engineering', description: 'Software architecture, core systems, and infrastructure development' },
  { name: 'Information Technology', description: 'Internal workplace IT support, hardware fleet, and network administration' },
  { name: 'Product & Design', description: 'Product strategy, UX research, and UI design teams' },
  { name: 'Operations & Logistics', description: 'Business operations, supply chain, and facilities management' },
  { name: 'Sales & Marketing', description: 'Enterprise sales, account executives, and brand marketing' },
  { name: 'Finance & Accounting', description: 'Financial planning, accounting, and asset procurement' },
  { name: 'Human Resources', description: 'Talent acquisition, employee onboarding, and people operations' },
  { name: 'Customer Support', description: 'Customer success, client escalation, and service desk' },
];

async function seedUserProfiles() {
  console.log('Connecting to database:', maskUri(MONGO_URI));
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
  });
  const db = mongoose.connection.db;

  const usersCol = db.collection('users');
  const deptsCol = db.collection('departments');

  // 1. Ensure Standard Departments exist
  console.log('\n--- Ensuring Standard Corporate Departments ---');
  const departmentIds = [];
  for (const dept of STANDARD_DEPARTMENTS) {
    const existing = await deptsCol.findOne({ name: dept.name });
    if (existing) {
      departmentIds.push(existing._id);
    } else {
      const res = await deptsCol.insertOne({
        name: dept.name,
        description: dept.description,
        head: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      departmentIds.push(res.insertedId);
      console.log(`+ Created Department: ${dept.name}`);
    }
  }

  // Precompute single bcrypt hash for "Password123!" for maximum performance
  console.log('\nGenerating secure password hash for Password123! ...');
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

  let deptIndex = 0;
  const getNextDeptId = () => {
    const id = departmentIds[deptIndex % departmentIds.length];
    deptIndex++;
    return id;
  };

  // 2. Prepare user documents
  const allSpecs = [
    ...ADMINS.map(u => ({ ...u, role: 'ADMIN' })),
    ...MANAGERS.map(u => ({ ...u, role: 'ASSET_MANAGER' })),
    ...TECHNICIANS.map(u => ({ ...u, role: 'TECHNICIAN' })),
    ...EMPLOYEES.map(u => ({ ...u, role: 'EMPLOYEE' })),
  ];

  console.log(`\nPreparing ${allSpecs.length} users:`);
  console.log(`- Admins: ${ADMINS.length}`);
  console.log(`- Managers: ${MANAGERS.length}`);
  console.log(`- Technicians: ${TECHNICIANS.length}`);
  console.log(`- Employees: ${EMPLOYEES.length}`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const spec of allSpecs) {
    const existing = await usersCol.findOne({ email: spec.email });
    if (existing) {
      skippedCount++;
      continue;
    }

    const deptId = getNextDeptId();
    await usersCol.insertOne({
      name: spec.name,
      email: spec.email,
      passwordHash: defaultPasswordHash,
      role: spec.role,
      department: deptId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    createdCount++;
  }

  console.log(`\n========================================`);
  console.log(`Seeding Complete!`);
  console.log(`Successfully Created: ${createdCount} users`);
  console.log(`Skipped (Already Existed): ${skippedCount} users`);

  // Print summary of total users by role in DB
  const allUsers = await usersCol.find({}).toArray();
  const summaryByRole = {};
  for (const u of allUsers) {
    summaryByRole[u.role] = (summaryByRole[u.role] || 0) + 1;
  }
  console.log(`\nCurrent Database Users Count by Role:`);
  console.table(summaryByRole);
  console.log(`Total Users in System: ${allUsers.length}`);
  console.log(`Default Password for all seeded users: Password123!`);
  console.log(`========================================\n`);

  await mongoose.disconnect();
}

seedUserProfiles().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
