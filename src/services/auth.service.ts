// Re-export the new organized auth API
export { authApi as authService } from './api/auth';

export async function logout() {
  await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
