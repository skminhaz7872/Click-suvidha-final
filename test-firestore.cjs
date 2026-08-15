const admin = require('firebase-admin');
admin.initializeApp({ projectId: "silent-matrix-cf6jr" });
const db = admin.firestore();
db.collection('settings').limit(1).get()
  .then(snap => console.log("Success! Docs:", snap.size))
  .catch(err => console.error("Error:", err.message));
