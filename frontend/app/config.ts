const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  isProduction: process.env.NODE_ENV === 'production'
};

export default config;
