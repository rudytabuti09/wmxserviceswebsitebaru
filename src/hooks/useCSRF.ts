import { useState, useEffect } from 'react';

interface CSRFTokenResponse {
  token: string;
  expiresIn: number;
}

export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCSRFToken();
  }, []);

  const fetchCSRFToken = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/csrf');
      if (response.ok) {
        const data: CSRFTokenResponse = await response.json();
        setCsrfToken(data.token);
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCSRFHeaders = () => {
    if (!csrfToken) {
      return {};
    }
    return {
      'X-CSRF-Token': csrfToken,
    };
  };

  return {
    csrfToken,
    isLoading,
    getCSRFHeaders,
    refreshToken: fetchCSRFToken,
  };
}
