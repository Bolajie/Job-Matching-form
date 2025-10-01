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
  const payload = {
    type,
    data,
  };

  console.log('=== WEBHOOK SUBMISSION START ===');
  console.log('Form Type:', type);
  console.log('Data:', JSON.stringify(data, null, 2));
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
      
      // For file uploads, send as JSON with base64 encoded file
      // This avoids CORS preflight issues with multipart/form-data
      const employeeData = data as EmployeeFormData;
      const file = employeeData.resume;
      
      if (file) {
        console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
        
        // Convert file to base64
        const base64File = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1]; // Remove data:*/*;base64, prefix
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        console.log('File converted to base64, length:', base64File.length);
        
        // Send everything as JSON
        const jsonPayload = {
          type,
          data: {
            ...data,
            resume: {
              name: file.name,
              type: file.type,
              size: file.size,
              data: base64File
            }
          }
        };
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (WEBHOOK_AUTH) {
          headers['key'] = WEBHOOK_AUTH;
          console.log('Added auth header "key"');
        }

        console.log('Sending POST request to:', WEBHOOK_URL);
        console.log('Headers:', Object.keys(headers));
        console.log('Payload size:', JSON.stringify(jsonPayload).length, 'bytes');

        response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(jsonPayload),
        });
      } else {
        throw new Error('Resume file is required');
      }

    } else {
      console.log('Preparing application/json request');
      
      // Use application/json for other forms
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (WEBHOOK_AUTH) {
        headers['key'] = WEBHOOK_AUTH;
        console.log('Added auth header "key"');
      }
      
      console.log('Sending POST request to:', WEBHOOK_URL);
      console.log('Headers:', Object.keys(headers));
      console.log('Payload:', JSON.stringify(payload, null, 2));

      response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
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
    console.error('Error details:', error instanceof Error ? error.stack : 'Unknown error');
    console.log('=== WEBHOOK SUBMISSION END (WITH ERROR) ===');
    
    if (error instanceof Error) {
        return { success: false, message: `Submission failed: ${error.message}` };
    }
    return { success: false, message: 'An unknown error occurred during submission.' };
  }
};