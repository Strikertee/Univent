<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OrderItem extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['order_id', 'type', 'product_id', 'room_id', 'facility_id', 'quantity', 'price', 'name', 'image', 'metadata'];
    protected $casts = ['metadata' => 'array'];

    public function order() { return $this->belongsTo(Order::class); }
}
