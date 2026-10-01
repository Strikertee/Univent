<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Category extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'slug', 'description', 'image', 'division_id', 'is_active', 'sort_order'];
    protected $casts = ['is_active' => 'boolean'];

    public function division() { return $this->belongsTo(Division::class); }
}
