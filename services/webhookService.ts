import { CompanyFormData, EmployeeFormData, FormType } from '../types';

// Access environment variables using `process.env`, which is the standard
// supported by the execution environment. For deployment on platforms like Vercel,
// these variables must be configured in the project settings.
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const WEBHOOK_AUTH = process.env.WEBHOOK_AUTH;

if (!WEBHOOK_URL) {
  console.warn("Missing WEBHOOK_URL environment variable. Form submissions will be logged to the console instead.");
}

export const submitForm = async (
  type: FormType,
  data: CompanyFormData | EmployeeFormData
): Promise<{ success: boolean; message: string }> => {
  const payload = {
    type,
    data,
  };

  console.log('Submitting form:', payload);

  if (!WEBHOOK_URL) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ success: true, message: 'Submission successful (simulated)!' });
        }, 1000);
    });
  }

  try {
    let response;
    if (type === FormType.Employee && (data as EmployeeFormData).resume) {
      // Use multipart/form-data for file uploads
      const formData = new FormData();
      formData.append('type', type);

      // Append all data fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'resume' && value instanceof File) {
          formData.append(key, value, value.name);
        } else if (typeof value === 'string') {
          formData.append(`data[${key}]`, value);
        } else if (Array.isArray(value)) {
            value.forEach(item => formData.append(`data[${key}][]`, item));
        }
      });
      
      const headers: HeadersInit = {};
      if (WEBHOOK_AUTH) {
        headers['Authorization'] = `Bearer ${WEBHOOK_AUTH}`;
      }

      response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: formData,
      });


    } else {
      // Use application/json for other forms
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (WEBHOOK_AUTH) {
        headers['Authorization'] = `Bearer ${WEBHOOK_AUTH}`;
      }
      
      response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    }


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

      console.error(`Webhook submission failed. Status: ${response.status}. Details: ${errorDetail}`);

      let userFriendlyMessage;
      switch (response.status) {
        case 400:
          userFriendlyMessage = 'There was a problem with your submission. Please double-check the form.';
          break;
        case 401:
        case 403:
          userFriendlyMessage = 'You are not authorized to perform this action. Please contact support.';
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

    return { success: true, message: 'Submission successful!' };

  } catch (error: unknown) {
    console.error('Webhook submission error:', error);
    if (error instanceof Error) {
        return { success: false, message: `Submission failed: ${error.message}` };
    }
    return { success: false, message: 'An unknown error occurred during submission.' };
  }
};