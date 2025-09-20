import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { UserRepository } from '@modules/user/repository/repositories/user.repository';
import { ENUM_USER_ROLE } from '@modules/user/dtos/user.dto';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

@Injectable()
export class UserSeed {
    constructor(
        private readonly userService: UserService,
        private readonly userRepository: UserRepository,
    ) {}

    @Command({
        command: 'seed:user',
        describe: 'Seed users with sample data',
    })
    async seed(): Promise<void> {
        const defaultPassword = 'Test@123';

        try {
            // Check if users already exist
            const existingUsers = await this.userRepository.count();
            if (existingUsers > 0) {
                console.log('Users already exist. Skipping seed.');
                return;
            }

            // Create admin user
            const adminUser = await this.userService.create({
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                phoneNumber: '+1234567890',
                address: '123 Admin Street, Admin City, AC 12345',
                password: defaultPassword,
                role: ENUM_USER_ROLE.ADMIN,
                avatar: '',
            });

            // Create regular user
            const regularUser = await this.userService.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phoneNumber: '+1234567891',
                address: '456 User Avenue, User City, UC 54321',
                password: defaultPassword,
                role: ENUM_USER_ROLE.USER,
                avatar: '',
            });

            // Create another regular user
            const anotherUser = await this.userService.create({
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                phoneNumber: '+1234567892',
                address: '789 Test Road, Test City, TC 67890',
                password: defaultPassword,
                role: ENUM_USER_ROLE.USER,
                avatar: '',
            });

            // Mark email as verified for all users
            await Promise.all([
                this.userRepository.updateOneById(
                    new Types.ObjectId(adminUser._id),
                    {
                        isEmailVerified: true,
                    },
                ),
                this.userRepository.updateOneById(
                    new Types.ObjectId(regularUser._id),
                    {
                        isEmailVerified: true,
                    },
                ),
                this.userRepository.updateOneById(
                    new Types.ObjectId(anotherUser._id),
                    {
                        isEmailVerified: true,
                    },
                ),
            ]);

            console.log('✅ Users seeded successfully!');
            console.log('📧 Admin: admin@example.com');
            console.log('📧 User 1: john@example.com');
            console.log('📧 User 2: jane@example.com');
            console.log('🔑 Password for all users: Test@123');
        } catch (error) {
            console.error('❌ Error seeding users:', error);
            throw error;
        }
    }

    @Command({
        command: 'remove:user',
        describe: 'Remove all users from database',
    })
    async remove(): Promise<void> {
        try {
            await this.userRepository.deleteMany({});
            console.log('✅ Removed users from database');
        } catch (error) {
            console.error('❌ Error removing users:', error);
            throw error;
        }
    }

    @Command({
        command: 'seed:admin',
        describe: 'Seed only admin user',
    })
    async seedAdmin(): Promise<void> {
        const defaultPassword = 'Admin@123';

        try {
            // Check if admin already exists
            const existingAdmin =
                await this.userRepository.findByEmail('admin@example.com');
            if (existingAdmin) {
                console.log('Admin user already exists. Skipping seed.');
                return;
            }

            // Create admin user
            const adminUser = await this.userService.create({
                firstName: 'Super',
                lastName: 'Admin',
                email: 'admin@example.com',
                phoneNumber: '+1234567890',
                address: '123 Admin Street, Admin City, AC 12345',
                password: defaultPassword,
                role: ENUM_USER_ROLE.ADMIN,
                avatar: '',
            });

            // Mark email as verified
            await this.userRepository.updateOneById(
                new Types.ObjectId(adminUser._id),
                {
                    isEmailVerified: true,
                },
            );

            console.log('✅ Admin user seeded successfully!');
            console.log('📧 Email: admin@example.com');
            console.log('🔑 Password: Admin@123');
        } catch (error) {
            console.error('❌ Error seeding admin user:', error);
            throw error;
        }
    }

    @Command({
        command: 'seed:test-users',
        describe: 'Seed multiple test users for development',
    })
    async seedTestUsers(): Promise<void> {
        const defaultPassword = 'Test@123';
        const testUsers = [
            {
                firstName: 'Alice',
                lastName: 'Johnson',
                email: 'alice@test.com',
                phoneNumber: '+1111111111',
                address: '111 Test Street, Test City, TC 11111',
                role: ENUM_USER_ROLE.USER,
            },
            {
                firstName: 'Bob',
                lastName: 'Wilson',
                email: 'bob@test.com',
                phoneNumber: '+2222222222',
                address: '222 Test Avenue, Test City, TC 22222',
                role: ENUM_USER_ROLE.USER,
            },
            {
                firstName: 'Charlie',
                lastName: 'Brown',
                email: 'charlie@test.com',
                phoneNumber: '+3333333333',
                address: '333 Test Road, Test City, TC 33333',
                role: ENUM_USER_ROLE.USER,
            },
            {
                firstName: 'Diana',
                lastName: 'Davis',
                email: 'diana@test.com',
                phoneNumber: '+4444444444',
                address: '444 Test Lane, Test City, TC 44444',
                role: ENUM_USER_ROLE.USER,
            },
            {
                firstName: 'Eve',
                lastName: 'Miller',
                email: 'eve@test.com',
                phoneNumber: '+5555555555',
                address: '555 Test Drive, Test City, TC 55555',
                role: ENUM_USER_ROLE.USER,
            },
        ];

        try {
            const createdUsers = [];

            for (const userData of testUsers) {
                // Check if user already exists
                const existingUser = await this.userRepository.findByEmail(
                    userData.email,
                );
                if (existingUser) {
                    console.log(
                        `User ${userData.email} already exists. Skipping.`,
                    );
                    continue;
                }

                const user = await this.userService.create({
                    ...userData,
                    password: defaultPassword,
                    avatar: '',
                });

                // Mark email as verified
                await this.userRepository.updateOneById(
                    new Types.ObjectId(user._id),
                    {
                        isEmailVerified: true,
                    },
                );

                createdUsers.push(user);
            }

            console.log(
                `✅ Created ${createdUsers.length} test users successfully!`,
            );
            console.log('🔑 Password for all users: Test@123');
            console.log('📧 Test emails:');
            testUsers.forEach(user => {
                console.log(`   - ${user.email}`);
            });
        } catch (error) {
            console.error('❌ Error seeding test users:', error);
            throw error;
        }
    }
}
