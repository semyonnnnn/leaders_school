<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'stored_name',
        'file_path',
        'file_size',
        'type',
        'img',
    ];

    protected static function booted()
    {
        static::deleted(function ($material) {
            // Check if file exists and delete it
            if ($material->file_path && Storage::disk('public')->exists($material->file_path)) {
                Storage::disk('public')->delete($material->file_path);
            }
        });
    }

    public function tests()
    {
        return $this->belongsToMany(Test::class, 'test_materials')
            ->withTimestamps();
    }
}
