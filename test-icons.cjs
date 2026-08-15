const lucide = require('lucide-react');
const icons = [
  'X', 'Calendar', 'Phone', 'Mail', 'User', 'Wallet', 'Activity', 'CreditCard', 'Smartphone',
  'Menu', 'Search', 'Bell', 'LogOut',
  'Plus', 'Server', 'Power', 'Edit', 'Trash2', 'Check',
  'PlusCircle', 'MinusCircle',
  'Tv', 'Zap', 'Clock',
  'MapPin', 'Shield',
  'ArrowLeft', 'CheckCircle',
  'Droplet', 'Wifi', 'FileText', 'ChevronRight', 'AlertCircle',
  'WalletIcon', 'ArrowDownLeft',
  'Save', 'Palette', 'Type',
  'XCircle',
  'MoreVertical', 'Eye', 'Ban', 'Unlock',
  'Construction',
  'Users', 'TrendingUp', 'ArrowRight', 'History',
  'Image'
];

for (const icon of icons) {
  if (!lucide[icon]) {
    console.log('MISSING ICON:', icon);
  }
}
