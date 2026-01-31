/**
 * Local Authentication System
 * Works without external services for demo/showcase purposes
 * Stores users securely in localStorage with password hashing
 */

// Simple hash function for passwords (not production-ready, but works for demo)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "sahara-salt-2024");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

const STORAGE_KEY = "sahara-local-users";
const SESSION_KEY = "sahara-session";

// Get all users from storage
function getUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save users to storage
function saveUsers(users: LocalUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Get current session
export function getSession(): LocalUser | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

// Save session
function saveSession(user: LocalUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Clear session
function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Sign up
export async function localSignUp(
  email: string,
  password: string,
  name?: string
): Promise<{ user: LocalUser }> {
  const users = getUsers();
  
  // Check if email exists
  const existingUser = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (existingUser) {
    throw new Error("An account with this email already exists. Please sign in.");
  }
  
  // Validate password
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  
  // Create new user
  const passwordHash = await hashPassword(password);
  const newUser: LocalUser = {
    id: generateId(),
    email: email.toLowerCase().trim(),
    name: name || email.split("@")[0],
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  saveSession(newUser);
  
  return { user: newUser };
}

// Sign in
export async function localSignIn(
  email: string,
  password: string
): Promise<{ user: LocalUser }> {
  const users = getUsers();
  
  // Find user
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );
  
  if (!user) {
    throw new Error("No account found with this email. Please sign up first.");
  }
  
  // Verify password
  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    throw new Error("Incorrect password. Please try again.");
  }
  
  saveSession(user);
  return { user };
}

// Sign out
export function localSignOut(): void {
  clearSession();
}

// Check if user is signed in
export function isSignedIn(): boolean {
  return getSession() !== null;
}

// Update user profile
export function updateLocalUser(
  userId: string,
  updates: Partial<Pick<LocalUser, "name" | "email">>
): LocalUser | null {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  saveUsers(users);
  
  // Update session if it's the current user
  const session = getSession();
  if (session && session.id === userId) {
    saveSession(users[index]);
  }
  
  return users[index];
}





