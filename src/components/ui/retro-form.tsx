"use client";

import { useState, useEffect, ReactNode } from "react";
import { Check, X, AlertCircle, Eye, EyeOff, Info } from "lucide-react";

interface RetroInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
  error?: string;
  success?: string;
  hint?: string;
  disabled?: boolean;
  showPasswordToggle?: boolean;
  className?: string;
}

export function RetroInput({
  label,
  type = "text",
  placeholder,
  value = "",
  onChange,
  onBlur,
  validation,
  error,
  success,
  hint,
  disabled = false,
  showPasswordToggle = false,
  className = ""
}: RetroInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalError, setInternalError] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const inputType = showPasswordToggle && showPassword ? "text" : type;

  // Validation logic
  const validateInput = (inputValue: string) => {
    if (!validation) return null;

    if (validation.required && !inputValue.trim()) {
      return "This field is required";
    }

    if (validation.minLength && inputValue.length < validation.minLength) {
      return `Minimum ${validation.minLength} characters required`;
    }

    if (validation.maxLength && inputValue.length > validation.maxLength) {
      return `Maximum ${validation.maxLength} characters allowed`;
    }

    if (validation.pattern && !validation.pattern.test(inputValue)) {
      return "Invalid format";
    }

    if (validation.custom) {
      return validation.custom(inputValue);
    }

    return null;
  };

  useEffect(() => {
    if (value) {
      const validationError = validateInput(value);
      setInternalError(validationError || "");
      setIsValid(validationError === null);
    } else {
      setInternalError("");
      setIsValid(null);
    }
  }, [value, validation]);

  const displayError = error || internalError;
  const isSuccess = success || (isValid && value.length > 0);

  const getInputBorderColor = () => {
    if (displayError) return "#FF3EA5";
    if (isSuccess) return "#00FF00";
    if (isFocused) return "#FFC700";
    return "#111111";
  };

  const getInputBoxShadow = () => {
    if (displayError) return "4px 4px 0px #FF3EA5";
    if (isSuccess) return "4px 4px 0px #00FF00";
    if (isFocused) return "4px 4px 0px #FFC700";
    return "2px 2px 0px #111111";
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label style={{
          display: "block",
          fontFamily: "Poppins, sans-serif",
          fontSize: "14px",
          fontWeight: 700,
          textTransform: "uppercase",
          color: displayError ? "#FF3EA5" : "#111111",
          marginBottom: "8px",
          transition: "color 0.2s ease"
        }}>
          {label}
          {validation?.required && (
            <span style={{ color: "#FF3EA5", marginLeft: "4px" }}>*</span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div style={{ position: "relative" }}>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          style={{
            width: "100%",
            padding: showPasswordToggle ? "12px 48px 12px 16px" : "12px 16px",
            border: `3px solid ${getInputBorderColor()}`,
            backgroundColor: disabled ? "#F0F0F0" : "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            outline: "none",
            transition: "all 0.2s ease",
            boxShadow: getInputBoxShadow(),
            color: disabled ? "#666" : "#111111"
          }}
        />

        {/* Password Toggle */}
        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#666",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#111111"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {/* Status Icon */}
        {(displayError || isSuccess) && (
          <div style={{
            position: "absolute",
            right: showPasswordToggle ? "48px" : "12px",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: displayError ? "#FF3EA5" : "#00FF00",
            border: "2px solid #111111",
            boxShadow: "2px 2px 0px #111111",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {displayError ? (
              <X size={16} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <Check size={16} color="#111111" strokeWidth={3} />
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ marginTop: "8px", minHeight: "20px" }}>
        {displayError && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#FF3EA5",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            animation: "shake 0.3s ease-in-out"
          }}>
            <AlertCircle size={14} />
            {displayError}
          </div>
        )}
        
        {isSuccess && success && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#00FF00",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600
          }}>
            <Check size={14} />
            {success}
          </div>
        )}

        {hint && !displayError && !success && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#666",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif"
          }}>
            <Info size={14} />
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}

