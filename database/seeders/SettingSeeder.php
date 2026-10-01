<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'passing_threshold_percentage' => '0.8',
            'grading_scale' => '{"5":95,"4":80,"3":60,"2":40,"1":0}',
            'max_attempts' => '2',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
