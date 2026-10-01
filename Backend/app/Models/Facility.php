<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Facility extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'slug', 'description', 'short_description', 'images', 'division_id', 'icon', 'is_active', 'requires_booking'];
    protected $casts = ['images' => 'array', 'is_active' => 'boolean', 'requires_booking' => 'boolean'];

    public function division() { return $this->belongsTo(Division::class); }
}
