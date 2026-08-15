const fs = require('fs');

let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const newGoogleLogin = `
  const handleGoogleLogin = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // First, try to find an existing user document by email
      const q = query(collection(db, 'users'), where('email', '==', user.email));
      const snapshot = await getDocs(q);
      
      let userRole = 'Retailer';
      let userDocRef = doc(db, 'users', user.uid);
      
      if (!snapshot.empty) {
        // Admin already created a member with this email!
        const existingDoc = snapshot.docs[0];
        userRole = existingDoc.data().role || 'Retailer';
        
        if (existingDoc.id !== user.uid) {
           // We need to migrate the old random ID document to the Google UID document
           // So the user owns it going forward
           const data = existingDoc.data();
           
           // Create the new document with the correct UID
           await setDoc(userDocRef, {
             ...data,
             uid: user.uid
           });
           
           // Delete the old document (Requires Admin or open delete rules? We don't have delete rules! Let's just update the old one or leave it.)
           // Actually, the easiest way is to let the user login. We will use their UID document from now on.
        } else {
           // It's already the correct UID
        }
      } else {
        // Check if the document exists by UID (in case email changed or wasn't found)
        const uidDoc = await getDoc(userDocRef);
        if (uidDoc.exists()) {
           userRole = uidDoc.data().role || 'Retailer';
        } else {
           // Completely new user!
           userRole = user.email === 'skminhaz7872@gmail.com' ? 'Admin' : 'Retailer';
           await setDoc(userDocRef, {
             email: user.email,
             role: userRole,
             fullName: user.displayName || 'User',
             balance: 0,
             status: 'Active',
             createdAt: new Date().toISOString()
           });
        }
      }
      
      localStorage.setItem('token', await user.getIdToken());
      onLogin(userRole);
      navigate(userRole === 'Retailer' ? '/retailer' : '/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed.');
    }
  };
`;

content = content.replace(/const handleGoogleLogin = async \(\) => \{[\s\S]*?\}\s*catch[^\}]*\}[^\}]*\};/, newGoogleLogin.trim());
fs.writeFileSync('src/pages/Login.tsx', content);
