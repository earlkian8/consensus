const runTestCases = require('./runTestCases');
const app = require('../modules/auth'); 

describe('AUTHENTICATION API ENDPOINTS', () => {

    const validUser = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'SecurePassword123!'
    };

    const existingEmail = 'already.exists@example.com';

    describe('POST /auth/register', () => {
        const registerCases = [
            {
                scenario: 'Successfully register a new user',
                payload: validUser,
                expectedStatus: 201,
                expectedMessage: 'User registered successfully'
            },
            {
                scenario: 'Fail when required email is missing',
                payload: { name: 'Jane Doe', password: 'SecurePassword123!' },
                expectedStatus: 400,
                expectedError: 'Email is required'
            },
            {
                scenario: 'Fail when password is too weak',
                payload: { name: 'Jane Doe', email: 'test@example.com', password: '123' },
                expectedStatus: 400,
                expectedError: 'Password must be at least 8 characters'
            },
            {
                scenario: 'Fail when email is already registered',
                payload: { name: 'John Smith', email: existingEmail, password: 'SecurePassword123!' },
                expectedStatus: 409,
                expectedError: 'Email is already in use'
            }
        ];

        runTestCases(app, registerCases, 'POST', '/auth/register');
    });

    describe('POST /auth/login', () => {
        const loginCases = [
            {
                scenario: 'Successfully login with valid credentials',
                payload: { email: validUser.email, password: validUser.password },
                expectedStatus: 200,
                expectedMessage: 'Login successful'
            },
            {
                scenario: 'Fail when email is missing',
                payload: { password: validUser.password },
                expectedStatus: 400,
                expectedError: 'Email is required'
            },
            {
                scenario: 'Fail when password is missing',
                payload: { email: validUser.email },
                expectedStatus: 400,
                expectedError: 'Password is required'
            },
            {
                scenario: 'Fail with unregistered email',
                payload: { email: 'unknown@example.com', password: validUser.password },
                expectedStatus: 401,
                expectedError: 'Invalid email or password'
            },
            {
                scenario: 'Fail with incorrect password',
                payload: { email: validUser.email, password: 'WrongPassword!' },
                expectedStatus: 401,
                expectedError: 'Invalid email or password'
            }
        ];

        runTestCases(app, loginCases, 'POST', '/auth/login');
    });
});