export function validateUsername(username: string) {
  // validates username with regex and length and returns a boolean
  const errors: string[] = [];
  if (username.length < 5) {
    errors.push("Username must be at least 5 characters");
  }

  if (username.length > 20) {
    errors.push("Username must be at most 20 characters");
  }

  return errors;
}

export function validateEmail(email: string) {
  // validates email with regex and length and returns a boolean
  const errors: string[] = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid Email");
  }

  if (email.length < 5) {
    errors.push("Email must be at least 5 characters");
  }

  if (email.length > 50) {
    errors.push("Email must be at most 50 characters");
  }

  return errors;
}

export function validatePassword(password: string) {
  // validates password with regex and length and returns a boolean
  const errors: string[] = [];
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  // check password for special symbols
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // check password for numbers
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return errors;
}
