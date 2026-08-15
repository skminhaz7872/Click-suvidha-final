import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  console.log("Checking users...");
  const users = await getDocs(collection(db, 'users'));
  console.log(`Found ${users.size} users.`);
  users.forEach(doc => console.log(doc.id, doc.data().fullName, doc.data().email, doc.data().role));

  console.log("Checking transactions...");
  const tx = await getDocs(collection(db, 'transactions'));
  console.log(`Found ${tx.size} transactions.`);
}
check().catch(console.error).then(() => process.exit(0));
