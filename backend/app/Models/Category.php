<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    // Các thuộc tính có thể gán hàng loạt
    protected $fillable = [
        'user_id',
        'name',
        'type',
        'color',
    ];

    /**
     * Quan hệ: Category thuộc về một User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Quan hệ: Category có nhiều Goal
     */
    public function goals()
    {
        return $this->hasMany(Goal::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}