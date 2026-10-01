<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Division extends Model
{
    use HasUuids;

    protected $fillable = [
        'name', 'slug', 'description', 'short_description', 'logo',
        'banner_image', 'icon', 'color', 'is_active', 'sort_order', 'admin_id',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function admin() { return $this->belongsTo(User::class, 'admin_id'); }
    public function users() { return $this->hasMany(User::class); }
    public function products() { return $this->hasMany(Product::class); }
    public function rooms() { return $this->hasMany(Room::class); }
    public function facilities() { return $this->hasMany(Facility::class); }
    public function orders() { return $this->hasMany(Order::class); }
    public function bookings() { return $this->hasMany(Booking::class); }
    public function dailySales() { return $this->hasMany(DailySale::class); }
}
