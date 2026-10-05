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
        'minPoints',
        'maxPoints',
        'is_published',
        'user_id',
    ];

    protected $casts = [
        'content' => 'array',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function testAttempts()
    {
        return $this->hasMany(TestAttempt::class);
    }

    public function getFormattedCreatedAtAttribute(): ?string
    {
        if (!$this->created_at) {
            return null;
        }

        return $this->created_at->locale('ru')->translatedFormat('j F Y');
    }

    public function getHasPassedAttribute(): bool
    {
        $user = Auth::user();

        if (!$user || $this->user_id === $user->id) {
            return false;
        }

        return $this->testAttempts()
            ->where('user_id', $user->id)
            ->where('is_passed', true)
            ->exists();
    }
    public function materials()
    {
        return $this->belongsToMany(Material::class, 'test_materials')
            ->withTimestamps();
    }
}
