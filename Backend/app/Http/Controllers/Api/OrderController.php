<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request) {
        $q = Order::with('items')->orderByDesc('created_at');
        if ($request->user()->role === 'customer') $q->where('user_id', $request->user()->id);
        if ($request->user()->role === 'division_admin') $q->where('division_id', $request->user()->division_id);
        return response()->json(['success' => true, 'data' => $q->paginate(20)]);
    }
    public function show(Request $request, $id) {
        $order = Order::with('items')->findOrFail($id);
        if ($request->user()->role === 'customer' && $order->user_id !== $request->user()->id) abort(403);
        if ($request->user()->role === 'division_admin' && $order->division_id !== $request->user()->division_id) abort(403);
        return response()->json(['success' => true, 'data' => $order]);
    }
    public function store(Request $request) {
        $data = $request->validate(['division_id' => 'required', 'items' => 'required|array|min:1', 'shipping_address' => 'required|array', 'payment_method' => 'required']);
        $subtotal = collect($data['items'])->sum(fn($i) => $i['price'] * $i['quantity']);
        $order = Order::create([
            'id' => (string) Str::uuid(), 'user_id' => $request->user()->id,
            'division_id' => $data['division_id'], 'subtotal' => $subtotal,
            'tax' => $subtotal * 0.075, 'shipping' => $subtotal > 50000 ? 0 : 2000,
            'total' => $subtotal * 1.075 + ($subtotal > 50000 ? 0 : 2000),
            'payment_method' => $data['payment_method'], 'shipping_address' => $data['shipping_address'],
            'billing_address' => $data['shipping_address'] ?? null,
        ]);
        foreach ($data['items'] as $item) {
            $order->items()->create(['id' => (string) Str::uuid(), 'order_id' => $order->id] + $item);
        }
        return response()->json(['success' => true, 'data' => $order->load('items')], 201);
    }
    public function update(Request $request, $id) {
        $order = Order::findOrFail($id);
        if ($request->user()->role === 'division_admin' && $order->division_id !== $request->user()->division_id) abort(403);
        $order->update($request->only(['status', 'payment_status']));
        return response()->json(['success' => true, 'data' => $order->fresh()]);
    }
}
