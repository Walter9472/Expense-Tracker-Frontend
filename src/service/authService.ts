import axios from "axios";

const API_BASE_URL = "http://localhost:8080";
const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

// Token im LocalStorage speichern
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);

  // Token-Expiry-Zeit berechen (30 Stunden = 108000000 ms)
  const expiryTime = Date.now() + 108000000
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
}

//Token aus LocalStorage abrufen
export function getToken(): string  | null {
  return localStorage.getItem(TOKEN_KEY);
}

//Token Löschen
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

//Prüfen ob Token abgelaufen ist
export function isTokenExpired(): boolean {
 const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
 if (!expiryTime) {
   return true;
 }

 return Date.now() >= parseInt(expiryTime);
}

//Prüfen ob Token bald abläuft (z.B. in 5 Minuten)

export function isTokenExpiringSoon(minutesBeforeExpiry: number = 5): boolean {
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if(!expiryTime) return true;

    const expiryTimestamp = parseInt(expiryTime);
    const threshold = expiryTimestamp - (minutesBeforeExpiry * 60 * 1000);
    return Date.now() >= threshold;
}

//Login Funktion
export async function login(credentials: LoginCredentials): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials)
    const token = response.data

    saveToken(token)
    return token
  } catch (error: any) {
    if (error.response?.status === 401) {  // ← reponse → response korrigiert
      throw new Error('Ungültiger Benutzername oder Passwort')
    }
    throw new Error('Login Fehlgeschlagen')
  }
}
// Register Funktion
export async function register(data: RegisterData): Promise<void> {
  try {
    await axios.post(`${API_BASE_URL}/register`, data);
  }catch(error: any){
    if (error.response?.status === 400) {
      throw new Error('Registrierung fehlgeschlagen. Benutzername oder Passwort bereits vorhanden.');
    }
    throw new Error('Registrierung fehlgeschlagen.');
  }
}

// Logout Funktion
export function logout(): void {
  removeToken();
}

// Prüfen ob Benutzer authetifiziert ist
export function isAuthenticated(): boolean {
  const token = getToken();
  return token !== null && !isTokenExpired();
}
