const runTestCases = require('./runTestCases');
const app = require('../modules/product'); 

describe('PRODUCT API ENDPOINTS', () => {

    const validProductId = '64a7c9f8e4b0a1b2c3d4e5f6'; 
    const nonExistentId = '64a7c9f8e4b0a1b2c3d4e999';
    const invalidFormatId = 'invalid-string-id';

    describe('POST /products', () => {
        const postCases = [
            {
                scenario: 'Successful Product Creation',
                payload: { name: 'Test Name', image: 'image.png' },
                expectedStatus: 201,
                expectedMessage: 'Product Created Successfully'
            },
            {
                scenario: 'Fail when required name field is missing',
                payload: { image: 'image.png' },
                expectedStatus: 400,
                expectedError: 'Name is required'
            },
            {
                scenario: 'Fail when empty payload is provided',
                payload: {},
                expectedStatus: 400,
                expectedError: 'Payload cannot be empty'
            }
        ];

        runTestCases(app, postCases, 'POST', '/products');
    });

    describe('GET /products', () => {
        const getListCases = [
            {
                scenario: 'Successfully fetch all products',
                payload: undefined,
                expectedStatus: 200,
                expectedMessage: 'Products retrieved successfully'
            }
        ];

        runTestCases(app, getListCases, 'GET', '/products');
    });

    describe('GET /products/:id', () => {
        const getDetailCases = [
            {
                scenario: 'Successfully retrieve existing product details',
                id: validProductId,
                expectedStatus: 200,
                expectedMessage: 'Product found'
            },
            {
                scenario: 'Fail when product ID does not exist',
                id: nonExistentId,
                expectedStatus: 404,
                expectedError: 'Product not found'
            },
            {
                scenario: 'Fail when product ID format is invalid',
                id: invalidFormatId,
                expectedStatus: 400,
                expectedError: 'Invalid ID format'
            }
        ];

        runTestCases(app, getDetailCases, 'GET', '/products');
    });

    describe('PATCH /products/:id', () => {
        const patchCases = [
            {
                scenario: 'Successfully update product name',
                id: validProductId,
                payload: { name: 'Updated Test Name' },
                expectedStatus: 200,
                expectedMessage: 'Product updated successfully'
            },
            {
                scenario: 'Fail when updating with invalid data type',
                id: validProductId,
                payload: { price: 'Free' },
                expectedStatus: 400,
                expectedError: 'Price must be a number'
            },
            {
                scenario: 'Fail when updating a non-existent product',
                id: nonExistentId,
                payload: { name: 'New Name' },
                expectedStatus: 404,
                expectedError: 'Product not found'
            }
        ];

        runTestCases(app, patchCases, 'PATCH', '/products');
    });

    describe('DELETE /products/:id', () => {
        const deleteCases = [
            {
                scenario: 'Successfully delete an existing product',
                id: validProductId,
                expectedStatus: 200,
                expectedMessage: 'Product deleted successfully'
            },
            {
                scenario: 'Fail when deleting a non-existent product',
                id: nonExistentId,
                expectedStatus: 404,
                expectedError: 'Product not found'
            },
            {
                scenario: 'Fail when deleting with an invalid ID format',
                id: invalidFormatId,
                expectedStatus: 400,
                expectedError: 'Invalid ID format'
            }
        ];

        runTestCases(app, deleteCases, 'DELETE', '/products');
    });
});