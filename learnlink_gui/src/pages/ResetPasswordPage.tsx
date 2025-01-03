import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useToast } from '../components/ToastProvider';
import '../styles/ResetPasswordPage.css';
import { FaKey, FaLock } from 'react-icons/fa';

const ResetPasswordPage = () => {
  const location = useLocation();
  const email = location.state?.email;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!email) {
      showToast('Please request a reset code first', 'error');
      navigate('/forgot-password');
    }
  }, [email, navigate, showToast]);

  // Toggle password visibility for both fields
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      setIsLoading(false);
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      showToast('Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, and 1 number', 'error');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/api/auth/reset-password', {
        email,
        code,
        newPassword
      });
      showToast('Password reset successful!', 'success');
      navigate('/');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h1 className="reset-password-title">Reset Password</h1>
        <p className="reset-password-subtitle">
          Enter the 6-digit code sent to your email and your new password
        </p>
        
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="input-group">
            <FaKey className="input-icon" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-Digit Reset Code"
              required
              maxLength={6}
              pattern="\d{6}"
              title="Please enter the 6-digit code"
              className="reset-password-input"
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type={passwordVisible ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              required
              minLength={8}
              title="Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, and 1 number"
              className="reset-password-input"
            />
            <i
              className={`fa-solid ${passwordVisible ? "fa-eye" : "fa-eye-slash"}`}
              onClick={togglePasswordVisibility}
              id="togglePassword"
              style={{ cursor: "pointer" }}
            ></i>
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type={passwordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              required
              minLength={8}
              title="Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, and 1 number"
              className="reset-password-input"
            />
            <i
              className={`fa-solid ${passwordVisible ? "fa-eye" : "fa-eye-slash"}`}
              onClick={togglePasswordVisibility}
              id="toggleConfirmPassword"
              style={{ cursor: "pointer" }}
            ></i>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="reset-password-button"
          >
            {isLoading ? 'Resetting...' : 'RESET PASSWORD'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="back-to-login-button"
          >
            BACK TO LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 