<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Test extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'content',

        'questions_count',
        'minPoints',
        'maxPoints',

        'is_published',
        'user_id',
    ];

    protected $casts = [
        'content' => 'array',
    ];

    // Automatically append these computed attributes whenever the model is serialized
    protected $appends = ['is_owner', 'has_passed'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function passedUsers()
    {
        return $this->belongsToMany(User::class, 'test_user')
            ->withTimestamps();
    }
    public function testAttempts()
    {
        return $this->hasMany(TestAttempt::class);
    }

    // Override the default created_at attribute to return the localized Russian string directly
    public function getCreatedAtAttribute($value)
    {
        if (!$value) {
            return null;
        }

        return \Carbon\Carbon::parse($value)->translatedFormat('j F Y', 'ru');
    }

    // Accessor: Check if the currently authenticated user owns this test
    public function getIsOwnerAttribute(): bool
    {
        return Auth::id() === $this->user_id;
    }

    // Accessor: Check if a non-owner has already completed this test
    public function getHasPassedAttribute(): bool
    {
        $user = Auth::user();

        if (!$user || $this->is_owner) {
            return false;
        }

        return $this->passedUsers()->where('user_id', $user->id)->exists();
    }
}
