<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    protected $fillable = [
        'name',
        'type',
        'category_id',
        'target_amount',
        'due_date',
        'note'
        
    ];

    public function category()
    {
        return $this->belongsTo(Goal::class);
    }


}
