const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^\+?[0-9][0-9\s\-()]{7,19}$/;

function requiredString(value: unknown, field: string, min = 1, max = 100) {
  if (typeof value !== "string") {
    return `${field} is required`;
  }

  const trimmed = value.trim();
  if (!trimmed.length) {
    return `${field} is required`;
  }
  if (trimmed.length < min) {
    return `${field} must be at least ${min} characters`;
  }
  if (trimmed.length > max) {
    return `${field} must be at most ${max} characters`;
  }

  return null;
}

export function validateAgentPayload(body: unknown, { requireId = false } = {}) {
  const errors: string[] = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { valid: false, errors: ["Request body must be a JSON object"] };
  }

  const data = body as Record<string, unknown>;

  if (requireId) {
    const idError = requiredString(data.id, "id", 1, 80);
    if (idError) {
      errors.push(idError);
    }
  } else if (data.id != null && data.id !== "") {
    const idError = requiredString(data.id, "id", 1, 80);
    if (idError) {
      errors.push(idError);
    }
  }

  const firstNameError = requiredString(data.firstName, "firstName", 1, 100);
  if (firstNameError) errors.push(firstNameError);

  const lastNameError = requiredString(data.lastName, "lastName", 1, 100);
  if (lastNameError) errors.push(lastNameError);

  const emailError = requiredString(data.email, "email", 3, 255);
  if (emailError) {
    errors.push(emailError);
  } else if (!EMAIL_PATTERN.test(String(data.email).trim())) {
    errors.push("email must be a valid email address");
  }

  const mobileError = requiredString(data.mobileNumber, "mobileNumber", 8, 20);
  if (mobileError) {
    errors.push(mobileError);
  } else if (!MOBILE_PATTERN.test(String(data.mobileNumber).trim())) {
    errors.push("mobileNumber must be a valid phone number");
  }

  return { valid: errors.length === 0, errors };
}
