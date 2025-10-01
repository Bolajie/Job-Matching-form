import { CompanyFormData, EmployeeFormData, FormType } from '../types';

// Vite exposes env vars that start with VITE_ to the browser
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;
const WEBHOOK_AUTH = import.meta.env.VITE_WEBHOOK_AUTH;

if (!WEBHOOK_URL) {
  console.warn("Missing VITE_WEBHOOK_URL environment variable. Form submissions will be logged to the console instead.");
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
            resolve({ success: true, message: 'Submission successful (simulated)!' });
        }, 1000);
    });
  }

  try {
    let response;
    const hasResume = type === FormType.Employee && (data as EmployeeFormData).resume;
    
    if (hasResume) {
      console.log('Preparing multipart/form-data request with resume');
      
      // Use multipart/form-data for file uploads
      const formData = new FormData();
      
      // Add type field
      formData.append('type', type);

      // Append all data fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'resume' && value instanceof File) {
          console.log(`Appending file: ${value.name}, size: ${value.size} bytes, type: ${value.type}`);
          formData.append('resume', value, value.name);
        } else if (key !== 'resume' && value !== null && value !== undefined) {
          if (typeof value === 'string') {
            formData.append(key, value);
            console.log(`Appending ${key}: ${value}`);
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
            console.log(`Appending ${key}: ${JSON.stringify(value)}`);
          } else {
            formData.append(key, String(value));
            console.log(`Appending ${key}: ${String(value)}`);
          }
        }
      });
      
      // Build headers - DON'T set Content-Type for FormData (browser sets it automatically)
      const headers: HeadersInit = {};
      if (WEBHOOK_AUTH) {
        headers['key'] = WEBHOOK_AUTH;
        console.log('Added auth header "key"');
      }

      console.log('Sending multipart POST request to:', WEBHOOK_URL);
      console.log('Request headers:', Object.keys(headers));

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
      
      // Use application/json for company forms
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
      console.error('1. CORS not properly configured');
      console.error('2. Network connectivity issues');
      console.error('3. n8n server not reachable');
      console.error('4. SSL/TLS certificate issues');
      
      return { 
        success: false, 
        message: 'Network error: Unable to reach the server. Please check your internet connection and try again.' 
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