<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Order extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'division_id', 'status', 'subtotal', 'tax', 'shipping', 'discount', 'total', 'currency', 'payment_status', 'payment_method', 'payment_reference', 'fulfillment', 'receipt', 'shipping_address', 'billing_address', 'notes'];
    protected $casts = ['shipping_address' => 'array', 'billing_address' => 'array'];

    public function user() { return $this->belongsTo(User::class); }
    public function division() { return $this->belongsTo(Division::class); }
    public function items() { return $this->hasMany(OrderItem::class); }
}
