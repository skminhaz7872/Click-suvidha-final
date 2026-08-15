import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

// Mock Database Data
const db = {
  admins: [{ id: 1, name: 'Admin', email: 'skminhaz7872@gmail.com', password: 'Star@7872' }],
  members: [
    { id: 1, fullName: 'John Doe', mobileNumber: '9876543210', email: 'john@example.com', username: 'johndoe', role: 'Retailer', status: 'Active', balance: 5000, joinDate: new Date().toISOString() },
    { id: 2, fullName: 'Jane Smith', mobileNumber: '8765432109', email: 'jane@example.com', username: 'janesmith', role: 'Distributor', status: 'Active', balance: 12000, joinDate: new Date().toISOString() }
  ],
  transactions: [
    { id: 1, memberId: 1, type: 'Credit', amount: 5000, closingBalance: 5000, remark: 'Initial Deposit', date: new Date().toISOString() }
  ],
  recharges: [
    { id: 1, txId: 'TXN123456', memberId: 1, mobile: '9876543210', operator: 'Airtel', amount: 299, status: 'Success', date: new Date().toISOString() },
    { id: 2, txId: 'TXN123457', memberId: 2, mobile: '8765432109', operator: 'Jio', amount: 666, status: 'Failed', date: new Date().toISOString() }
  ],
  fundRequests: [
    { id: 1, memberId: 1, amount: 10000, mode: 'UPI', ref: 'UPI98765', status: 'Pending', date: new Date().toISOString() }
  ]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // Dashboard Stats
  app.get('/api/stats', (req, res) => {
    const stats = {
      totalSuccess: db.recharges.filter(r => r.status === 'Success').length,
      totalFailed: db.recharges.filter(r => r.status === 'Failed').length,
      pendingFundRequests: db.fundRequests.filter(r => r.status === 'Pending').length,
      totalRechargeAmount: db.recharges.filter(r => r.status === 'Success').reduce((sum, r) => sum + r.amount, 0),
      totalMembers: db.members.length,
      walletBalance: db.members.reduce((sum, m) => sum + m.balance, 0),
    };
    res.json(stats);
  });

  // Members
  app.get('/api/members', (req, res) => {
    res.json(db.members);
  });

  app.post('/api/members', (req, res) => {
    const newMember = {
      id: db.members.length + 1,
      ...req.body,
      balance: parseFloat(req.body.openingBalance || '0'),
      joinDate: new Date().toISOString()
    };
    db.members.push(newMember);
    res.json({ success: true, member: newMember });
  });

  app.put('/api/members/:id/block', (req, res) => {
    const id = parseInt(req.params.id);
    const member = db.members.find(m => m.id === id);
    if (member) {
      member.status = member.status === 'Blocked' ? 'Active' : 'Blocked';
      res.json({ success: true, member });
    } else {
      res.status(404).json({ success: false, message: 'Member not found' });
    }
  });

  // Wallet
  app.post('/api/wallet/credit', (req, res) => {
    const { memberId, amount, remark } = req.body;
    const member = db.members.find(m => m.id === parseInt(memberId));
    if (member) {
      member.balance += parseFloat(amount);
      db.transactions.push({
        id: db.transactions.length + 1,
        memberId: member.id,
        type: 'Credit',
        amount: parseFloat(amount),
        closingBalance: member.balance,
        remark,
        date: new Date().toISOString()
      });
      res.json({ success: true, message: 'Wallet credited successfully', balance: member.balance });
    } else {
      res.status(404).json({ success: false, message: 'Member not found' });
    }
  });

  // Recharges
  app.get('/api/recharges', (req, res) => {
    // Join with member info
    const enriched = db.recharges.map(r => {
      const member = db.members.find(m => m.id === r.memberId);
      return { ...r, memberName: member?.fullName || 'Unknown' };
    });
    res.json(enriched);
  });

  app.post('/api/recharge', (req, res) => {
    const { memberId, mobileNumber, operator, amount } = req.body;
    const member = db.members.find(m => m.id === parseInt(memberId));
    
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (member.balance < parseFloat(amount)) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Deduct balance
    member.balance -= parseFloat(amount);
    
    // Create transaction
    const tx = {
      id: db.recharges.length + 1,
      txId: 'TXN' + Math.floor(Math.random() * 1000000000),
      memberId: member.id,
      mobile: mobileNumber,
      operator,
      amount: parseFloat(amount),
      status: 'Success', // Mock success
      date: new Date().toISOString()
    };
    db.recharges.push(tx);

    res.json({ success: true, message: 'Recharge successful', transaction: tx });
  });

  // Fund Requests
  app.get('/api/fund-requests', (req, res) => {
    const enriched = db.fundRequests.map(r => {
      const member = db.members.find(m => m.id === r.memberId);
      return { ...r, memberName: member?.fullName || 'Unknown' };
    });
    res.json(enriched);
  });

  // API Routes Mock Storage
  let apiRoutesStorage = [
    { id: 1, apiName: 'Lapu Demo API', apiUrl: 'https://demo.lapu.com/api', apiKey: 'lapu123', rechargeType: 'Mobile', priority: '1', successResponse: 'SUCCESS', failedResponse: 'FAILED', pendingResponse: 'PENDING', balanceCheckUrl: '', status: 'Active' }
  ];

  app.get('/api/routes', (req, res) => {
    res.json(apiRoutesStorage);
  });

  app.post('/api/routes', (req, res) => {
    const newRoute = { id: Date.now(), ...req.body };
    apiRoutesStorage.push(newRoute);
    res.json({ success: true, route: newRoute });
  });

  app.put('/api/routes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const route = apiRoutesStorage.find(r => r.id === id);
    if (route) {
      route.status = req.body.status;
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false });
    }
  });

  // Banners Storage
  let bannersStorage = [
    { id: 1, imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000' }
  ];

  app.get('/api/banners', (req, res) => {
    res.json(bannersStorage);
  });

  app.post('/api/banners', (req, res) => {
    const newBanner = { id: Date.now(), imageUrl: req.body.imageUrl };
    bannersStorage.push(newBanner);
    res.json({ success: true, banner: newBanner });
  });

  app.delete('/api/banners/:id', (req, res) => {
    const id = parseInt(req.params.id);
    bannersStorage = bannersStorage.filter(b => b.id !== id);
    res.json({ success: true });
  });

  // Settings Storage
  let appSettings = {
    companyName: 'CLICK SUVIDHA',
    sidebarColor: '#0f172a',
    headerColor: '#ffffff',
    primaryButtonColor: '#2563eb',
    logoUrl: ''
  };

  app.get('/api/settings', (req, res) => {
    res.json(appSettings);
  });

  app.post('/api/settings', (req, res) => {
    appSettings = { ...appSettings, ...req.body };
    res.json({ success: true, settings: appSettings });
  });

  // Retailer State
  let retailerWalletBalance = 5200;
  let retailerTransactions = [
    { id: 1, date: new Date().toISOString(), type: 'Prepaid', number: '9876543210', operator: 'Jio', amount: 299, status: 'Success' },
    { id: 2, date: new Date(Date.now() - 86400000).toISOString(), type: 'DTH', number: '3024567890', operator: 'Airtel DTH', amount: 500, status: 'Success' }
  ];

  app.get('/api/retailer/balance', (req, res) => {
    res.json({ balance: retailerWalletBalance });
  });

  app.get('/api/retailer/transactions', (req, res) => {
    res.json(retailerTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  });

  app.post('/api/retailer/recharge', (req, res) => {
    const { type, number, operator, amount } = req.body;
    
    if (!number || !operator || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid recharge details' });
    }

    if (retailerWalletBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    // Process recharge (Mock)
    retailerWalletBalance -= amount;
    
    const newTx = {
      id: Date.now(),
      date: new Date().toISOString(),
      type,
      number,
      operator,
      amount,
      status: 'Success'
    };
    
    retailerTransactions.push(newTx);
    
    res.json({ success: true, message: 'Recharge successful', transaction: newTx, newBalance: retailerWalletBalance });
  });

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { loginId, email, password, role } = req.body;
    const identifier = loginId || email;
    
    if (role === 'Retailer' || identifier === '9876543210' || identifier === 'retailer@admin.com') {
      res.json({ success: true, user: { name: 'Retailer', email: 'retailer@admin.com', phone: '9876543210', role: 'Retailer', walletBalance: retailerWalletBalance }, token: 'mock-retailer-jwt-token' });
      return;
    }

    const admin = db.admins.find(a => a.email === identifier);
    
    // For demo purposes, we accept the default breached password or the new strong one, 
    // or just bypass it for the demo if it's the admin email.
    if (admin && (password === admin.password || password === 'password' || identifier === 'skminhaz7872@gmail.com')) {
      res.json({ success: true, user: { name: admin.name, email: admin.email, role: 'Admin' }, token: 'mock-admin-jwt-token' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });


  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
