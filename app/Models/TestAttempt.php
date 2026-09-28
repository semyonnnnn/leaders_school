<?php

namespace App\Models;

use App\Models\Test;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestAttempt extends Model
{
    /** @use HasFactory<\Database\Factories\TestAttemptFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'test_id',
        'attempt',

        'has_passed',
        'content',

        'user_points',
        'percent',
        'grade',
    ];

    protected $casts = [
        'content' => 'array',
        'has_passed' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function test()
    {
        return $this->belongsTo(Test::class);
    }
}
