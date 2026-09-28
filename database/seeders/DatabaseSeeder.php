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

        // 5. CREATE ALINA (ADMIN)
        $Alina = User::firstOrCreate(
            ['email' => 'alina@alina.com'],
            [
                'name' => 'Alina',
                'password' => Hash::make('doch_sergeya'),
            ]
        );
        if (!$Alina->hasRole(RolesEnum::Admin)) {
            $Alina->assignRole(RolesEnum::Admin);
        }
        User::factory()->count(48)->create();

        Test::factory()->count(100)->create();
        Test::factory()->count(100)->create([
            'user_id' => $Alina->id,
        ]);

        // Generate 20 safe, progressive attempts for the root user one by one
        for ($i = 0; $i < 20; $i++) {
            TestAttempt::factory()
                ->forRandomExistingTest($rootUser)
                ->create();
        }
    }
}
