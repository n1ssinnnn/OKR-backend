import { prisma } from "./database/prisma.client"

// Repositories
import { PrismaUserRepository } from "./database/repositories/prisma-user.repository"
import { PrismaCycleRepository } from "./database/repositories/prisma-cycle.repository"
import { PrismaObjectiveRepository } from "./database/repositories/prisma-objective.repository"
import { PrismaKeyResultRepository } from "./database/repositories/prisma-keyresult.repository"
import { PrismaCheckInRepository } from "./database/repositories/prisma-checkin.repository"

// Use Cases
import { CreateCycleUseCase } from "../application/use-cases/cycles/create-cycle.usecase"
import { GetCyclesUseCase } from "../application/use-cases/cycles/get-cycles.usecase"
import { CreateObjectiveUseCase } from "../application/use-cases/objectives/create-objective.usecase"
import { GetObjectivesUseCase } from "../application/use-cases/objectives/get-objectives.usecase"
import { CreateKeyResultUseCase } from "../application/use-cases/key-results/create-keyresult.usecase"
import { SubmitCheckInUseCase } from "../application/use-cases/checkins/submit-checkin.usecase"
import { GetUsersUseCase } from "../application/use-cases/users/get-users.usecase"
import { CreateUserUseCase } from "../application/use-cases/users/create-user.usecase"
import { BulkImportUsersUseCase } from "../application/use-cases/users/bulk-import-users.usecase"

// --- Repositories (Layer 4) ---
const userRepo = new PrismaUserRepository(prisma)
const cycleRepo = new PrismaCycleRepository(prisma)
const objectiveRepo = new PrismaObjectiveRepository(prisma)
const keyResultRepo = new PrismaKeyResultRepository(prisma)
const checkInRepo = new PrismaCheckInRepository(prisma)

// --- Use Cases (Layer 2) ---
export const container = {
    // Cycles
    createCycle: new CreateCycleUseCase(cycleRepo),
    getCycles: new GetCyclesUseCase(cycleRepo),

    // Objectives
    createObjective: new CreateObjectiveUseCase(objectiveRepo, cycleRepo),
    getObjectives: new GetObjectivesUseCase(objectiveRepo, keyResultRepo),

    // Key Results
    createKeyResult: new CreateKeyResultUseCase(keyResultRepo, objectiveRepo),

    // Check-ins
    submitCheckIn: new SubmitCheckInUseCase(checkInRepo, keyResultRepo, objectiveRepo),

    // Users
    createUser: new CreateUserUseCase(userRepo),
    getUsers: new GetUsersUseCase(userRepo),
    bulkImport: new BulkImportUsersUseCase(userRepo),
}