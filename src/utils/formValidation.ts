// Comprehensive form validation utilities for NP Wellness Store

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

export interface ShippingAddressForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  addressLine2?: string;
  landmark?: string;
}

// Validation functions
export const validateShippingAddress = (formData: ShippingAddressForm): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // Full Name validation
  if (!formData.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (formData.fullName.length < 3) {
    errors.fullName = 'Full name must be at least 3 characters';
  } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
    errors.fullName = 'Full name should only contain letters and spaces';
  }

  // Phone validation
  if (!formData.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
    errors.phone = 'Please enter a valid 10-digit Indian mobile number';
  }

  // Address validation
  if (!formData.address.trim()) {
    errors.address = 'Address is required';
  } else if (formData.address.length < 10) {
    errors.address = 'Please enter a complete address';
  }

  // City validation
  if (!formData.city.trim()) {
    errors.city = 'City is required';
  } else if (formData.city.length < 3) {
    errors.city = 'City name must be at least 3 characters';
  }

  // State validation
  if (!formData.state.trim()) {
    errors.state = 'State is required';
  }

  // Pincode validation
  if (!formData.pincode.trim()) {
    errors.pincode = 'PIN code is required';
  } else if (!/^[1-9]\d{5}$/.test(formData.pincode)) {
    errors.pincode = 'Please enter a valid 6-digit Indian PIN code';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: Object.keys(warnings).length > 0 ? warnings : undefined
  };
};

// Real-time validation for individual fields
export const validateField = (name: string, value: string): string | null => {
  switch (name) {
    case 'fullName':
      if (!value.trim()) return 'Full name is required';
      if (value.length < 3) return 'Full name must be at least 3 characters';
      if (!/^[a-zA-Z\s]+$/.test(value)) return 'Full name should only contain letters and spaces';
      break;

    case 'phone':
      if (!value.trim()) return 'Phone number is required';
      if (!/^[6-9]\d{9}$/.test(value.replace(/\s/g, ''))) return 'Please enter a valid 10-digit Indian mobile number';
      break;

    case 'address':
      if (!value.trim()) return 'Address is required';
      if (value.length < 10) return 'Please enter a complete address';
      break;

    case 'city':
      if (!value.trim()) return 'City is required';
      if (value.length < 3) return 'City name must be at least 3 characters';
      break;

    case 'state':
      if (!value.trim()) return 'State is required';
      break;

    case 'pincode':
      if (!value.trim()) return 'PIN code is required';
      if (!/^[1-9]\d{5}$/.test(value)) return 'Please enter a valid 6-digit Indian PIN code';
      break;

    default:
      return null;
  }

  return null;
};

// Format phone number as user types
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 5) return cleaned;
  if (cleaned.length <= 10) return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
};

// Format UPI ID to lowercase