// Textarea component
interface RetroTextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    custom?: (value: string) => string | null;
  };
  error?: string;
  success?: string;
  hint?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  showCharCount?: boolean;
}

export function RetroTextarea({
  label,
  placeholder,
  value = "",
  onChange,
  onBlur,
  validation,
  error,
  success,
  hint,
  rows = 4,
  disabled = false,
  className = "",
  showCharCount = false
}: RetroTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Validation logic (similar to RetroInput)
  const validateTextarea = (inputValue: string) => {
    if (!validation) return null;

    if (validation.required && !inputValue.trim()) {
      return "This field is required";
    }

    if (validation.minLength && inputValue.length < validation.minLength) {
      return `Minimum ${validation.minLength} characters required`;
    }

    if (validation.maxLength && inputValue.length > validation.maxLength) {
      return `Maximum ${validation.maxLength} characters allowed`;
    }

    if (validation.custom) {
      return validation.custom(inputValue);
    }

    return null;
  };

  useEffect(() => {
    if (value) {
      const validationError = validateTextarea(value);
      setInternalError(validationError || "");
      setIsValid(validationError === null);
    } else {
      setInternalError("");
      setIsValid(null);
    }
  }, [value, validation]);

  const displayError = error || internalError;
  const isSuccess = success || (isValid && value.length > 0);

  const getBorderColor = () => {
    if (displayError) return "#FF3EA5";
    if (isSuccess) return "#00FF00";
    if (isFocused) return "#FFC700";
    return "#111111";
  };

  const getBoxShadow = () => {
    if (displayError) return "4px 4px 0px #FF3EA5";
    if (isSuccess) return "4px 4px 0px #00FF00";
    if (isFocused) return "4px 4px 0px #FFC700";
    return "2px 2px 0px #111111";
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label style={{
          display: "block",
          fontFamily: "Poppins, sans-serif",
          fontSize: "14px",
          fontWeight: 700,
          textTransform: "uppercase",
          color: displayError ? "#FF3EA5" : "#111111",
          marginBottom: "8px",
          transition: "color 0.2s ease"
        }}>
          {label}
          {validation?.required && (
            <span style={{ color: "#FF3EA5", marginLeft: "4px" }}>*</span>
          )}
        </label>
      )}

      {/* Textarea Container */}
      <div style={{ position: "relative" }}>
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          rows={rows}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: `3px solid ${getBorderColor()}`,
            backgroundColor: disabled ? "#F0F0F0" : "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            outline: "none",
            transition: "all 0.2s ease",
            boxShadow: getBoxShadow(),
            color: disabled ? "#666" : "#111111",
            resize: "vertical"
          }}
        />

        {/* Status Icon */}
        {(displayError || isSuccess) && (
          <div style={{
            position: "absolute",
            right: "12px",
            top: "12px",
            backgroundColor: displayError ? "#FF3EA5" : "#00FF00",
            border: "2px solid #111111",
            boxShadow: "2px 2px 0px #111111",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {displayError ? (
              <X size={16} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <Check size={16} color="#111111" strokeWidth={3} />
            )}
          </div>
        )}
      </div>

      {/* Character Count */}
      {showCharCount && validation?.maxLength && (
        <div style={{
          textAlign: "right",
          fontSize: "12px",
          color: value.length > validation.maxLength * 0.8 ? "#FF3EA5" : "#666",
          fontFamily: "Inter, sans-serif",
          marginTop: "4px"
        }}>
          {value.length} / {validation.maxLength}
        </div>
      )}

      {/* Messages */}
      <div style={{ marginTop: "8px", minHeight: "20px" }}>
        {displayError && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#FF3EA5",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            animation: "shake 0.3s ease-in-out"
          }}>
            <AlertCircle size={14} />
            {displayError}
          </div>
        )}
        
        {isSuccess && success && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#00FF00",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600
          }}>
            <Check size={14} />
            {success}
          </div>
        )}

        {hint && !displayError && !success && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#666",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif"
          }}>
            <Info size={14} />
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}

