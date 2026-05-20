const request = require('supertest');

const runTestCases = (app, cases, method, baseRoute) => {
    test.each(cases)('$scenario', async ({ id, payload, expectedStatus, expectedMessage, expectedError }) => {
        const route = id ? `${baseRoute}/${id}` : baseRoute;
        const apiRequest = request(app)[method.toLowerCase()](route);
        
        if (payload) {
            apiRequest.send(payload);
        }
        
        const response = await apiRequest;

        expect(response.status).toBe(expectedStatus);

        if (expectedMessage) {
            expect(response.body.message).toBe(expectedMessage);
        }

        if (expectedError) {
            expect(response.body.error).toBe(expectedError);
        }
    });
};

module.exports = runTestCases

/* 
    For test cases, we need the following:

    cases = array of objects containing the following:
        1. id (optional, for PATCH, PUT, DELETE, GET DETAILS)
        2. scenario = descriptive scenario for testing
        3. payload = payload.
        4. expected status = 201 or 400
        5. expected message = Message for successful request
        6. expected error = Message for unsuccessful request 

    method: GET, POST, PUT, PATCH, DELETE
    baseRoute: API url
*/