const API_BASE_URL = 'http://localhost:5000/api';

export interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: 'landlord' | 'tenant';
}

export interface LoginData {
  emailOrPhone: string;
  password: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  role: string;
  token: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(token: string) {
    return this.request('/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async uploadVerification(formData: FormData, token: string) {
    const url = `${API_BASE_URL}/users/me/verify-id`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async adminLogin(data: { email: string; password: string }) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsers(token: string) {
    return this.request('/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateVerificationStatus(userId: string, action: 'approve' | 'reject', token: string) {
    return this.request(`/admin/users/${userId}/verification`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });
  }
}

export const apiService = new ApiService(); 