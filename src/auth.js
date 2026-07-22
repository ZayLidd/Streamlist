const AUTH_SESSION_KEY = "streamlistGoogleUser";

export function decodeGoogleCredential(credential) {
  if (!credential) {
    throw new Error("Google did not return an identity credential.");
  }

  const parts = credential.split(".");

  if (parts.length !== 3) {
    throw new Error("The Google identity credential is not valid.");
  }

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );
  const jsonPayload = decodeURIComponent(
    atob(paddedBase64)
      .split("")
      .map((character) => {
        return `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`;
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

export function createSessionUser(credential) {
  const payload = decodeGoogleCredential(credential);

  if (!payload.sub || !payload.email) {
    throw new Error("Google did not return the required profile information.");
  }

  return {
    id: payload.sub,
    name: payload.name || payload.given_name || "StreamList User",
    email: payload.email,
    picture: payload.picture || "",
  };
}

export function loadSessionUser() {
  try {
    const savedUser = sessionStorage.getItem(AUTH_SESSION_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Could not load the signed in user:", error);
    return null;
  }
}

export function saveSessionUser(user) {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
}

export function clearSessionUser() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}
