import { InputHTMLAttributes, TextareaHTMLAttributes, useState } from "react";

interface RetroInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
}

interface RetroTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  className?: string;
}

export function RetroInput({ 
  label, 
  error, 
  className = "", 
  ...props 
}: RetroInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${isFocused ? '#FF3EA5' : error ? '#EF4444' : '#111111'}`,
    borderRadius: '0px',
    backgroundColor: '#FFFFFF',
    fontSize: '16px',
    fontFamily: 'Inter, sans-serif',
    color: '#111111',
    transition: 'border-color 0.1s ease',
    outline: 'none',
    boxShadow: '3px 3px 0px #111111',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#333333',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div className={className}>
      <label style={labelStyles}>
        {label}
      </label>
      <input
        style={inputStyles}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && (
        <p style={{ 
          marginTop: '8px', 
          fontSize: '14px', 
          color: '#EF4444' 
        }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function RetroTextarea({ 
  label, 
  error, 
  className = "", 
  rows = 4,
  ...props 
}: RetroTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);

  const textareaStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${isFocused ? '#FF3EA5' : error ? '#EF4444' : '#111111'}`,
    borderRadius: '0px',
    backgroundColor: '#FFFFFF',
    fontSize: '16px',
    fontFamily: 'Inter, sans-serif',
    color: '#111111',
    transition: 'border-color 0.1s ease',
    outline: 'none',
    boxShadow: '3px 3px 0px #111111',
    resize: 'vertical' as const,
    minHeight: '120px',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#333333',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div className={className}>
      <label style={labelStyles}>
        {label}
      </label>
      <textarea
        rows={rows}
        style={textareaStyles}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && (
        <p style={{ 
          marginTop: '8px', 
          fontSize: '14px', 
          color: '#EF4444' 
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
