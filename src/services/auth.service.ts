// Re-export the new organized auth API
export { authApi as authService } from './api/auth';

// Use the unified auth API for logout so it respects the configured axios baseURL
import { authApi } from './api/auth';

export async function logout() {
  await authApi.logout();
}
