import { PrismaClient } from '@prisma/client';
import { PrismaRestClient } from './PrismaRestClient';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const instance = new PrismaRestClient<PrismaClient>({
        apiUrl: "http://localhost:3100/api/prisma/v1",
        token: ""
    });

    const client = instance.useClient();

    // Get DOM elements
    const apiUrlInput = document.getElementById('apiUrl') as HTMLInputElement;
    const tokenInput = document.getElementById('token') as HTMLTextAreaElement;
    const modelInput = document.getElementById('model') as HTMLInputElement;
    const methodInput = document.getElementById('method') as HTMLInputElement;
    const payloadInput = document.getElementById('payload') as HTMLTextAreaElement;
    const resultDiv = document.getElementById('result') as HTMLDivElement;
    const testButton = document.querySelector('button') as HTMLButtonElement;

    // Set initial values
    apiUrlInput.value = "http://localhost:3100/api/prisma/v1";
    modelInput.value = "user";
    methodInput.value = "findMany";
    payloadInput.value = JSON.stringify({
        where: {},
        select: {
            id: true,
            email: true,
            name: true
        }
    }, null, 2);

    // Add loading state styles
    const loadingStyles = document.createElement('style');
    loadingStyles.textContent = `
        .loading {
            position: relative;
            pointer-events: none;
            opacity: 0.7;
        }
        .loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(loadingStyles);

    // Test query function
    async function testQuery() {
        try {
            // Show loading state
            testButton.classList.add('loading');
            resultDiv.textContent = 'Loading...';
            resultDiv.style.color = 'inherit';

            // Get input values
            const apiUrl = apiUrlInput.value;
            instance.setApiUrl(apiUrl);
            const token = tokenInput.value;
            const model = modelInput.value as keyof PrismaClient;
            const method = methodInput.value;
            const payload = payloadInput.value;

            // Update client configuration
            instance.setToken(token);

            // Execute the query
            const result = await (client[model] as any)[method](JSON.parse(payload));
            
            // Display results
            resultDiv.textContent = JSON.stringify(result, null, 2);
        } catch (error: unknown) {
            // Display error
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            resultDiv.textContent = `Error: ${errorMessage}`;
            resultDiv.style.color = 'red';
            console.error('Query error:', error);
        } finally {
            // Remove loading state
            testButton.classList.remove('loading');
        }
    }

    // Add event listeners
    testButton.addEventListener('click', testQuery);

    // Add input validation
    function validateJSON(input: HTMLTextAreaElement) {
        try {
            JSON.parse(input.value);
            input.style.borderColor = '';
        } catch (e) {
            input.style.borderColor = 'red';
        }
    }

    payloadInput.addEventListener('input', () => validateJSON(payloadInput));

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            testQuery();
        }
    });
});