<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Product extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'slug', 'description', 'short_description', 'price', 'original_price', 'images', 'category_id', 'division_id', 'sku', 'stock', 'is_active', 'is_featured', 'tags', 'specifications'];
    protected $casts = ['images' => 'array', 'tags' => 'array', 'specifications' => 'array', 'is_active' => 'boolean', 'is_featured' => 'boolean'];

    public function division() { return $this->belongsTo(Division::class); }
    public function category() { return $this->belongsTo(Category::class); }
}
