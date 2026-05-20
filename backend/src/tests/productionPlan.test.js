const runTestCases = require('./runTestCases');
const app = require('../modules/productionPlan'); 

describe('PRODUCTION PLAN API ENDPOINTS', () => {

    const validPlanId = '550e8400-e29b-41d4-a716-446655440000'; 
    const nonExistentId = '550e8400-e29b-41d4-a716-446655449999';
    const invalidFormatId = 'not-a-valid-uuid';

    describe('POST /production-plans', () => {
        const postCases = [
            {
                scenario: 'Successful Plan Creation with required date',
                payload: { date: '2026-05-21' },
                expectedStatus: 201,
                expectedMessage: 'Production plan created successfully'
            },
            {
                scenario: 'Successful Plan Creation with explicit analysis flag',
                payload: { date: '2026-05-22', is_ready_analysis: true },
                expectedStatus: 201,
                expectedMessage: 'Production plan created successfully'
            },
            {
                scenario: 'Fail when required date field is missing',
                payload: { is_ready_analysis: true },
                expectedStatus: 400,
                expectedError: 'Date is required'
            },
            {
                scenario: 'Fail when date format is invalid',
                payload: { date: 'May 21st 2026' },
                expectedStatus: 400,
                expectedError: 'Invalid date format'
            }
        ];

        runTestCases(app, postCases, 'POST', '/production-plans');
    });

    describe('GET /production-plans', () => {
        const getListCases = [
            {
                scenario: 'Successfully fetch all production plans',
                payload: undefined,
                expectedStatus: 200,
                expectedMessage: 'Production plans retrieved successfully'
            }
        ];

        runTestCases(app, getListCases, 'GET', '/production-plans');
    });

    describe('GET /production-plans/:id', () => {
        const getDetailCases = [
            {
                scenario: 'Successfully retrieve existing plan details',
                id: validPlanId,
                expectedStatus: 200,
                expectedMessage: 'Production plan found'
            },
            {
                scenario: 'Fail when plan ID does not exist',
                id: nonExistentId,
                expectedStatus: 404,
                expectedError: 'Production plan not found'
            },
            {
                scenario: 'Fail when plan ID format is not a valid UUID',
                id: invalidFormatId,
                expectedStatus: 400,
                expectedError: 'Invalid UUID format'
            }
        ];

        runTestCases(app, getDetailCases, 'GET', '/production-plans');
    });

    describe('PATCH /production-plans/:id', () => {
        const patchCases = [
            {
                scenario: 'Successfully update analysis readiness flag',
                id: validPlanId,
                payload: { is_ready_analysis: true },
                expectedStatus: 200,
                expectedMessage: 'Production plan updated successfully'
            },
            {
                scenario: 'Fail when updating with invalid boolean data',
                id: validPlanId,
                payload: { is_ready_analysis: 'yes' },
                expectedStatus: 400,
                expectedError: 'is_ready_analysis must be a boolean'
            },
            {
                scenario: 'Fail when updating a non-existent plan',
                id: nonExistentId,
                payload: { date: '2026-06-01' },
                expectedStatus: 404,
                expectedError: 'Production plan not found'
            }
        ];

        runTestCases(app, patchCases, 'PATCH', '/production-plans');
    });

    describe('DELETE /production-plans/:id', () => {
        const deleteCases = [
            {
                scenario: 'Successfully delete an existing plan',
                id: validPlanId,
                expectedStatus: 200,
                expectedMessage: 'Production plan deleted successfully'
            },
            {
                scenario: 'Fail when deleting a non-existent plan',
                id: nonExistentId,
                expectedStatus: 404,
                expectedError: 'Production plan not found'
            },
            {
                scenario: 'Fail when deleting with an invalid UUID format',
                id: invalidFormatId,
                expectedStatus: 400,
                expectedError: 'Invalid UUID format'
            }
        ];

        runTestCases(app, deleteCases, 'DELETE', '/production-plans');
    });
});