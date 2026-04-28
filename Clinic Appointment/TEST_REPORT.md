# 🏥 QueueCare - Technical Test Report

## 1. Project Overview
**Tech Stack**: Node.js, Express, SQLite (Sequelize), and JWT.
**Objective**: Build a secure clinic management system with role-based access and automated queue numbering.

## 2. QA & Test Summary
| Section | Content |
| :--- | :--- |
| **What I Built** | A RESTful API with distinct dashboards for Staff and Patients. |
| **What I Tested** | User registration, JWT login, and permission boundaries (403 errors). |
| **What I Automated** | API testing suite using Jest and Supertest for critical security paths. |
| **Bugs Found** | **EBUSY**: File lock on SQLite. **notNull**: Crash on empty doctor field. |
| **Improvements** | Add password hashing (Bcrypt) and UI testing (Playwright). |

## 3. Detailed Bug Fixes
* **EBUSY Lock**: I identified that the database file stayed "busy" during resets. I fixed this by ensuring all Sequelize connections close properly after tests run.
* **notNull Violation**: I found the system crashed if a doctor wasn't assigned. I updated the model to provide a default 'General Clinic' value to prevent database rejection.