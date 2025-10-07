import { CompanyFormData, EmployeeFormData, FormType } from '../types';

// The webhook URL now points to our secure, server-side API proxy on Vercel.
// This proxy will read your secrets from Vercel's environment variables
// and forward the request to your actual webhook endpoint.
const PROXY_WEBHOOK_URL = '/api/submit';

export const submitForm = async (
  type: FormType,
  data: CompanyFormData | EmployeeFormData
): Promise<{ success: boolean; message: string }> => {
  console.log('=== WEBHOOK SUBMISSION START ===');
  console.log('Form Type:', type);
  console.log('Submitting to API proxy endpoint:', PROXY_WEBHOOK_URL);

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
      formData.append('type', type);
      formData.append('fullName', employeeData.fullName);
      formData.append('email', employeeData.email);
      formData.append('phone', employeeData.phone);
      formData.append('skillLevel', employeeData.skillLevel);
      formData.append('resume', file, file.name);

      console.log('Sending multipart/form-data POST request to proxy...');
      
      // The browser will automatically set the correct 'Content-Type' for FormData.
      // We don't add auth headers here; the serverless function does that securely.
      response = await fetch(PROXY_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
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
      
      console.log('Sending JSON POST request to proxy...');
      console.log('Payload:', JSON.stringify(payload, null, 2));

      response = await fetch(PROXY_WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    }

    console.log('Response received from proxy - Status:', response.status, response.statusText);
    console.log('Response OK:', response.ok);

    if (!response.ok) {
      let errorDetail = 'Could not read error response body.';
      try {
        const errorBody = await response.json();
        // The proxy forwards the webhook's response, or provides its own error message
        errorDetail = errorBody.message || errorBody.error || JSON.stringify(errorBody);
      } catch (e) {
        try {
          errorDetail = await response.text();
        } catch (textErr) {
          errorDetail = 'Could not read error response body.';
        }
      }

      console.error(`❌ Submission via proxy failed`);
      console.error(`Status: ${response.status}`);
      console.error(`Details: ${errorDetail}`);

      let userFriendlyMessage;
      // Use the same status code mapping, as the proxy forwards the status
      switch (response.status) {
        case 400:
          userFriendlyMessage = 'There was a problem with your submission. Please double-check the form.';
          break;
        case 401:
        case 403:
          userFriendlyMessage = 'Authentication failed. Please check the server configuration.';
          break;
        case 404:
          userFriendlyMessage = 'The submission service could not be found. This could be an issue with the proxy or the final webhook.';
          break;
        case 429:
          userFriendlyMessage = 'You are submitting too frequently. Please wait a moment and try again.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          userFriendlyMessage = 'The server is currently unavailable. Please try again later.';
          break;
        default:
          userFriendlyMessage = `An unexpected error occurred (Status: ${response.status}). Please try again.`;
      }
      
      throw new Error(userFriendlyMessage);
    }

    let responseData;
    try {
      responseData = await response.json();
      console.log('Response data from proxy:', JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.log('No JSON response body (this is okay)');
    }

    console.log('✅ Submission successful!');
    console.log('=== WEBHOOK SUBMISSION END ===');
    
    return { success: true, message: 'Submission successful!' };

  } catch (error: unknown) {
    console.error('❌ Submission error:', error);
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error: This could be due to:');
      console.error('1. The API proxy endpoint (/api/submit) is not available. Ensure you have deployed to Vercel.');
      console.error('2. A general network connectivity issue.');
      
      return { 
        success: false, 
        message: 'Network error: Unable to reach submission service. Please ensure you are connected and the app is deployed correctly.' 
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
