// Error handling utilities for API responses

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public status: number;
  public code: string;
  public details: any;

  constructor(message: string, status: number = 500, code: string = 'UNKNOWN_ERROR', details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const handleApiError = (error: any): AppError => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return new AppError(
      data.message || 'An error occurred',
      status,
      data.code || 'API_ERROR',
      data.details
    );
  } else if (error.request) {
    // Request was made but no response received
    return new AppError(
      'Network error - please check your connection',
      0,
      'NETWORK_ERROR'
    );
  } else {
    // Something else happened
    return new AppError(
      error.message || 'An unexpected error occurred',
      500,
      'UNKNOWN_ERROR'
    );
  }
};

export const getErrorMessage = (error: any): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Toast notification helper (you can integrate with a toast library)
export const showErrorToast = (error: any) => {
  const message = getErrorMessage(error);
  console.error('Error:', message, error);
  
  // You can integrate with libraries like react-hot-toast, react-toastify, etc.
  // For now, we'll just log to console
  // toast.error(message);
};

export const showSuccessToast = (message: string) => {
  console.log('Success:', message);
  // toast.success(message);
};