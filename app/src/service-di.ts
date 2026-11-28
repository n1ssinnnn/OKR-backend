import { auth } from '../../packages/auth/auth';
import { UserRepository } from '../../packages/repositories/user-repo'
import { OrganizationRepository } from '../../packages/repositories/organization-repo'
import { AuthService } from '../../packages/services/auth-service'
import { UserService } from '../../packages/services/user-service'

// Repos
const userRepository = new UserRepository;
const organizationRepository = new OrganizationRepository;

// Hash with Better Auth's configured hasher so created users can sign in normally
const hashPassword = async (password: string) => (await auth.$context).password.hash(password);

// Services
const authService = new AuthService(auth);
const userService = new UserService(userRepository, organizationRepository, hashPassword, auth);

export { authService, userService }