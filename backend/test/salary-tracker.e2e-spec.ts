import * as dotenv from 'dotenv';
dotenv.config();
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { SupabaseService } from './../src/supabase/supabase.service';

describe('Salary Tracker User Journey (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let testUserId: string;
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test User';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    // Cleanup: We delete the user which cascades to delete all their records
    if (testUserId) {
      // In a real e2e we'd use the service role key to delete the user via admin API,
      // but here we can directly use the supabase client from app
      const supabaseService = app.get(SupabaseService);
      await supabaseService.getClient().from('users').delete().eq('id', testUserId);
    }
    await app.close();
  });

  it('1. POST /api/v1/auth/register - Register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: testName,
      })
      .expect(201);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('user');
    
    accessToken = response.body.access_token;
    testUserId = response.body.user.id;
  });

  it('2. GET /api/v1/auth/me - Verify user profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.email).toEqual(testEmail);
    expect(response.body.name).toEqual(testName);
  });

  it('3. POST /api/v1/salary-profile - Create Salary Profile', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/salary-profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        grossSalary: 50000,
        employmentType: 'regular',
        needsPercentage: 50.0,
        wantsPercentage: 30.0,
        savingsPercentage: 20.0,
        effectiveDate: new Date().toISOString(),
      })
      .expect(201);

    expect(response.body.gross_salary).toEqual(50000);
    expect(response.body.needs_percentage).toEqual(50);
  });

  it('4. POST /api/v1/expenses - Create a Needs expense', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/expenses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: 5000,
        category: 'Rent',
        allocationBucket: 'needs',
        description: 'Monthly Rent',
        expenseDate: new Date().toISOString(),
      })
      .expect(201);
  });

  it('5. POST /api/v1/expenses - Create a Wants expense', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/expenses')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: 1500,
        category: 'Dining',
        allocationBucket: 'wants',
        description: 'Dinner out',
        expenseDate: new Date().toISOString(),
      })
      .expect(201);
  });

  it('6. GET /api/v1/dashboard/summary - Fetch dashboard summary', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('grossSalary');
    expect(response.body).toHaveProperty('netSalary');
    expect(response.body).toHaveProperty('allocations');
    
    // Verify allocation deductions
    const allocations = response.body.allocations;
    
    expect(allocations.needs.spent).toEqual(5000);
    expect(allocations.wants.spent).toEqual(1500);
    expect(allocations.savings.spent).toEqual(0);
  });
});
