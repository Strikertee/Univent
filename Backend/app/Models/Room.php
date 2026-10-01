<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Room extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'slug', 'description', 'short_description', 'price', 'original_price', 'images', 'category_id', 'division_id', 'capacity', 'bed_type', 'bed_size', 'amenities', 'features', 'is_active', 'is_featured', 'total_rooms', 'available_rooms'];
    protected $casts = ['images' => 'array', 'amenities' => 'array', 'features' => 'array', 'is_active' => 'boolean', 'is_featured' => 'boolean'];

    public function division() { return $this->belongsTo(Division::class); }
    public function bookings() { return $this->hasMany(Booking::class); }

    /** Rooms left after subtracting bookings holding one (mirrors frontend getAvailableRooms). */
    public function availableNow(): int
    {
        $held = $this->bookings()
            ->where('status', '!=', 'cancelled')
            ->whereIn('payment_status', ['awaiting_confirmation', 'confirmed'])
            ->count();
        return max(0, $this->total_rooms - $held);
    }
}
