// services/AuthService.js
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/auth';
  }

  async login(individualId, otp) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          individualId,
          otp
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await AsyncStorage.setItem('authToken', data.token);
        return { success: true, token: data.token };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async getUserProfile() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${this.baseURL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Failed to get profile' };
    }
  }

  async logout() {
    await AsyncStorage.removeItem('authToken');
  }
}

export default new AuthService();
