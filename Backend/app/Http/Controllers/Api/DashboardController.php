<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Booking;
use App\Models\DailySale;
use App\Models\Division;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request) {
        $user = $request->user();
        $isSuper = $user->role === 'super_admin';
        $divId = $user->division_id;

        $orders = Order::query()->when(!$isSuper, fn($q) => $q->where('division_id', $divId));
        $orderRevenue = (clone $orders)->sum('total');

        $bookings = Booking::query()->when(!$isSuper, fn($q) => $q->where('division_id', $divId));
        $verifiedRevenue = (clone $bookings)
            ->where('status', 'approved')->where('payment_status', 'confirmed')->sum('total');

        $sales = DailySale::query()->when(!$isSuper, fn($q) => $q->where('division_id', $divId));
        $salesRevenue = (clone $sales)->sum('amount');

        $byDivision = [];
        if ($isSuper) {
            foreach (Division::orderBy('sort_order')->get() as $d) {
                $byDivision[] = [
                    'division_id' => $d->id,
                    'division' => $d->name,
                    'orders' => Order::where('division_id', $d->id)->sum('total'),
                    'bookings' => Booking::where('division_id', $d->id)->where('status', 'approved')->where('payment_status', 'confirmed')->sum('total'),
                    'sales' => DailySale::where('division_id', $d->id)->sum('amount'),
                ];
            }
        }

        return response()->json(['success' => true, 'data' => [
            'grand_total' => $orderRevenue + $verifiedRevenue + $salesRevenue,
            'orders_revenue' => $orderRevenue,
            'orders_count' => (clone $orders)->count(),
            'bookings_revenue' => $verifiedRevenue,
            'bookings_count' => (clone $bookings)->count(),
            'sales_revenue' => $salesRevenue,
            'sales_count' => (clone $sales)->count(),
            'by_division' => $byDivision,
        ]]);
    }
}