// Select component
interface RetroSelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  validation?: {
    required?: boolean;
  };
  error?: string;
  success?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export function RetroSelect({
  label,
  placeholder,
  value = "",
  onChange,
  options,
  validation,
  error,
  success,
  hint,
  disabled = false,
  className = ""
}: RetroSelectProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState<string>("");

  useEffect(() => {
    if (validation?.required && !value) {
      setInternalError("Please select an option");
    } else {
      setInternalError("");
    }
  }, [value, validation]);

  const displayError = error || internalError;
  const isSuccess = success || (value && !displayError);

  const getBorderColor = () => {
    if (displayError) return "#FF3EA5";
    if (isSuccess) return "#00FF00";
    if (isFocused) return "#FFC700";
    return "#111111";
  };

  const getBoxShadow = () => {
    if (displayError) return "4px 4px 0px #FF3EA5";
    if (isSuccess) return "4px 4px 0px #00FF00";
    if (isFocused) return "4px 4px 0px #FFC700";
    return "2px 2px 0px #111111";
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label style={{
          display: "block",
          fontFamily: "Poppins, sans-serif",
          fontSize: "14px",
          fontWeight: 700,
          textTransform: "uppercase",
          color: displayError ? "#FF3EA5" : "#111111",
          marginBottom: "8px",
          transition: "color 0.2s ease"
        }}>
          {label}
          {validation?.required && (
            <span style={{ color: "#FF3EA5", marginLeft: "4px" }}>*</span>
          )}
        </label>
      )}

      {/* Select Container */}
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={onChange}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: `3px solid ${getBorderColor()}`,
            backgroundColor: disabled ? "#F0F0F0" : "#FFFFFF",
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            outline: "none",
            transition: "all 0.2s ease",
            boxShadow: getBoxShadow(),
            color: disabled ? "#666" : "#111111",
            cursor: "pointer",
            appearance: "none"
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div style={{
          position: "absolute",
          right: "16px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "#666"
        }}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
            <path d="M6 8L0 2h12L6 8z" />
          </svg>
        </div>

        {/* Status Icon */}
        {(displayError || isSuccess) && (
          <div style={{
            position: "absolute",
            right: "40px",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: displayError ? "#FF3EA5" : "#00FF00",
            border: "2px solid #111111",
            boxShadow: "2px 2px 0px #111111",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {displayError ? (
              <X size={16} color="#FFFFFF" strokeWidth={3} />
            ) : (
              <Check size={16} color="#111111" strokeWidth={3} />
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ marginTop: "8px", minHeight: "20px" }}>
        {displayError && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#FF3EA5",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            animation: "shake 0.3s ease-in-out"
          }}>
            <AlertCircle size={14} />
            {displayError}
          </div>
        )}
        
        {isSuccess && success && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#00FF00",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
            fontWeight: 600
          }}>
            <Check size={14} />
            {success}
          </div>
        )}

        {hint && !displayError && !success && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#666",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif"
          }}>
            <Info size={14} />
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}

// Form container with validation summary
interface RetroFormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  errors?: string[];
  className?: string;
}

export function RetroForm({ children, onSubmit, errors = [], className = "" }: RetroFormProps) {
  return (
    <form onSubmit={onSubmit} className={className}>
      {/* Error Summary */}
      {errors.length > 0 && (
        <div style={{
          backgroundColor: "#FFE4E1",
          border: "3px solid #FF3EA5",
          boxShadow: "4px 4px 0px #111111",
          padding: "16px",
          marginBottom: "24px",
          position: "relative"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px"
          }}>
            <div style={{
              backgroundColor: "#FF3EA5",
              padding: "6px",
              border: "2px solid #111111",
              boxShadow: "2px 2px 0px #111111"
            }}>
              <AlertCircle size={20} color="#FFFFFF" strokeWidth={2} />
            </div>
            <h3 style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "16px",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#111111",
              margin: 0
            }}>
              Please fix the following errors:
            </h3>
          </div>
          
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            fontSize: "14px",
            color: "#111111"
          }}>
            {errors.map((error, index) => (
              <li key={index} style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px"
              }}>
                <X size={14} color="#FF3EA5" strokeWidth={2} />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {children}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </form>
  );
}
