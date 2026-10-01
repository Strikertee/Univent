<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'firstName' => 'required|string|max:100',
            'lastName' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:30',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password' => Hash::make($data['password']),
            'role' => 'customer',
        ]);

        $token = $user->createToken('web')->plainTextToken;

        return response()->json(['success' => true, 'data' => ['user' => $user, 'token' => $token]]);
    }

    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials'], 422);
        }

        $token = $user->createToken('web')->plainTextToken;
        return response()->json(['success' => true, 'data' => ['user' => $user, 'token' => $token]]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true]);
    }

    public function profile(Request $request)
    {
        return response()->json(['success' => true, 'data' => ['user' => $request->user()]]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $user->update($request->only(['first_name', 'last_name', 'phone']));
        return response()->json(['success' => true, 'data' => ['user' => $user->fresh()]]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        // TODO: send reset link via mail
        return response()->json(['success' => true, 'message' => 'Reset link sent if email exists']);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|min:8|confirmed', 'token' => 'required']);
        $user = User::where('email', $data['email'])->firstOrFail();
        $user->update(['password' => Hash::make($data['password'])]);
        return response()->json(['success' => true]);
    }
}
