<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_attempts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('test_id')->constrained()->cascadeOnDelete();

            // Which attempt this is for this user/test pair — 1, 2, or 3.
            // The 3-attempt cap is enforced in TestEvaluationService
            // (MAX_ATTEMPTS), not here; the DB just stores whatever number
            // it's given.
            $table->unsignedTinyInteger('attempt');

            // Whether THIS attempt's score met the passing bar — not
            // "has the user ever passed" (that's derived separately by
            // looking at their latest row, since latest attempt decides
            // overall pass/fail per your earlier rule).
            $table->boolean('has_passed');

            // Per-question breakdown for this single attempt (one object,
            // not an array of attempts) — question text, user's answer,
            // correct answer, is_correct, and each question's point value.
            $table->json('content');
            $table->unsignedTinyInteger('user_points');

            // 1-5 grade for this attempt, computed from earned/possible
            // points percentage in TestEvaluationService.
            $table->unsignedTinyInteger('percent');
            $table->unsignedTinyInteger('grade');

            $table->timestamps();

            // One row per attempt number per user/test pair — prevents
            // two rows both claiming to be "attempt 2" for the same test.
            $table->unique(['user_id', 'test_id', 'attempt']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_attempts');
    }
};
