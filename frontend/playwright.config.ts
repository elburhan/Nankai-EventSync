import { defineConfig, devices } from '@playwright/test';

const e2eMongoDbUri = process.env.E2E_MONGODB_URI;

if (!e2eMongoDbUri) {
  throw new Error(
    'Missing E2E_MONGODB_URI. Set a dedicated test MongoDB connection string before running Playwright.',
  );
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5175',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd ../backend && npm run dev',
      url: 'http://localhost:5001/api/health',
      timeout: 90_000,
      reuseExistingServer: false,
      env: {
        NODE_ENV: 'development',
        PORT: '5001',
        MONGODB_URI: e2eMongoDbUri,
        JWT_SECRET: 'e2e-secret-key-1234567890abcdef01',
        FRONTEND_ORIGIN: 'http://localhost:5175',
        SMTP_HOST: '',
        SMTP_USER: '',
        SMTP_PASS: '',
        GROQ_API_KEY: '',
      },
    },
    {
      command: 'npm run dev -- --port 5175',
      url: 'http://localhost:5175',
      reuseExistingServer: false,
      env: {
        VITE_PORT: '5175',
        VITE_API_BASE_URL: 'http://localhost:5001/api',
        VITE_SOCKET_URL: 'http://localhost:5001'
      }
    }
  ],
});
