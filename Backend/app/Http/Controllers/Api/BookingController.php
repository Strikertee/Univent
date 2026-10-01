<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function index(Request $request) {
        $q = Booking::with('room')->orderByDesc('created_at');
        if ($request->user()->role === 'customer') $q->where('user_id', $request->user()->id);
        if ($request->user()->role === 'division_admin') $q->where('division_id', $request->user()->division_id);
        return response()->json(['success' => true, 'data' => $q->paginate(20)]);
    }
    public function store(Request $request) {
        $data = $request->validate([
            'room_id' => 'required|exists:rooms,id', 'check_in' => 'required|date|after:today',
            'check_out' => 'required|date|after:check_in', 'guests' => 'integer|min:1',
            'first_name' => 'required', 'last_name' => 'required', 'email' => 'required|email', 'phone' => 'required',
        ]);
        $room = Room::findOrFail($data['room_id']);
        $nights = Carbon::parse($data['check_in'])->diffInDays(Carbon::parse($data['check_out']));
        $subtotal = $room->price * max(1, $nights);
        $booking = Booking::create([
            'id' => (string) Str::uuid(), 'user_id' => $request->user()->id ?? null,
            'room_id' => $room->id, 'division_id' => $room->division_id,
            'check_in' => $data['check_in'], 'check_out' => $data['check_out'],
            'guests' => $data['guests'] ?? 2, 'total_nights' => $nights,
            'price_per_night' => $room->price, 'subtotal' => $subtotal,
            'tax' => $subtotal * 0.075, 'total' => $subtotal * 1.075, 'status' => 'pending',
        ]);
        return response()->json(['success' => true, 'data' => $booking], 201);
    }
    public function update(Request $request, $id) {
        $b = Booking::findOrFail($id);
        if ($request->user()->role === 'division_admin' && $request->user()->division_id !== $b->division_id) abort(403);
        $b->update($request->only(['status', 'payment_status']));
        return response()->json(['success' => true, 'data' => $b->fresh()]);
    }
}
