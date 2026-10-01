<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class User extends Authenticatable
{
    use HasApiTokens, HasUuids;

    protected $fillable = [
        'first_name', 'last_name', 'email', 'phone', 'password',
        'role', 'division_id', 'avatar', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['is_active' => 'boolean'];

    public function division() { return $this->belongsTo(Division::class); }
    public function orders() { return $this->hasMany(Order::class); }
    public function bookings() { return $this->hasMany(Booking::class); }

    public function isSuperAdmin(): bool { return $this->role === 'super_admin'; }
    public function isDivisionAdmin(): bool { return $this->role === 'division_admin'; }
    public function managesDivision(string $divisionId): bool {
        return $this->isSuperAdmin() || ($this->isDivisionAdmin() && $this->division_id === $divisionId);
    }
}
