const { getAuth } = require('firebase-admin/auth');
const admin = require('firebase-admin');
admin.initializeApp({
  projectId: "silent-matrix-cf6jr"
});
getAuth().createCustomToken("test-uid")
  .then(token => console.log("Success:", token.substring(0, 10)))
  .catch(err => console.error("Error:", err.message));
