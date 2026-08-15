const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');
content = content.replace(/const handleLogin = async \(e: React.FormEvent\) => \{ e\.preventDefault\(\); const cleanLoginId = loginId\.trim\(\);/, 'const handleLogin = async (e: React.FormEvent) => {');
content = content.replace(/const handleLogin = async \(e: React.FormEvent\) => \{/g, 'const handleLogin = async (e: React.FormEvent) => {\n    const currentLoginId = loginId.trim();');
content = content.replace(/loginId/g, 'currentLoginId');
// But wait, there are places where loginId is used correctly like setLoginId(currentLoginId)!
// So replacing globally is bad.
