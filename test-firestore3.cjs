const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
admin.initializeApp({ projectId: "silent-matrix-cf6jr" });
const db = getFirestore(undefined, "ai-studio-47f12e39-6222-428e-a428-2382bcea285f");
db.collection('settings').limit(1).get()
  .then(snap => console.log("Success! Docs:", snap.size))
  .catch(err => console.error("Error:", err.message));
