<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request) {
        $q = User::query()->select(['id', 'first_name', 'last_name', 'email', 'phone', 'role', 'division_id', 'is_active', 'created_at']);
        // Division admins only see customers + staff of their own division
        if ($request->user()->role === 'division_admin') {
            $q->where(function ($w) use ($request) {
                $w->where('division_id', $request->user()->division_id)
                  ->orWhereIn('role', ['customer', 'staff']);
            });
        }
        return response()->json(['success' => true, 'data' => $q->paginate(20)]);
    }
    public function show(Request $request, $id) {
        $u = User::findOrFail($id);
        if ($request->user()->role === 'division_admin' && $u->division_id !== $request->user()->division_id && !in_array($u->role, ['customer', 'staff'])) abort(403);
        return response()->json(['success' => true, 'data' => $u]);
    }
    public function store(Request $request) {
        $data = $request->validate([
            'first_name' => 'required', 'last_name' => 'required', 'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8', 'role' => 'required|in:division_admin,customer,staff', 'division_id' => 'nullable|exists:divisions,id',
        ]);
        // Only super admins may create division admins, and only inside their own division otherwise
        if ($data['role'] === 'division_admin' && $request->user()->role !== 'super_admin') abort(403, 'Only super admin may create division admins');
        if ($request->user()->role === 'division_admin') $data['division_id'] = $request->user()->division_id;
        $data['password'] = Hash::make($data['password']);
        return response()->json(['success' => true, 'data' => User::create($data)], 201);
    }
    public function update(Request $request, $id) {
        $u = User::findOrFail($id);
        if ($u->role === 'super_admin' && $request->user()->id !== $u->id) abort(403, 'Super admins are managed by super admins');
        if ($request->user()->role === 'division_admin' && $u->division_id !== $request->user()->division_id) abort(403);
        if ($request->has('password')) $request->merge(['password' => Hash::make($request->password)]);
        $u->update($request->only(['first_name', 'last_name', 'phone', 'is_active', 'password']));
        return response()->json(['success' => true, 'data' => $u->fresh()]);
    }
}
