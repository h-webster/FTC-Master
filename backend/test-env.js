require('dotenv').config();

console.log('Testing environment variables...');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);
console.log('MONGODB_URI starts with:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'Not set');

// Test if it's a valid MongoDB URI format
if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI;
  if (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')) {
    console.log('✅ Valid MongoDB URI format');
  } else {
    console.log('❌ Invalid MongoDB URI format');
  }
} else {
  console.log('❌ MONGODB_URI not found in environment');
} 