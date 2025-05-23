<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'target_amount',
        'current_amount',
        'contribution_period',
        'contribution_type', // Add this
        'deadline',        // Add this
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}