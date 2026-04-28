# 🏥 QueueCare Submission

## 🚀 How to Run
1. `npm install`
2. Delete `clinic.sqlite` if it exists.
3. `npm start`
4. Visit `http://localhost:3000/register.html`

## 🧪 How to Test
Run `npm test` to trigger the Jest/Supertest automation suite.

## 🔑 Test Credentials (Use these after registering)
- **Staff**: `staff@test.com` / `password123`
- **Patient**: `patient@test.com` / `password123`

## 🐞 Bugs Found & Fixed
- **EBUSY**: Resolved by closing VS Code and manual deletion of locked DB.
- **notNull Violation**: Fixed the 'doctor' column by adding a default value in the API.