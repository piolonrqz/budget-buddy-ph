const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function resetPassword() {
  const targetEmail = 'piolofrances.enriquez@gmail.com';
  const newPassword = 'Password123!';

  try {
    await client.connect();

    // Generate a new bcrypt hash
    const salt = await bcrypt.genSalt();
    const newHash = await bcrypt.hash(newPassword, salt);

    // Update the database
    const result = await client.query(
      'UPDATE users SET passwordhash = $1 WHERE email = $2',
      [newHash, targetEmail]
    );

    if (result.rowCount === 0) {
      console.log(`User with email ${targetEmail} not found.`);
    } else {
      console.log(`✅ Password successfully reset for ${targetEmail}`);
      console.log(`New password is: ${newPassword}`);
    }
  } catch (error) {
    console.error('Failed to reset password:', error);
  } finally {
    await client.end();
  }
}

resetPassword();
