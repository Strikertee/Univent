<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoomController extends Controller
{
    public function index(Request $request) {
        $q = Room::query()->where('is_active', true);
        if ($request->divisionId) $q->where('division_id', $request->divisionId);
        if ($request->search) $q->where('name', 'like', "%{$request->search}%");
        if ($request->maxPrice) $q->where('price', '<=', $request->maxPrice);
        return response()->json(['success' => true, 'data' => $q->get()]);
    }
    public function show($slug) {
        return response()->json(['success' => true, 'data' => Room::where('slug', $slug)->firstOrFail()]);
    }
    public function availability($id, Request $request) {
        $room = Room::findOrFail($id);
        $booked = Booking::where('room_id', $id)
            ->where('status', '!=', 'cancelled')
            ->where('check_in', '<', $request->checkOut)
            ->where('check_out', '>', $request->checkIn)->count();
        return response()->json(['success' => true, 'data' => ['available' => max(0, $room->available_rooms - $booked), 'total' => $room->total_rooms]]);
    }
    public function store(Request $request) {
        $data = $request->validate(['name' => 'required', 'slug' => 'required|unique:rooms,slug', 'price' => 'required|numeric', 'division_id' => 'required', 'category_id' => 'required']);
        $data['id'] = (string) Str::uuid();
        return response()->json(['success' => true, 'data' => Room::create($data)]);
    }
    public function update(Request $request, $id) {
        $room = Room::findOrFail($id);
        $this->scopeDivision($request, $room->division_id);
        $room->update($request->all());
        return response()->json(['success' => true, 'data' => $room->fresh()]);
    }
    private function scopeDivision($request, $divisionId) {
        if ($request->user()->role === 'division_admin' && $request->user()->division_id !== $divisionId) {
            abort(403, 'Forbidden: not your division');
        }
    }
}
