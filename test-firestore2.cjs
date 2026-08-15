const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
admin.initializeApp({ projectId: "silent-matrix-cf6jr" });
const db = getFirestore();
db.collection('settings').limit(1).get()
  .then(snap => console.log("Success! Docs:", snap.size))
  .catch(err => console.error("Error:", err.message));
