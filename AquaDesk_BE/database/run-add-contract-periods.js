require('dotenv').config();
const { executeNonQuery, executeQuery, executeScalar } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Adding Contract Periods table...\n');

    const sqlPath = path.join(__dirname, 'add-contract-periods.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await executeNonQuery(sql);
    console.log('Contract Periods table created successfully');

    // Seed some default contract periods
    const periods = [
      { PeriodCode: '1YR', PeriodName: '1 Year', Description: 'Annual contract', DurationMonths: 12 },
      { PeriodCode: '2YR', PeriodName: '2 Years', Description: 'Two year contract', DurationMonths: 24 },
      { PeriodCode: '3YR', PeriodName: '3 Years', Description: 'Three year contract', DurationMonths: 36 },
      { PeriodCode: '6MO', PeriodName: '6 Months', Description: 'Half yearly contract', DurationMonths: 6 },
      { PeriodCode: '3MO', PeriodName: '3 Months', Description: 'Quarterly contract', DurationMonths: 3 },
      { PeriodCode: '1MO', PeriodName: '1 Month', Description: 'Monthly contract', DurationMonths: 1 }
    ];

    for (const period of periods) {
      const exists = await executeScalar(
        'SELECT 1 FROM ContractPeriods WHERE PeriodCode = @PeriodCode',
        { PeriodCode: period.PeriodCode }
      );
      
      if (!exists) {
        await executeNonQuery(
          `INSERT INTO ContractPeriods (PeriodCode, PeriodName, Description, DurationMonths, CompanyID, Status)
           VALUES (@PeriodCode, @PeriodName, @Description, @DurationMonths, 1, 1)`,
          period
        );
        console.log(`Seeded: ${period.PeriodCode} - ${period.PeriodName}`);
      }
    }

    // Verify
    const allPeriods = await executeQuery('SELECT * FROM ContractPeriods');
    console.log('\nContract Periods:');
    allPeriods.forEach(p => {
      console.log(`  ${p.PeriodCode}: ${p.PeriodName} (${p.DurationMonths} months)`);
    });

    console.log('\nMigration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
