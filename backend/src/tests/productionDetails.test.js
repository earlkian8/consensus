const runTestCases = require('./runTestCases');
const app = require('../modules/productionDetail'); 

describe('PRODUCTION DETAIL API ENDPOINTS', () => {

    const validDetailId = '11111111-2222-3333-4444-555555555555'; 
    const nonExistentId = '99999999-8888-7777-6666-555555555555';
    const invalidFormatId = 'invalid-uuid-string';

    const validPlanFk = '550e8400-e29b-41d4-a716-446655440000';
    const validProductFk = '64a7c9f8-e4b0-a1b2-c3d4-e5f600000000';

    describe('POST /production-details', () => {
        const postCases = [
            {
                scenario: 'Successful detail creation with required fields',
                payload: { pp_fk: validPlanFk, p_fk: validProductFk, amount: 500.50 },
                expectedStatus: 201,
                expectedMessage: 'Production detail created successfully'
            },
            {
                scenario: 'Successful detail creation with optional excess field',
                payload: { pp_fk: validPlanFk, p_fk: validProductFk, amount: 500.50, excess: 12.25 },
                expectedStatus: 201,
                expectedMessage: 'Production detail created successfully'
            },
            {
                scenario: 'Fail when production plan foreign key is missing',
                payload: { p_fk: validProductFk, amount: 500.50 },
                expectedStatus: 400,
                expectedError: 'Production plan ID is required'
            },
            {
                scenario: 'Fail when product foreign key is missing',
                payload: { pp_fk: validPlanFk, amount: 500.50 },
                expectedStatus: 400,
                expectedError: 'Product ID is required'
            },
            {
                scenario: 'Fail when foreign key format is not a valid UUID',
                payload: { pp_fk: 'invalid-plan-id', p_fk: validProductFk, amount: 500.50 },
                expectedStatus: 400,
                expectedError: 'Invalid production plan UUID format'
            },
            {
                scenario: 'Fail when amount is not a number',
                payload: { pp_fk: validPlanFk, p_fk: validProductFk, amount: 'five hundred' },
                expectedStatus: 400,
                expectedError: 'Amount must be a number'
            }
        ];

        runTestCases(app, postCases, 'POST', '/production-details');
    });

    describe('GET /production-details', () => {
        const getListCases = [
            {
                scenario: 'Successfully fetch all production details',
                payload: undefined,
                expectedStatus: 200,
                expectedMessage: 'Production details retrieved successfully'
            }
        ];

        runTestCases(app, getListCases, 'GET', '/production-details');
    });

    describe('GET /production-details/:id', () => {
        const getDetailCases = [
            {
                scenario: 'Successfully retrieve existing detail record',
                id: validDetailId,
                expectedStatus: 200,
                expectedMessage: 'Production detail found'
            },
            {
                scenario: 'Fail when detail ID does not exist',
                id: nonExistentId,
                expectedStatus: 404,
                expectedError: 'Production detail not found'
            },
            {
                scenario: 'Fail when detail ID format is invalid',
                id: invalidFormatId,
                expectedStatus: 400,
                expectedError: 'Invalid UUID format'
            }
        ];

        runTestCases(app, getDetailCases, 'GET', '/production-details');
    });

    describe('PATCH /production-details/:id', () => {
        const patchCases = [
            {
                scenario: 'Successfully update amount and excess',
                id: validDetailId,
                payload: { amount: 600.00, excess: 15.00 },
                expectedStatus: 200,
                expectedMessage: 'Production detail updated successfully'
            },
            {
                scenario: 'Fail when updating with invalid numeric data',
                id: validDetailId,
                payload: { excess: 'none' },
                expectedStatus: 400,
                expectedError: 'Excess must be a number'
            },
            {
                scenario: 'Fail when updating a non-existent detail record',
                id: nonExistentId,
                payload: { amount: 600.00 },
                expectedStatus: 404,
                expectedError: 'Production detail not found'
            }
        ];

        runTestCases(app, patchCases, 'PATCH', '/production-details');
    });

    describe('DELETE /production-details/:id', () => {
        const deleteCases = [
            {
                scenario: 'Successfully delete an existing detail record',
                id: validDetailId,
                expectedStatus: 200,
                expectedMessage: 'Production detail deleted successfully'
            },
            {
                scenario: 'Fail when deleting a non-existent detail record',
                id: nonExistentId,
                expectedStatus: 404,
                expectedError: 'Production detail not found'
            },
            {
                scenario: 'Fail when deleting with an invalid UUID format',
                id: invalidFormatId,
                expectedStatus: 400,
                expectedError: 'Invalid UUID format'
            }
        ];

        runTestCases(app, deleteCases, 'DELETE', '/production-details');
    });
});