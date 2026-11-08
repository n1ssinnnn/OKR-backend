import { auth } from '../../packages/auth/auth';
import { AuthService } from '../../packages/services/auth-service'

// Services
const authService = new AuthService(auth);

export { authService }