// Creates an admin account. Public sign-up is disabled, so this is how the first admin is made.
// Usage: bun run db:create-admin:local --email admin@company.com --password '...' \
//          --first-name Somchai --last-name Jaidee --department "Human Resources" --position "HR Manager"
import { parseArgs } from 'node:util';
import { auth } from '../auth/auth';
import { OrganizationRepository } from '../repositories/organization-repo';
import { UserRepository } from '../repositories/user-repo';

const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
        email: { type: 'string' },
        password: { type: 'string' },
        'first-name': { type: 'string' },
        'last-name': { type: 'string' },
        department: { type: 'string' },
        position: { type: 'string' },
    },
});

const missing = Object.keys({ email: 0, password: 0, 'first-name': 0, 'last-name': 0, department: 0, position: 0 })
    .filter((key) => !values[key as keyof typeof values]?.trim());
if (missing.length > 0) {
    console.error(`Missing option(s): ${missing.map((m) => `--${m}`).join(', ')}`);
    process.exit(1);
}

const email = values.email!.trim().toLowerCase();
const password = values.password!;
if (password.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
}

const userRepo = new UserRepository();
const orgRepo = new OrganizationRepository();

if ((await userRepo.findExistingEmails([email])).length > 0) {
    console.error(`User already exists: ${email}`);
    process.exit(1);
}

const [department] = await orgRepo.findDepartmentsByNames([values.department!.trim()]);
if (!department) {
    console.error(`Department not found: ${values.department}. Run the seed first.`);
    process.exit(1);
}
const position = (await orgRepo.findPositionsByDepartmentIds([department.id]))
    .find((p) => p.name.toLowerCase() === values.position!.trim().toLowerCase());
if (!position) {
    console.error(`Position "${values.position}" not found in department "${department.name}"`);
    process.exit(1);
}

const passwordHash = await (await auth.$context).password.hash(password);
const [admin] = await userRepo.createManyWithCredentials([{
    firstName: values['first-name']!.trim(),
    lastName: values['last-name']!.trim(),
    email,
    role: 'admin',
    departmentId: department.id,
    positionId: position.id,
    passwordHash,
}]);

console.log(`Created admin ${admin!.email} (${admin!.id})`);
process.exit(0);
