<?php

namespace Database\Seeders;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
////////////////////////////////////////
use App\Models\User;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\Setting; // <-- 1. Import the Setting model here
use App\Enum\RolesEnum;
use App\Enum\PermissionsEnum;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. CREATE INITIAL SYSTEM SETTINGS
        $this->call(SettingSeeder::class);

        // 1. ROLES (Using firstOrCreate to prevent crash if they exist)
        $rootRole    = Role::firstOrCreate(['name' => RolesEnum::Root->value]);
        $adminRole   = Role::firstOrCreate(['name' => RolesEnum::Admin->value]);
        $senseiRole  = Role::firstOrCreate(['name' => RolesEnum::Sensei->value]);
        $gakuseiRole = Role::firstOrCreate(['name' => RolesEnum::Gakusei->value]);

        // 2. PERMISSIONS
        $manageAdminsPermission = Permission::firstOrCreate(['name' => PermissionsEnum::ManageAdmins->value]);
        $manageUsersPermission  = Permission::firstOrCreate(['name' => PermissionsEnum::ManageUsers->value]);
        $assignTasksPermission  = Permission::firstOrCreate(['name' => PermissionsEnum::AssignTasks->value]);
        $completeTasksPermission = Permission::firstOrCreate(['name' => PermissionsEnum::CompleteTasks->value]);

        // 3. SYNC PERMISSIONS (Safe to run multiple times)
        $rootRole->syncPermissions([$manageUsersPermission, $manageAdminsPermission]);
        $adminRole->syncPermissions([$manageUsersPermission]);
        $senseiRole->syncPermissions([$assignTasksPermission]);
        $gakuseiRole->syncPermissions([$completeTasksPermission]);

        // 4. CREATE ROOT USER
        $rootUser = User::firstOrCreate(
            ['email' => 'root@root.com'],
            [
                'name' => 'Root',
                'password' => Hash::make('472e5c58-1c349f-4be8-b6cfgh1-95a74ef275'),
            ]
        );
        if (!$rootUser->hasRole(RolesEnum::Root)) {
            $rootUser->assignRole(RolesEnum::Root);
        }

        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'admin',
                'password' => Hash::make('admin'),
            ]
        );
        if (!$admin->hasRole(RolesEnum::Admin)) {
            $admin->assignRole(RolesEnum::Admin);
        }

        // Create users with staggered timestamps (1 millisecond apart)
        for ($i = 0; $i < 48; $i++) {
            User::factory()->create();
            usleep(1000);
        }

        // Create global tests with staggered timestamps
        for ($i = 0; $i < 100; $i++) {
            Test::factory()->create();
            usleep(1000);
        }

        for ($i = 0; $i < 100; $i++) {
            Test::factory()->create([
                'user_id' => $admin->id,
            ]);
            usleep(1000);
        }

        // Generate 20 safe, progressive attempts for the root user with staggered timestamps
        for ($i = 0; $i < 20; $i++) {
            TestAttempt::factory()
                ->forRandomExistingTest($rootUser)
                ->create([
                    'created_at' => now()->subMinutes(20 - $i),
                    'updated_at' => now()->subMinutes(20 - $i),
                ]);
            usleep(1000);
        }
    }
}
