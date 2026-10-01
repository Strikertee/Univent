<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DailySale extends Model
{
    use HasUuids;

    protected $table = 'daily_sales';

    protected $fillable = ['division_id', 'division_name', 'date', 'item', 'amount', 'entered_by'];

    public function division() { return $this->belongsTo(Division::class); }
}
