<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Booking extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'room_id', 'division_id', 'check_in', 'check_out', 'guests', 'adults', 'children', 'total_nights', 'price_per_night', 'subtotal', 'tax', 'total', 'method', 'status', 'payment_status', 'room_number', 'receipt', 'verified_at', 'special_requests'];

    public function user() { return $this->belongsTo(User::class); }
    public function room() { return $this->belongsTo(Room::class); }
    public function division() { return $this->belongsTo(Division::class); }

    /** A booking holds a room only while payment is unconfirmed-but-submitted or confirmed. */
    public function holdsRoom(): bool
    {
        return $this->status !== 'cancelled'
            && in_array($this->payment_status, ['awaiting_confirmation', 'confirmed'], true);
    }
}
