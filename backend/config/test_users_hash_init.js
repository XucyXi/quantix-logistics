import bcrypt from 'bcrypt';

const password = "YOUR_PASSWORD_CHOICE_HERE";

(async () => {
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
})();

// This script is only meant to implement real password hashing to test users in our db_init (test users are also optional)