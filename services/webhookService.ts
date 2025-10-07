import { CompanyFormData, EmployeeFormData, FormType } from '../types';

// =================================================================================
// IMPORTANT: CONFIGURE YOUR WEBHOOK DETAILS HERE
// =================================================================================
// 1. Replace 'YOUR_WEBHOOK_URL_HERE' with your actual webhook URL.
//    If you don't have a webhook, you can leave this as is. 
//    Form submissions will be simulated and logged to the browser console.
const WEBHOOK_URL_CONFIG = 'YOUR_WEBHOOK_URL_HERE'; 

// 2. Replace 'YOUR_WEBHOOK_AUTH_TOKEN_HERE' with your auth token if your webhook
//    requires one. If not, you can leave it as is or set it to an empty string ('').
const WEBHOOK_AUTH_CONFIG = 'YOUR_WEBHOOK_AUTH_TOKEN_HERE';
// =================================================================================
// Do not edit below this line
// =================================================================================

const WEBHOOK_URL = WEBHOOK_URL_CONFIG !== 'YOUR_WEBHOOK_URL_HERE' ? WEBHOOK_URL_CONFIG : undefined;
const WEBHOOK_AUTH = WEBHOOK_AUTH_CONFIG !== 'YOUR_WEBHOOK_AUTH_TOKEN_HERE' ? WEBHOOK_AUTH_CONFIG : undefined;


if (!WEBHOOK_URL) {
  console.warn("Webhook URL is not configured in services/webhookService.ts. Form submissions will be simulated in the console.");
}

export const submitForm = async (
  type: FormType,
  data: CompanyFormData | EmployeeFormData
): Promise<{ success: boolean; message: string }> => {
  console.log('=== WEBHOOK SUBMISSION START ===');
  console.log('Form Type:', type);
  console.log('WEBHOOK_URL configured:', WEBHOOK_URL ? 'Yes' : 'No');
  console.log('WEBHOOK_URL value:', WEBHOOK_URL);
  console.log('WEBHOOK_AUTH configured:', WEBHOOK_AUTH ? 'Yes' : 'No');

  if (!WEBHOOK_URL) {
    console.log('No WEBHOOK_URL found, simulating submission');
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('Simulated submission data:', { type, data });
            resolve({ success: true, message: 'Submission successful (simulated)!' });
        }, 1000);
    });
  }

  try {
    let response;
    const hasResume = type === FormType.Employee && (data as EmployeeFormData).resume;
    
    if (hasResume) {
      console.log('Preparing multipart/form-data request with resume');
      
      const employeeData = data as EmployeeFormData;
      const file = employeeData.resume;
      
      if (!file) {
        throw new Error('Resume file is required');
      }
      
      console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      
      const formData = new FormData();
      // It's good practice to send all data, including the 'type', in the form data
      // so the server can easily parse it.
      formData.append('type', type);
      formData.append('fullName', employeeData.fullName);
      formData.append('email', employeeData.email);
      formData.append('phone', employeeData.phone);
      formData.append('skillLevel', employeeData.skillLevel);
      formData.append('resume', file, file.name);

      const headers: HeadersInit = {};
      if (WEBHOOK_AUTH) {
        headers['key'] = WEBHOOK_AUTH;
        console.log('Added auth header "key"');
      }

      console.log('Sending multipart/form-data POST request to:', WEBHOOK_URL);
      console.log('Request headers:', Object.keys(headers));
      console.log('FormData keys:', Array.from(formData.keys()));

      // When using FormData with fetch, DO NOT set the 'Content-Type' header.
      // The browser will automatically set it to 'multipart/form-data' with the correct boundary.
      response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: formData,
        mode: 'cors',
      });

    } else {
      console.log('Preparing application/json request');
      
      const payload = {
        type,
        data,
      };
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (WEBHOOK_AUTH) {
        headers['key'] = WEBHOOK_AUTH;
        console.log('Added auth header "key"');
      }
      
      console.log('Sending JSON POST request to:', WEBHOOK_URL);
      console.log('Request headers:', Object.keys(headers));
      console.log('Payload:', JSON.stringify(payload, null, 2));

      response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        mode: 'cors',
      });
    }

    console.log('Response received - Status:', response.status, response.statusText);
    console.log('Response OK:', response.ok);

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorBody = await response.json();
        errorDetail = errorBody.message || errorBody.error || JSON.stringify(errorBody);
      } catch (e) {
        try {
          errorDetail = await response.text();
        } catch (textErr) {
          errorDetail = 'Could not read error response body.';
        }
      }

      console.error(`❌ Webhook submission failed`);
      console.error(`Status: ${response.status}`);
      console.error(`Details: ${errorDetail}`);

      let userFriendlyMessage;
      switch (response.status) {
        case 400:
          userFriendlyMessage = 'There was a problem with your submission. Please double-check the form.';
          break;
        case 401:
        case 403:
          userFriendlyMessage = 'Authentication failed. Please verify your credentials.';
          break;
        case 404:
          userFriendlyMessage = 'The submission service could not be found. Please contact support.';
          break;
        case 429:
          userFriendlyMessage = 'You are submitting too frequently. Please wait a moment and try again.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          userFriendlyMessage = 'The server is currently unavailable. We are working on it, please try again later.';
          break;
        default:
          userFriendlyMessage = `An unexpected error occurred (Status: ${response.status}). Please try again.`;
      }
      
      throw new Error(userFriendlyMessage);
    }

    // Try to read response body
    let responseData;
    try {
      responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.log('No JSON response body (this is okay)');
    }

    console.log('✅ Submission successful!');
    console.log('=== WEBHOOK SUBMISSION END ===');
    
    return { success: true, message: 'Submission successful!' };

  } catch (error: unknown) {
    console.error('❌ Webhook submission error:', error);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error: This could be due to:');
      console.error('1. CORS issue: The server at the configured WEBHOOK_URL is not configured to accept requests from this origin. Check the browser console for specific CORS error messages.');
      console.error('2. Network connectivity issue: The server is down or unreachable.');
      console.error('3. Mixed content: The app is on HTTPS but the webhook is on HTTP.');
      
      return { 
        success: false, 
        message: 'Network error: Unable to reach server. This is often a CORS issue. Please check the browser\'s developer console for more details.' 
      };
    }
    
    console.error('Error details:', error instanceof Error ? error.stack : 'Unknown error');
    console.log('=== WEBHOOK SUBMISSION END (WITH ERROR) ===');
    
    if (error instanceof Error) {
        return { success: false, message: `Submission failed: ${error.message}` };
    }
    return { success: false, message: 'An unknown error occurred during submission.' };
  }
};